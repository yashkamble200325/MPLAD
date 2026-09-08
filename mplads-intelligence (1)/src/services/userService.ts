import { supabase } from '../lib/supabase';
import { UserAccount, UserRole, MaharashtraDistrict } from '../types';

export const userService = {
  /**
   * Fetches users from Supabase
   */
  async fetchUsers(): Promise<UserAccount[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching users from Supabase:', error);
      throw error;
    }

    if (!data || data.length === 0) return [];

    return data.map((u: any) => {
      let role: UserRole = 'MONITORING_OFFICER';
      const r = (u.role || '').toLowerCase();
      if (r.includes('super') || r.includes('admin')) role = 'SUPER_ADMIN';
      else if (r.includes('audit') || r.includes('investigat')) role = 'AUDITOR_INVESTIGATOR';
      else if (r.includes('district')) role = 'DISTRICT_AUTHORITY';
      else role = 'MONITORING_OFFICER';

      let dept = 'State Monitoring Directorate';
      if (role === 'SUPER_ADMIN') dept = 'Central Oversight Directorate';
      else if (role === 'AUDITOR_INVESTIGATOR') dept = 'Statutory Audit Division';
      else if (role === 'DISTRICT_AUTHORITY') dept = 'District Implementing Cell, Pune';

      return {
        id: u.id,
        name: u.full_name || 'Government Officer',
        email: u.email || 'officer@mplads.gov.in',
        role,
        department: dept,
        district: (role === 'DISTRICT_AUTHORITY' ? 'Pune' : undefined) as MaharashtraDistrict | undefined,
        status: u.is_active ? 'Active' : 'Inactive',
        lastActive: u.created_at ? u.created_at.split('T')[0] : 'Today, 09:30 AM',
      };
    });
  },

  /**
   * Creates a new user in Supabase
   */
  async createUser(user: Omit<UserAccount, 'id'>): Promise<string | null> {
    let dbRole = 'Monitoring Officer';
    if (user.role === 'SUPER_ADMIN') dbRole = 'Super Admin';
    else if (user.role === 'AUDITOR_INVESTIGATOR') dbRole = 'Auditor';
    else if (user.role === 'DISTRICT_AUTHORITY') dbRole = 'District Authority';

    const { data, error } = await supabase.from('users').insert({
      full_name: user.name,
      email: user.email,
      role: dbRole,
      is_active: user.status === 'Active',
    }).select('id').single();

    if (error) {
      console.error('Error creating user in Supabase:', error);
      return null;
    }

    return data?.id || null;
  },

  /**
   * Updates user profile or status in Supabase
   */
  async updateUser(id: string, updates: Partial<UserAccount>): Promise<void> {
    const dbUpdates: any = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name) dbUpdates.full_name = updates.name;
    if (updates.status) dbUpdates.is_active = updates.status === 'Active';

    await supabase.from('users').update(dbUpdates).eq('id', id);
  }
};
