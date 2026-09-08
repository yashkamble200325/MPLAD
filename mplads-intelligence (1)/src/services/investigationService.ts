import { supabase } from '../lib/supabase';
import {
  InvestigationCase,
  InvestigationStatus,
  InvestigationPriority,
  MaharashtraDistrict,
  RiskLevel,
  ClarificationThread,
  InvestigationNote,
} from '../types';

export const investigationService = {
  /**
   * Fetches all investigations from Supabase with relational requests, responses, notes, projects, and users
   */
  async fetchInvestigations(): Promise<InvestigationCase[]> {
    const [invResult, userResult, notesResult] = await Promise.all([
      supabase
        .from('investigations')
        .select(`
          *,
          projects (
            id,
            project_id,
            project_name,
            district
          ),
          investigation_requests (
            id,
            request_type,
            request_text,
            status,
            due_date,
            created_at,
            investigation_responses (
              id,
              response_text,
              document_path,
              responded_by,
              created_at
            )
          )
        `)
        .order('created_at', { ascending: false }),
      supabase.from('users').select('id, full_name, email, role'),
      supabase.from('investigation_notes').select('*').order('created_at', { ascending: true }),
    ]);

    const { data: dbInvs, error: invErr } = invResult;
    const { data: dbUsers, error: userErr } = userResult;
    const { data: dbNotes, error: notesErr } = notesResult;

    if (invErr) {
      console.error('Error fetching investigations from Supabase:', invErr);
      throw invErr;
    }

    if (userErr) {
      console.warn('Could not fetch users mapping for investigations:', userErr);
    }

    if (notesErr) {
      console.warn('Could not fetch investigation_notes from Supabase:', notesErr);
    }

    if (!dbInvs || dbInvs.length === 0) return [];

    // Map users by id for fast assigned_to lookup
    const usersById = new Map<string, any>();
    (dbUsers || []).forEach((u: any) => {
      usersById.set(u.id, u);
    });

    // Map notes by investigation UUID
    const notesByInvId = new Map<string, any[]>();
    (dbNotes || []).forEach((n: any) => {
      const list = notesByInvId.get(n.investigation_id) || [];
      list.push(n);
      notesByInvId.set(n.investigation_id, list);
    });

    return dbInvs.map((inv: any) => {
      const proj = inv.projects;
      const assignedUser = inv.assigned_to ? usersById.get(inv.assigned_to) : null;
      const requests = inv.investigation_requests || [];

      // Parse risk score from reason text if available
      let riskScore = 85;
      const scoreMatch = inv.reason?.match(/risk score of ([0-9.]+)/i);
      if (scoreMatch && scoreMatch[1]) {
        riskScore = Math.round(parseFloat(scoreMatch[1]));
      }

      const priority: InvestigationPriority =
        inv.priority === 'Critical' ? 'Critical' : 'High';
      const riskLevel: RiskLevel = priority === 'Critical' ? 'CRITICAL' : 'HIGH';

      // Map status
      let status: InvestigationStatus = 'In Progress';
      if (inv.status === 'Resolved') status = 'Resolved';
      else if (inv.status === 'Further Investigation' || inv.status === 'Further Review Required')
        status = 'Further Review Required';
      else if (inv.status === 'Verified') status = 'Verified';
      else if (inv.status === 'False Positive') status = 'False Positive';
      else if (inv.status === 'Clarification Requested') status = 'Clarification Requested';
      else if (inv.status === 'Clarification Received' || inv.status === 'Human Review')
        status = 'Human Review';
      else if (inv.status === 'Assigned') status = 'Assigned';
      else status = 'In Progress';

      // Build Clarification Threads from investigation_requests and responses
      const clarifications: ClarificationThread[] = requests.map((req: any) => {
        const resp = req.investigation_responses?.[0];
        return {
          id: req.id,
          query: req.request_text,
          queriedBy: 'Audit & Oversight Cell',
          queryDate: req.created_at ? req.created_at.split('T')[0] : '2026-02-18',
          response: resp?.response_text,
          respondedBy: 'District Implementing Authority - Pune',
          responseDate: resp?.created_at ? resp.created_at.split('T')[0] : undefined,
          supportingDocumentName: resp?.document_path || (resp ? 'Official Measurement Book Extract (Verified)' : undefined),
          status: req.status === 'Responded' || !!resp ? 'Responded' : 'Pending',
        };
      });

      // AI Findings from reason breakdown
      const aiFindings: string[] = [];
      if (inv.reason) {
        const parts = inv.reason.split('. ').map((s: string) => s.trim()).filter(Boolean);
        parts.forEach((p: string) => {
          const clean = p.endsWith('.') ? p : `${p}.`;
          if (!clean.toLowerCase().includes('investigation initiated because')) {
            aiFindings.push(clean);
          }
        });
      }
      if (aiFindings.length === 0) {
        aiFindings.push('Unusual expenditure velocity detected against certified physical progress.');
        aiFindings.push('Contractor payment pattern warrants verification with measurement book records.');
      }

      // Notes: mapped directly from investigation_notes table
      const rawCaseNotes = notesByInvId.get(inv.id) || [];
      const notes: InvestigationNote[] = rawCaseNotes.map((n: any) => {
        const author = usersById.get(n.author_id);
        return {
          id: n.id,
          author: author?.full_name || 'Statutory Auditor',
          role: author?.role || 'AUDITOR_INVESTIGATOR',
          date: n.created_at ? n.created_at.split('T')[0] : '2026-02-18',
          note: n.note,
        };
      });

      if (inv.resolution && !notes.some((n) => n.note.includes(inv.resolution))) {
        notes.push({
          id: `NOTE-${inv.id.substring(0, 6)}`,
          author: assignedUser?.full_name || 'Audit Officer',
          role: 'Statutory Auditor',
          date: inv.updated_at ? inv.updated_at.split('T')[0] : '2026-02-20',
          note: `Resolution Determination: ${inv.resolution}`,
        });
      }

      // Timeline entries
      const timeline = [
        {
          title: 'Investigation Initiated by AI Surveillance',
          date: inv.created_at ? inv.created_at.split('T')[0] : '2026-02-16',
          actor: 'State Automated Monitoring Engine',
          description: inv.reason || 'Critical risk pattern detected exceeding supervisory thresholds.',
        },
      ];

      if (inv.assigned_at) {
        timeline.push({
          title: `Assigned to ${assignedUser?.full_name || 'Audit Officer'}`,
          date: inv.assigned_at.split('T')[0],
          actor: 'State Monitoring Officer',
          description: 'Formal audit dossier dispatched for statutory inquiry and field inspection.',
        });
      }

      requests.forEach((req: any) => {
        timeline.push({
          title: `Clarification Issued: ${req.request_type || 'Formal Notice'}`,
          date: req.created_at ? req.created_at.split('T')[0] : '2026-02-18',
          actor: 'Senior Auditor',
          description: req.request_text,
        });

        if (req.investigation_responses?.[0]) {
          const r = req.investigation_responses[0];
          timeline.push({
            title: 'District Authority Rejoinder Received',
            date: r.created_at ? r.created_at.split('T')[0] : '2026-02-19',
            actor: 'District Implementing Cell',
            description: r.response_text,
          });
        }
      });

      return {
        id: inv.investigation_number || `INV-${inv.id.substring(0, 8).toUpperCase()}`,
        projectId: proj?.project_id || inv.project_id,
        projectName: proj?.project_name || 'Public Works Scheme',
        title: inv.title || `Investigation - ${proj?.project_name || 'Infrastructure Work'}`,
        district: (proj?.district as MaharashtraDistrict) || 'Pune',
        riskScore,
        riskLevel,
        assignedTo: assignedUser?.full_name || 'Audit Officer',
        priority,
        createdAt: inv.created_at ? inv.created_at.split('T')[0] : '2026-02-16',
        dueDate: inv.due_date || '2026-03-15',
        reason: inv.reason,
        status,
        aiFindings,
        notes,
        clarifications,
        evidences: [
          {
            id: `EVID-${inv.id.substring(0, 6)}-01`,
            title: 'Site Measurement Book (MB Extract)',
            uploadedBy: 'District Implementing Cell',
            uploadedDate: '2026-02-19',
            fileType: 'PDF Document',
            size: '2.4 MB',
            verified: true,
            notes: 'Demo document reference: certified by Executive Engineer',
          },
        ],
        resolutionSummary: inv.resolution,
        resolvedAt: inv.resolved_at,
        timeline,
      };
    });
  },

  /**
   * Resolves an investigation UUID from an investigation number or UUID
   */
  async resolveInvestigationUuid(idOrNumber: string): Promise<string | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);
    if (isUuid) return idOrNumber;

    const { data } = await supabase
      .from('investigations')
      .select('id')
      .eq('investigation_number', idOrNumber)
      .limit(1);

    return data?.[0]?.id || null;
  },

  /**
   * Adds an investigation note to the investigation_notes table in Supabase
   */
  async addInvestigationNote(
    investigationIdOrNumber: string,
    noteText: string,
    authorId?: string
  ): Promise<void> {
    const invUuid = await this.resolveInvestigationUuid(investigationIdOrNumber);
    if (!invUuid) {
      console.warn('Could not resolve investigation UUID for note insertion:', investigationIdOrNumber);
      return;
    }

    let resolvedAuthorId = authorId;
    if (!resolvedAuthorId) {
      const { data: users } = await supabase.from('users').select('id').limit(1);
      resolvedAuthorId = users?.[0]?.id || '84aed0e5-f3de-4ded-81a4-a4a8219e6c0b';
    }

    const { error } = await supabase.from('investigation_notes').insert({
      investigation_id: invUuid,
      author_id: resolvedAuthorId,
      note: noteText,
    });

    if (error) {
      console.error('Error inserting investigation note into Supabase:', error);
    }
  },

  /**
   * Creates a formal clarification request in investigation_requests table
   */
  async createInvestigationRequest(
    investigationIdOrNumber: string,
    requestType: string,
    requestText: string,
    dueDate?: string
  ): Promise<string | null> {
    const invUuid = await this.resolveInvestigationUuid(investigationIdOrNumber);
    if (!invUuid) return null;

    const { data, error } = await supabase
      .from('investigation_requests')
      .insert({
        investigation_id: invUuid,
        request_type: requestType || 'Document Verification',
        request_text: requestText,
        status: 'Pending',
        due_date: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating investigation request:', error);
      return null;
    }

    // Update parent status to 'Clarification Requested'
    await supabase.from('investigations').update({
      status: 'Clarification Requested',
      updated_at: new Date().toISOString(),
    }).eq('id', invUuid);

    return data?.id || null;
  },

  /**
   * Updates investigation determination or status in Supabase
   */
  async updateInvestigation(
    investigationIdOrNumber: string,
    updates: {
      status?: string;
      resolution_type?: string;
      resolution?: string;
      resolved_at?: string | null;
      priority?: string;
      assigned_to?: string;
    }
  ): Promise<void> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(investigationIdOrNumber);
    let query = supabase.from('investigations').update({
      ...updates,
      updated_at: new Date().toISOString(),
    });

    if (isUuid) {
      await query.eq('id', investigationIdOrNumber);
    } else {
      await query.eq('investigation_number', investigationIdOrNumber);
    }
  },

  /**
   * Creates a new investigation in Supabase
   */
  async createInvestigation(caseData: {
    projectId: string;
    title?: string;
    reason: string;
    priority?: string;
    dueDate?: string;
    assignedTo?: string;
  }): Promise<string | null> {
    // Resolve project UUID if code was passed
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseData.projectId);
    let projectUuid = caseData.projectId;
    if (!isUuid) {
      const { data: projs } = await supabase.from('projects').select('id').eq('project_id', caseData.projectId).limit(1);
      if (projs && projs[0]) projectUuid = projs[0].id;
    }

    // Resolve assigned user UUID if name was passed
    let assignedUserId: string | null = null;
    if (caseData.assignedTo) {
      const { data: users } = await supabase.from('users').select('id, full_name');
      const matched = users?.find(u => u.full_name?.toLowerCase().includes(caseData.assignedTo!.toLowerCase()));
      if (matched) assignedUserId = matched.id;
    }

    const nextInvNumber = `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const { data, error } = await supabase.from('investigations').insert({
      project_id: projectUuid,
      investigation_number: nextInvNumber,
      title: caseData.title || `Investigation Docket - ${nextInvNumber}`,
      reason: caseData.reason,
      priority: caseData.priority || 'High',
      status: 'In Progress',
      assigned_to: assignedUserId,
      assigned_at: new Date().toISOString(),
      due_date: caseData.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    }).select('id, investigation_number').single();

    if (error) {
      console.error('Error creating investigation in Supabase:', error);
      return null;
    }

    return data?.investigation_number || nextInvNumber;
  },

  /**
   * Submits a response to an investigation request from District Authority
   */
  async submitInvestigationResponse(
    requestId: string,
    responseText: string,
    documentPath: string = 'documents/demo_response_records.pdf',
    respondedBy?: string
  ): Promise<void> {
    // 1. Get default district user if not provided
    let userUuid = respondedBy;
    if (!userUuid) {
      const { data: users } = await supabase.from('users').select('id, role').eq('role', 'District Authority').limit(1);
      userUuid = users?.[0]?.id || 'fae8cee2-72b1-4c3e-a8c2-381fd383a258';
    }

    // 2. Insert into investigation_responses
    const { error: insertErr } = await supabase.from('investigation_responses').insert({
      request_id: requestId,
      response_text: responseText,
      document_path: documentPath,
      responded_by: userUuid,
    });

    if (insertErr) {
      console.error('Error inserting investigation response:', insertErr);
    }

    // 3. Mark request as Responded
    const { error: reqErr } = await supabase
      .from('investigation_requests')
      .update({ status: 'Responded' })
      .eq('id', requestId);

    if (reqErr) {
      console.warn('Error updating investigation_request status:', reqErr);
    }
  }
};
