import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Project,
  AlertItem,
  InvestigationCase,
  DuplicatePair,
  UserAccount,
  NotificationItem,
  SystemSettingsConfig,
  RiskWeights,
  RiskFactorScores,
  RiskLevel,
  EvidenceItem,
  InvestigationNote,
  MaharashtraDistrict,
  InvestigationPriority,
  InvestigationStatus,
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_ALERTS,
  INITIAL_INVESTIGATIONS,
  INITIAL_DUPLICATE_PAIRS,
  INITIAL_USERS,
  INITIAL_NOTIFICATIONS,
  DEFAULT_SYSTEM_SETTINGS,
} from '../data/mockData';
import { riskEngine } from '../services/ml/riskEngine';
import type { ComprehensiveAIAnalysis } from '../types';
import { projectService } from '../services/projectService';
import { alertService } from '../services/alertService';
import { investigationService } from '../services/investigationService';
import { riskService } from '../services/riskService';
import { userService } from '../services/userService';

export function calculateRiskScore(
  factors: RiskFactorScores,
  weights: RiskWeights
): { score: number; level: RiskLevel } {
  const totalWeight =
    weights.costAnomaly +
    weights.paymentAnomaly +
    weights.delayAnomaly +
    weights.duplicateSimilarity +
    weights.progressDeviation;

  const weightedSum =
    factors.costAnomaly * weights.costAnomaly +
    factors.paymentAnomaly * weights.paymentAnomaly +
    factors.delayAnomaly * weights.delayAnomaly +
    factors.duplicateSimilarity * weights.duplicateSimilarity +
    factors.progressDeviation * weights.progressDeviation;

  const score = Math.min(100, Math.max(0, Math.round(weightedSum / (totalWeight || 100))));
  let level: RiskLevel = 'LOW';
  if (score >= 80) level = 'CRITICAL';
  else if (score >= 60) level = 'HIGH';
  else if (score >= 40) level = 'MEDIUM';

  return { score, level };
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  // Navigation & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  selectedCaseId: string;
  setSelectedCaseId: (id: string) => void;
  navigateToProject: (id: string) => void;
  navigateToCase: (id: string) => void;

  // Data
  projects: Project[];
  getProjectById: (id: string) => Project | undefined;
  getFilteredProjectsForRole: () => Project[];
  updateProjectProgress: (
    id: string,
    physicalProgress: number,
    expenditure: number,
    remarks?: string
  ) => void;

  alerts: AlertItem[];
  acknowledgeAlert: (alertId: string) => void;
  dismissAlert: (alertId: string, reason?: string) => void;
  createInvestigationFromAlert: (alertId: string, assignedOfficer: string) => void;

  investigations: InvestigationCase[];
  getCaseById: (id: string) => InvestigationCase | undefined;
  createInvestigationCase: (caseData: {
    projectId: string;
    projectName: string;
    district: MaharashtraDistrict;
    riskScore: number;
    riskLevel: RiskLevel;
    reason: string;
    assignedTo: string;
    priority: InvestigationPriority;
    dueDate?: string;
    status?: InvestigationStatus;
  }) => string;
  assignCase: (caseId: string, officerName: string) => void;
  addCaseNote: (caseId: string, noteText: string) => void;
  requestClarification: (caseId: string, queryText: string) => void;
  respondToClarification: (
    caseId: string,
    clarificationId: string,
    responseText: string,
    supportingDocumentName?: string,
    updatedProgress?: { physical: number; expenditure: number }
  ) => void;
  uploadEvidence: (caseId: string, title: string, fileType: string, notes?: string) => void;
  verifyCaseFinding: (caseId: string, notes: string) => void;
  markCaseFalsePositive: (caseId: string, justification: string) => void;
  setCaseDetermination: (
    caseId: string,
    determination: 'Verified' | 'False Positive' | 'Further Review Required',
    summaryNotes: string
  ) => void;
  resolveCase: (caseId: string, summary: string) => void;

  duplicatePairs: DuplicatePair[];
  updateDuplicatePairStatus: (
    pairId: string,
    status: 'Pending Review' | 'Potential Duplicate — Verification Required' | 'Verified Independent Scope' | 'Verified Duplicate'
  ) => void;

  users: UserAccount[];
  userAccounts: UserAccount[];
  addUser: (user: Omit<UserAccount, 'id' | 'lastActive'>) => void;
  updateUser: (id: string, updates: Partial<UserAccount>) => void;
  toggleUserStatus: (id: string) => void;

  settings: SystemSettingsConfig;
  riskWeights: RiskWeights;
  updateRiskWeights: (weights: RiskWeights) => void;
  updateThresholds: (thresholds: SystemSettingsConfig['thresholds']) => void;
  updateNotificationSettings: (notifs: SystemSettingsConfig['notifications']) => void;
  restoreBaseline: () => void;
  resetDemoData: () => void;

  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Search & Global
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Real ML Engine Pipeline
  getProjectAnalysis: (projectId: string) => ComprehensiveAIAnalysis | null;
  recalculateAllRiskScores: () => void;

  // Supabase Data State
  isLoading: boolean;
  supabaseConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROLE: 'mplads_active_role',
  PAGE: 'mplads_current_page',
  PROJECT_ID: 'mplads_selected_project',
  CASE_ID: 'mplads_selected_case',
  PROJECTS: 'mplads_projects_data',
  ALERTS: 'mplads_alerts_data',
  INVESTIGATIONS: 'mplads_investigations_data',
  DUPLICATES: 'mplads_duplicate_pairs',
  USERS: 'mplads_users_data',
  SETTINGS: 'mplads_settings_data',
  NOTIFICATIONS: 'mplads_notifications_data',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Role
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || 'MONITORING_OFFICER';
  });

  // Current Page
  const [currentPage, setCurrentPageState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAGE);
    return saved || 'home';
  });

  // Selected Project
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECT_ID);
    return saved || 'MPLADS-MH-PUN-2026-00482';
  });

  // Selected Case
  const [selectedCaseId, setSelectedCaseId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASE_ID);
    return saved || 'CASE-2026-0042';
  });

  // Settings
  const [settings, setSettings] = useState<SystemSettingsConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved settings', e);
      }
    }
    return DEFAULT_SYSTEM_SETTINGS;
  });

  // Base raw projects with dynamic recalculation based on weights
  const [rawProjects, setRawProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved projects', e);
      }
    }
    return INITIAL_PROJECTS;
  });

  // Dynamic projects with real ML risk analysis based on active statutory risk weights
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      riskEngine.setWeights(settings.riskWeights);
      return riskEngine.evaluateAllProjects(rawProjects, settings.riskWeights);
    } catch (err) {
      console.error('Failed to initialize projects with riskEngine', err);
      return rawProjects;
    }
  });

  useEffect(() => {
    riskEngine.setWeights(settings.riskWeights);
    const updated = riskEngine.evaluateAllProjects(rawProjects, settings.riskWeights);
    setProjects(updated);
  }, [rawProjects, settings.riskWeights]);

  const recalculateAllRiskScores = () => {
    riskEngine.setWeights(settings.riskWeights);
    const updated = riskEngine.evaluateAllProjects(rawProjects, settings.riskWeights);
    setProjects(updated);
    showToast('AI Recalculation Complete', 'All projects re-evaluated across Isolation Forest, XGBoost, and Delay forecasters', 'success');
  };

  const getProjectAnalysis = (projectId: string): ComprehensiveAIAnalysis | null => {
    const target = rawProjects.find((p) => p.id === projectId) || projects.find((p) => p.id === projectId);
    if (!target) return null;
    return riskEngine.evaluateProject(target, projects, settings.riskWeights);
  };

  // Alerts
  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing alerts', e);
      }
    }
    return INITIAL_ALERTS;
  });

  // Investigations
  const [investigations, setInvestigations] = useState<InvestigationCase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVESTIGATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing investigations', e);
      }
    }
    return INITIAL_INVESTIGATIONS;
  });

  // Duplicates
  const [duplicatePairs, setDuplicatePairs] = useState<DuplicatePair[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DUPLICATES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing duplicates', e);
      }
    }
    return INITIAL_DUPLICATE_PAIRS;
  });

  // Users
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing users', e);
      }
    }
    return INITIAL_USERS;
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing notifications', e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Supabase Data State & Auto-Hydration
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSupabaseData() {
      try {
        setIsLoading(true);
        const [dbProjects, dbAlerts, dbInvs, dbUsers, dbSettings] = await Promise.all([
          projectService.fetchProjects(),
          alertService.fetchAlerts(),
          investigationService.fetchInvestigations(),
          userService.fetchUsers(),
          riskService.fetchSystemSettings(),
        ]);

        if (!active) return;

        if (dbProjects && dbProjects.length > 0) {
          setRawProjects(dbProjects);
          const pairs = await riskService.fetchDuplicatePairs(dbProjects);
          setDuplicatePairs(pairs);
          setSupabaseConnected(true);

          // If no active project or selected project not in dataset, pick first
          const currentProjId = localStorage.getItem(STORAGE_KEYS.PROJECT_ID);
          if (!currentProjId || !dbProjects.some(p => p.id === currentProjId)) {
            const highRisk = dbProjects.find(p => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH') || dbProjects[0];
            setSelectedProjectId(highRisk.id);
          }
        }

        if (dbAlerts && dbAlerts.length > 0) {
          setAlerts(dbAlerts);
        }

        if (dbInvs && dbInvs.length > 0) {
          setInvestigations(dbInvs);
          const currentCaseId = localStorage.getItem(STORAGE_KEYS.CASE_ID);
          if (!currentCaseId || !dbInvs.some(c => c.id === currentCaseId)) {
            setSelectedCaseId(dbInvs[0].id);
          }
        }

        if (dbUsers && dbUsers.length > 0) {
          setUsers(dbUsers);
        }

        if (dbSettings) {
          if (dbSettings.weights) {
            setSettings((prev) => ({ ...prev, riskWeights: dbSettings.weights! }));
          }
          if (dbSettings.thresholds) {
            setSettings((prev) => ({ ...prev, thresholds: dbSettings.thresholds! }));
          }
        }
      } catch (err) {
        console.warn('Supabase data load notice (using resilient baseline):', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadSupabaseData();
    return () => {
      active = false;
    };
  }, []);

  // Persist State Changes
  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    showToast('Designation Updated', `Operational role set to ${role.replace('_', ' ')}`, 'info');
  };

  const setCurrentPage = (page: string) => {
    setCurrentPageState(page);
    localStorage.setItem(STORAGE_KEYS.PAGE, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProject = (id: string) => {
    setSelectedProjectId(id);
    localStorage.setItem(STORAGE_KEYS.PROJECT_ID, id);
    setCurrentPage('project-details');
  };

  const navigateToCase = (id: string) => {
    setSelectedCaseId(id);
    localStorage.setItem(STORAGE_KEYS.CASE_ID, id);
    setCurrentPage('investigations');
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(rawProjects));
  }, [rawProjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(investigations));
  }, [investigations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DUPLICATES, JSON.stringify(duplicatePairs));
  }, [duplicatePairs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Toast Helpers
  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'success') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Role based filtering
  const getFilteredProjectsForRole = (): Project[] => {
    if (currentRole === 'DISTRICT_AUTHORITY') {
      // Default district jurisdiction: prioritize Pune if available, else bind to primary dataset district (e.g. Mumbai)
      const puneProjects = projects.filter((p) => p.district === 'Pune');
      if (puneProjects.length > 0) return puneProjects;
      const primaryDistrict = projects[0]?.district || 'Mumbai';
      return projects.filter((p) => p.district === primaryDistrict);
    }
    if (currentRole === 'AUDITOR_INVESTIGATOR') {
      // High-risk and critical priority projects
      return projects.filter((p) => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH' || p.status === 'Under Investigation');
    }
    return projects;
  };

  // Update Project Progress (District Authority action)
  const updateProjectProgress = (
    id: string,
    physicalProgress: number,
    expenditure: number,
    remarks?: string
  ) => {
    setRawProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newFinUtil = Math.round((expenditure / p.sanctionedAmount) * 100);
          return {
            ...p,
            physicalProgress,
            expenditure,
            financialUtilization: newFinUtil,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return p;
      })
    );

    // Persist to Supabase asynchronously
    projectService.updateProjectProgress(id, physicalProgress, expenditure, remarks).catch((err) => {
      console.warn('Supabase project update sync warning:', err);
    });

    // Also push a notification
    const newNotif: NotificationItem = {
      id: 'NOTIF_' + Date.now(),
      title: 'Progress Update Submitted',
      message: `District authority submitted progress update for project ${id}. Physical: ${physicalProgress}%, Exp: ₹${expenditure}L.`,
      type: 'info',
      timestamp: new Date().toLocaleString(),
      read: false,
      targetPage: 'project-details',
      targetProjectId: id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast('Progress Updated', `Project ${id} physical progress set to ${physicalProgress}%`, 'success');
  };

  // Alerts Actions
  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'Acknowledged' } : a))
    );
    alertService.updateAlertStatus(alertId, 'Acknowledged').catch((err) => {
      console.warn('Supabase alert acknowledge sync warning:', err);
    });
    showToast('Alert Acknowledged', `Alert ${alertId} marked as acknowledged by officer`, 'info');
  };

  const dismissAlert = (alertId: string, reason?: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'Resolved' } : a))
    );
    alertService.updateAlertStatus(alertId, 'Resolved').catch((err) => {
      console.warn('Supabase alert resolve sync warning:', err);
    });
    showToast('Alert Dismissed', `Alert ${alertId} has been dismissed (${reason || 'Reviewed'})`, 'info');
  };

  const createInvestigationCase = (caseData: {
    projectId: string;
    projectName: string;
    district: MaharashtraDistrict;
    riskScore: number;
    riskLevel: RiskLevel;
    reason: string;
    assignedTo: string;
    priority: InvestigationPriority;
    dueDate?: string;
    status?: InvestigationStatus;
  }): string => {
    const existingCase = investigations.find((c) => c.projectId === caseData.projectId);
    if (existingCase) {
      showToast('Investigation Exists', `Case ${existingCase.id} is already open for this project`, 'warning');
      navigateToCase(existingCase.id);
      return existingCase.id;
    }

    const newCaseId = `CASE-2026-00${Math.floor(Math.random() * 90) + 50}`;
    const newCase: InvestigationCase = {
      id: newCaseId,
      projectId: caseData.projectId,
      projectName: caseData.projectName,
      district: caseData.district,
      riskScore: caseData.riskScore,
      riskLevel: caseData.riskLevel,
      assignedTo: caseData.assignedTo || 'Dr. Vivek Deshmukh (Auditor)',
      priority: caseData.priority || 'High',
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: caseData.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      reason: caseData.reason,
      status: caseData.status || 'Assigned',
      aiFindings: [
        `Case initiated by officer: ${caseData.reason}`,
        `Initial assessed risk score: ${caseData.riskScore}/100 (${caseData.riskLevel} priority)`,
      ],
      notes: [
        {
          id: 'NOTE_' + Date.now(),
          author: currentRole.replace('_', ' '),
          role: currentRole,
          date: new Date().toLocaleString(),
          note: `Investigation docket created. Reason: ${caseData.reason}. Target completion date: ${caseData.dueDate || '14 days'}.`,
        },
      ],
      clarifications: [],
      evidences: [],
      timeline: [
        {
          title: 'Investigation Initiated',
          date: new Date().toISOString().split('T')[0],
          actor: currentRole.replace('_', ' '),
          description: `Case docket ${newCaseId} created and assigned to ${caseData.assignedTo}.`,
        },
      ],
    };

    setInvestigations((prev) => [newCase, ...prev]);

    // Update project status to 'Under Investigation'
    setRawProjects((prev) =>
      prev.map((p) => (p.id === caseData.projectId ? { ...p, status: 'Under Investigation' } : p))
    );

    // Persist investigation to Supabase
    investigationService.createInvestigation({
      projectId: caseData.projectId,
      title: `Investigation - ${caseData.projectName}`,
      reason: caseData.reason,
      priority: caseData.priority,
      dueDate: caseData.dueDate,
      assignedTo: caseData.assignedTo,
    }).catch((err) => console.warn('Supabase create investigation warning:', err));

    // Notify auditor and monitoring officers
    const newNotif: NotificationItem = {
      id: 'NOTIF_' + Date.now(),
      title: 'New Investigation Case Assigned',
      message: `Case ${newCaseId} opened for ${caseData.projectName} (${caseData.projectId}). Assigned to ${caseData.assignedTo}.`,
      type: 'critical',
      timestamp: new Date().toLocaleString(),
      read: false,
      targetPage: 'investigations',
      targetCaseId: newCaseId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast('Investigation Created', `Case ${newCaseId} opened and assigned to ${caseData.assignedTo}`, 'success');
    navigateToCase(newCaseId);
    return newCaseId;
  };

  const createInvestigationFromAlert = (alertId: string, assignedOfficer: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert) return;

    // Check if case already exists
    const existingCase = investigations.find((c) => c.projectId === alert.projectId);
    if (existingCase) {
      showToast('Investigation Exists', `Case ${existingCase.id} already active for this project`, 'warning');
      navigateToCase(existingCase.id);
      return;
    }

    const newCaseId = `CASE-2026-00${Math.floor(Math.random() * 90) + 50}`;
    const newCase: InvestigationCase = {
      id: newCaseId,
      projectId: alert.projectId,
      projectName: alert.projectName,
      district: alert.district,
      riskScore: alert.riskScore,
      riskLevel: alert.severity,
      assignedTo: assignedOfficer || 'Dr. Vivek Deshmukh (Auditor)',
      priority: alert.severity === 'CRITICAL' ? 'Critical' : 'High',
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      reason: `Escalated from alert ${alertId}: ${alert.riskType}`,
      status: 'Assigned',
      aiFindings: [
        `Automated alert escalation: ${alert.riskType}`,
        alert.description,
      ],
      notes: [
        {
          id: 'NOTE_' + Date.now(),
          author: 'Monitoring Officer',
          role: 'Monitoring Cell',
          date: new Date().toLocaleString(),
          note: `Investigation initiated from alert ${alertId}. Mandate: verify discrepancy between reported and field metrics.`,
        },
      ],
      clarifications: [],
      evidences: [],
      timeline: [
        {
          title: 'Investigation Case Created',
          date: new Date().toISOString().split('T')[0],
          actor: 'Monitoring Officer',
          description: `Case escalated from alert ${alertId} and assigned to ${assignedOfficer}.`,
        },
      ],
    };

    setInvestigations((prev) => [newCase, ...prev]);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'Under Investigation', assignedOfficer } : a))
    );

    // Update project status to 'Under Investigation'
    setRawProjects((prev) =>
      prev.map((p) => (p.id === alert.projectId ? { ...p, status: 'Under Investigation' } : p))
    );

    // Persist investigation to Supabase
    investigationService.createInvestigation({
      projectId: alert.projectId,
      title: `Investigation - ${alert.projectName}`,
      reason: `Escalated from alert ${alertId}: ${alert.riskType}`,
      priority: alert.severity === 'CRITICAL' ? 'Critical' : 'High',
      assignedTo: assignedOfficer,
    }).catch((err) => console.warn('Supabase create investigation warning:', err));

    showToast('Investigation Case Created', `Case ${newCaseId} successfully generated and assigned`, 'success');
    navigateToCase(newCaseId);
  };

  // Investigation Actions
  const assignCase = (caseId: string, officerName: string) => {
    setInvestigations((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            assignedTo: officerName,
            status: c.status === 'New' ? 'Assigned' : c.status,
            timeline: [
              ...c.timeline,
              {
                title: 'Case Reassigned',
                date: new Date().toISOString().split('T')[0],
                actor: 'Super Admin',
                description: `Assigned case to ${officerName}.`,
              },
            ],
          };
        }
        return c;
      })
    );

    investigationService.updateInvestigation(caseId, {
      assigned_to: officerName,
      status: 'Assigned',
    }).catch((err) => console.warn('Supabase assign case warning:', err));

    showToast('Case Assigned', `Case ${caseId} assigned to ${officerName}`, 'info');
  };

  const addCaseNote = (caseId: string, noteText: string) => {
    const authorName =
      currentRole === 'AUDITOR_INVESTIGATOR'
        ? 'Dr. Vivek Deshmukh'
        : currentRole === 'MONITORING_OFFICER'
        ? 'Shri Rajesh Deshmukh, IAS'
        : currentRole === 'SUPER_ADMIN'
        ? 'Shri Amitabh Sharma, IAS'
        : 'District Authority Officer';

    const newNote: InvestigationNote = {
      id: 'NOTE_' + Date.now(),
      author: authorName,
      role: currentRole.replace('_', ' '),
      date: new Date().toLocaleString(),
      note: noteText,
    };

    setInvestigations((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            notes: [...c.notes, newNote],
          };
        }
        return c;
      })
    );

    investigationService.addInvestigationNote(caseId, noteText).catch((err) =>
      console.warn('Supabase add note warning:', err)
    );

    showToast('Note Added', 'Investigation diary updated with officer remarks', 'success');
  };

  const requestClarification = (caseId: string, queryText: string) => {
    const authorName =
      currentRole === 'AUDITOR_INVESTIGATOR'
        ? 'Dr. Vivek Deshmukh (Auditor)'
        : 'Shri Rajesh Deshmukh (Monitoring Officer)';

    setInvestigations((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            status: 'Clarification Requested',
            clarifications: [
              ...c.clarifications,
              {
                id: 'CLR_' + Date.now(),
                query: queryText,
                queriedBy: authorName,
                queryDate: new Date().toISOString().split('T')[0],
                status: 'Pending',
              },
            ],
            timeline: [
              ...c.timeline,
              {
                title: 'Statutory Clarification Issued',
                date: new Date().toISOString().split('T')[0],
                actor: authorName,
                description: queryText,
              },
            ],
          };
        }
        return c;
      })
    );

    investigationService.createInvestigationRequest(caseId, 'Technical Clarification', queryText).catch((err) =>
      console.warn('Supabase create request warning:', err)
    );

    // Notify district authority
    const newNotif: NotificationItem = {
      id: 'NOTIF_' + Date.now(),
      title: 'Clarification Requested on Project',
      message: `Auditor has issued an official clarification notice for case ${caseId}. Response required within 7 days.`,
      type: 'warning',
      timestamp: new Date().toLocaleString(),
      read: false,
      targetPage: 'investigations',
      targetCaseId: caseId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast('Clarification Dispatched', 'Notice transmitted to District Implementing Authority', 'info');
  };

  const respondToClarification = (
    caseId: string,
    clarificationId: string,
    responseText: string,
    supportingDocumentName?: string,
    updatedProgress?: { physical: number; expenditure: number }
  ) => {
    setInvestigations((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          // If updatedProgress was provided, update the linked project too
          if (updatedProgress) {
            setRawProjects((pList) =>
              pList.map((p) => {
                if (p.id === c.projectId) {
                  const newFinUtil = Math.round((updatedProgress.expenditure / p.sanctionedAmount) * 100);
                  return {
                    ...p,
                    physicalProgress: updatedProgress.physical,
                    expenditure: updatedProgress.expenditure,
                    financialUtilization: newFinUtil,
                    lastUpdated: new Date().toISOString().split('T')[0],
                  };
                }
                return p;
              })
            );
          }

          const newEvidences = [...c.evidences];
          if (supportingDocumentName) {
            newEvidences.push({
              id: 'EVD_' + Date.now(),
              title: supportingDocumentName,
              uploadedBy: 'Er. Sandeep Patil (Executive Engineer)',
              uploadedDate: new Date().toISOString().split('T')[0],
              fileType: 'PDF',
              size: '3.1 MB',
              verified: true,
              notes: 'Official supporting document submitted with clarification rejoinder.',
            });
          }

          return {
            ...c,
            status: 'Clarification Received',
            evidences: newEvidences,
            clarifications: c.clarifications.map((clr) => {
              if (clr.id === clarificationId) {
                return {
                  ...clr,
                  response: responseText,
                  respondedBy: 'Er. Sandeep Patil, Executive Engineer PWD',
                  responseDate: new Date().toISOString().split('T')[0],
                  supportingDocumentName,
                  updatedProgress,
                  status: 'Responded',
                };
              }
              return clr;
            }),
            timeline: [
              ...c.timeline,
              {
                title: 'Clarification Response & Evidence Filed',
                date: new Date().toISOString().split('T')[0],
                actor: 'District Authority',
                description: `Response submitted with documentary evidence.${
                  updatedProgress
                    ? ` Ground progress updated to ${updatedProgress.physical}%, Exp: ₹${updatedProgress.expenditure}L.`
                    : ''
                }`,
              },
            ],
          };
        }
        return c;
      })
    );

    // Notify auditor
    const newNotif: NotificationItem = {
      id: 'NOTIF_' + Date.now(),
      title: 'Clarification Response Received',
      message: `District authority submitted technical rejoinder and documentary evidence for case ${caseId}.`,
      type: 'info',
      timestamp: new Date().toLocaleString(),
      read: false,
      targetPage: 'investigations',
      targetCaseId: caseId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Persist response to Supabase
    investigationService
      .submitInvestigationResponse(
        clarificationId,
        responseText,
        supportingDocumentName || 'documents/rejoinder_records.pdf'
      )
      .catch((err) => console.warn('Supabase clarification response sync warning:', err));

    showToast('Rejoinder Filed', 'Official clarification response and documentary records recorded', 'success');
  };

  const setCaseDetermination = (
    caseId: string,
    determination: 'Verified' | 'False Positive' | 'Further Review Required',
    summaryNotes: string
  ) => {
    setInvestigations((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const newStatus: InvestigationStatus =
            determination === 'Verified'
              ? 'Verified'
              : determination === 'False Positive'
              ? 'False Positive'
              : 'Further Review Required';

          return {
            ...c,
            status: newStatus,
            resolutionSummary: summaryNotes,
            resolvedAt: new Date().toISOString().split('T')[0],
            timeline: [
              ...c.timeline,
              {
                title: `Determination: ${determination}`,
                date: new Date().toISOString().split('T')[0],
                actor: 'Auditor / Investigator',
                description: summaryNotes,
              },
            ],
          };
        }
        return c;
      })
    );

    // Persist determination to Supabase
    const dbStatus =
      determination === 'Verified'
        ? 'Verified'
        : determination === 'False Positive'
        ? 'False Positive'
        : 'Further Investigation';

    investigationService
      .updateInvestigation(caseId, {
        status: dbStatus,
        resolution_type:
          determination === 'Verified'
            ? 'Action Required'
            : determination === 'False Positive'
            ? 'False Positive'
            : 'Further Investigation Required',
        resolution: summaryNotes,
        resolved_at: determination !== 'Further Review Required' ? new Date().toISOString() : null,
      })
      .catch((err) => console.warn('Supabase case determination sync warning:', err));

    // If false positive, restore project status to In Progress
    const targetCase = investigations.find((c) => c.id === caseId);
    if (targetCase && determination === 'False Positive') {
      setRawProjects((prev) =>
        prev.map((p) => (p.id === targetCase.projectId ? { ...p, status: 'In Progress' } : p))
      );
    }

    showToast(
      'Determination Recorded',
      `Audit case ${caseId} marked as ${determination}. Statutory records updated.`,
      determination === 'Verified' ? 'warning' : 'info'
    );
  };

  const uploadEvidence = (caseId: string, title: string, fileType: string, notes?: string) => {
    const authorName =
      currentRole === 'AUDITOR_INVESTIGATOR'
        ? 'Dr. Vivek Deshmukh'
        : currentRole === 'DISTRICT_AUTHORITY'
        ? 'PWD District Cell'
        : 'Monitoring Cell';

    const newEvidence: EvidenceItem = {
      id: 'EVD_' + Date.now(),
      title,
      uploadedBy: authorName,
      uploadedDate: new Date().toISOString().split('T')[0],
      fileType,
      size: '3.8 MB',
      verified: true,
      notes: notes || 'Submitted for evidentiary review',
    };

    setInvestigations((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            evidences: [...c.evidences, newEvidence],
            timeline: [
              ...c.timeline,
              {
                title: 'Evidence Docket Added',
                date: new Date().toISOString().split('T')[0],
                actor: authorName,
                description: `Document added: ${title} (${fileType}).`,
              },
            ],
          };
        }
        return c;
      })
    );
    showToast('Document Uploaded', `${title} appended to audit dossier`, 'success');
  };

  const verifyCaseFinding = (caseId: string, notes: string) => {
    setInvestigations((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            status: 'Verified',
            timeline: [
              ...c.timeline,
              {
                title: 'Audit Findings Human-Verified',
                date: new Date().toISOString().split('T')[0],
                actor: 'Auditor / Investigator',
                description: `Human verification concluded. Anomaly confirmed requiring administrative recovery. Remarks: ${notes}`,
              },
            ],
          };
        }
        return c;
      })
    );
    showToast('Findings Verified', `Human verification confirmed for case ${caseId}`, 'warning');
  };

  const markCaseFalsePositive = (caseId: string, justification: string) => {
    setInvestigations((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            status: 'False Positive',
            resolutionSummary: `Dismissed as false positive after review. Justification: ${justification}`,
            resolvedAt: new Date().toISOString().split('T')[0],
            timeline: [
              ...c.timeline,
              {
                title: 'Case Marked as False Positive',
                date: new Date().toISOString().split('T')[0],
                actor: 'Auditor / Investigator',
                description: justification,
              },
            ],
          };
        }
        return c;
      })
    );

    showToast('Case Dismissed', `Case ${caseId} marked as false positive with recorded justification`, 'info');
  };

  const resolveCase = (caseId: string, summary: string) => {
    setInvestigations((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            status: 'Resolved',
            resolutionSummary: summary,
            resolvedAt: new Date().toISOString().split('T')[0],
            timeline: [
              ...c.timeline,
              {
                title: 'Investigation Formally Resolved',
                date: new Date().toISOString().split('T')[0],
                actor: 'Chief Auditor',
                description: summary,
              },
            ],
          };
        }
        return c;
      })
    );

    // Update linked project status back to in progress or completed
    const targetCase = investigations.find((c) => c.id === caseId);
    if (targetCase) {
      setRawProjects((prev) =>
        prev.map((p) => (p.id === targetCase.projectId ? { ...p, status: 'In Progress' } : p))
      );
    }

    // Persist resolution to Supabase
    investigationService.updateInvestigation(caseId, {
      status: 'Resolved',
      resolution_type: 'Case Closed - Action Completed',
      resolution: summary,
      resolved_at: new Date().toISOString(),
    }).catch((err) => console.warn('Supabase resolve investigation warning:', err));

    showToast('Investigation Resolved', `Case ${caseId} officially closed and report filed`, 'success');
  };

  // Duplicate pairs
  const updateDuplicatePairStatus = (
    pairId: string,
    status: 'Pending Review' | 'Potential Duplicate — Verification Required' | 'Verified Independent Scope' | 'Verified Duplicate'
  ) => {
    setDuplicatePairs((prev) =>
      prev.map((dp) => (dp.id === pairId ? { ...dp, status } : dp))
    );

    // Persist to Supabase duplicate_matches table
    riskService.updateDuplicateStatus(pairId, status).catch((err) => {
      console.warn('Supabase duplicate status sync warning:', err);
    });

    showToast('Duplicate Status Updated', `Pair ${pairId} status marked as ${status}`, 'info');
  };

  // User Management
  const addUser = (userData: Omit<UserAccount, 'id' | 'lastActive'>) => {
    const newUser: UserAccount = {
      ...userData,
      id: `USR-00${users.length + 1}`,
      lastActive: 'Just registered',
    };
    setUsers((prev) => [newUser, ...prev]);

    // Persist to Supabase users table
    userService.createUser({ ...userData, lastActive: 'Just registered' }).then((createdId) => {
      if (createdId) {
        setUsers((prev) => prev.map((u) => (u.id === newUser.id ? { ...u, id: createdId } : u)));
      }
    }).catch((err) => {
      console.warn('Supabase user creation sync warning:', err);
    });

    showToast('User Created', `User ${userData.name} added with role ${userData.role}`, 'success');
  };

  const updateUser = (id: string, updates: Partial<UserAccount>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    userService.updateUser(id, updates).catch((err) => {
      console.warn('Supabase user update warning:', err);
    });
    showToast('User Updated', `Profile updated successfully`, 'info');
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
          userService.updateUser(id, { status: nextStatus }).catch((err) => {
            console.warn('Supabase user toggle warning:', err);
          });
          showToast('Status Toggled', `User ${u.name} set to ${nextStatus}`, 'warning');
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // System Settings
  const updateRiskWeights = (newWeights: RiskWeights) => {
    setSettings((prev) => ({
      ...prev,
      riskWeights: newWeights,
    }));
    riskService.updateRiskWeights(newWeights).catch((err) => {
      console.warn('Supabase risk weights update warning:', err);
    });
    showToast('Risk Weights Updated', 'Risk scoring engine recalculated all project scores dynamically', 'success');
  };

  const updateThresholds = (newThresholds: SystemSettingsConfig['thresholds']) => {
    setSettings((prev) => ({
      ...prev,
      thresholds: newThresholds,
    }));
    showToast('Thresholds Updated', 'System risk thresholds reconfigured', 'info');
  };

  const updateNotificationSettings = (newNotifs: SystemSettingsConfig['notifications']) => {
    setSettings((prev) => ({
      ...prev,
      notifications: newNotifs,
    }));
    showToast('Notification Preferences Saved', 'Alert routing preferences updated', 'success');
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.INVESTIGATIONS);
    localStorage.removeItem(STORAGE_KEYS.DUPLICATES);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.PROJECT_ID);
    localStorage.removeItem(STORAGE_KEYS.CASE_ID);

    setRawProjects(INITIAL_PROJECTS);
    setAlerts(INITIAL_ALERTS);
    setInvestigations(INITIAL_INVESTIGATIONS);
    setDuplicatePairs(INITIAL_DUPLICATE_PAIRS);
    setUsers(INITIAL_USERS);
    setSettings(DEFAULT_SYSTEM_SETTINGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSelectedProjectId('MPLADS-MH-PUN-2026-00482');
    setSelectedCaseId('CASE-2026-0042');

    showToast('Baseline Restored', 'System data restored to default institutional baseline', 'info');
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications Cleared', 'All alerts marked as read', 'info');
  };

  const getProjectById = (id: string) => {
    if (!id) return projects[0] || rawProjects[0];
    const target = id.toLowerCase().trim();
    return (
      projects.find((p) => p.id.toLowerCase() === target) ||
      rawProjects.find((p) => p.id.toLowerCase() === target) ||
      projects.find((p) => (p as any).uuid?.toLowerCase() === target || (p as any).dbId?.toLowerCase() === target) ||
      rawProjects.find((p) => (p as any).uuid?.toLowerCase() === target || (p as any).dbId?.toLowerCase() === target) ||
      projects.find((p) => p.name.toLowerCase().includes(target)) ||
      projects.find((p) => target.includes(p.id.toLowerCase())) ||
      INITIAL_PROJECTS.find((p) => p.id === id) ||
      projects[0]
    );
  };

  const getCaseById = (id: string) => {
    if (!id) return investigations[0];
    const target = id.toLowerCase().trim();
    return (
      investigations.find((c) => c.id.toLowerCase() === target) ||
      investigations.find((c) => c.projectId.toLowerCase() === target) ||
      investigations.find((c) => c.title.toLowerCase().includes(target)) ||
      investigations[0]
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentPage,
        setCurrentPage,
        selectedProjectId,
        setSelectedProjectId,
        selectedCaseId,
        setSelectedCaseId,
        navigateToProject,
        navigateToCase,
        projects,
        getProjectById,
        getFilteredProjectsForRole,
        updateProjectProgress,
        alerts,
        acknowledgeAlert,
        dismissAlert,
        createInvestigationFromAlert,
        investigations,
        getCaseById,
        createInvestigationCase,
        assignCase,
        addCaseNote,
        requestClarification,
        respondToClarification,
        uploadEvidence,
        verifyCaseFinding,
        markCaseFalsePositive,
        setCaseDetermination,
        resolveCase,
        duplicatePairs,
        updateDuplicatePairStatus,
        users,
        userAccounts: users,
        addUser,
        updateUser,
        toggleUserStatus,
        settings,
        riskWeights: settings.riskWeights,
        updateRiskWeights,
        updateThresholds,
        updateNotificationSettings,
        restoreBaseline: resetDemoData,
        resetDemoData,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toasts,
        showToast,
        removeToast,
        searchQuery,
        setSearchQuery,
        getProjectAnalysis,
        recalculateAllRiskScores,
        isLoading,
        supabaseConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
