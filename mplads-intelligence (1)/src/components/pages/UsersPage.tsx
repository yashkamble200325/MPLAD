import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserAccount, UserRole } from '../../types';
import { GovDisclaimer } from '../common/GovDisclaimer';
import {
  Users,
  Shield,
  Plus,
  Search,
  CheckCircle2,
  Lock,
  Building2,
  Mail,
  UserCheck,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { userAccounts, setCurrentRole, currentRole, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('MONITORING_OFFICER');

  const filteredUsers = userAccounts.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    showToast('Officer Provisioned', `${newName} added to authorized directory with role ${newRole}.`, 'success');
    setModalOpen(false);
    setNewName('');
    setNewEmail('');
  };

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Administrator',
    MONITORING_OFFICER: 'State Monitoring Officer',
    DISTRICT_AUTHORITY: 'District Authority',
    AUDITOR_INVESTIGATOR: 'Statutory Auditor & Investigator',
  };

  return (
    <div className="space-y-3.5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#002D62] tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-[#002D62]" />
              <span>Access Control & Authorized Personnel Directory</span>
            </h2>
            <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-[#002D62] border border-slate-300 rounded font-mono font-semibold">
              Super Admin Privilege
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Role-based access control (RBAC), district jurisdiction assignments, and digital audit credentialing
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Provision New Officer</span>
        </button>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-3 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search personnel by name, email, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#002D62] focus:border-[#002D62]"
            />
          </div>

          <span className="text-xs text-gray-500 font-medium">
            {filteredUsers.length} Active Credentials
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-100/60 text-gray-600 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Officer Name</th>
                <th className="py-2.5 px-3">Role / Persona</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Jurisdiction</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Last Active</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => {
                const isCurrent = currentRole === u.role;
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3">
                      <div className="font-bold text-gray-900">{u.name}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{u.email}</div>
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded font-semibold border ${
                          u.role === 'SUPER_ADMIN'
                            ? 'bg-[#002D62] text-amber-300 border-[#001f44]'
                            : u.role === 'MONITORING_OFFICER'
                            ? 'bg-blue-50 text-[#002D62] border-blue-200'
                            : u.role === 'DISTRICT_AUTHORITY'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                        }`}
                      >
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-700">{u.department}</td>
                    <td className="py-2 px-3 font-semibold text-gray-800">{u.district}</td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-500 font-mono text-[11px]">
                      {u.lastActive}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {isCurrent ? (
                        <span className="text-[11px] font-bold text-[#002D62] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Current Persona
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setCurrentRole(u.role);
                            showToast('Persona Switched', `Active view changed to ${roleLabels[u.role] || u.role} (${u.name})`, 'info');
                          }}
                          className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-slate-100 text-gray-700 text-[11px] font-semibold transition-colors shadow-2xs"
                        >
                          Switch To
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Officer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded shadow-xl border border-gray-200 max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-[#002D62]">Provision New Officer Account</h3>
            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Full Name & Honorific</label>
                <input
                  type="text"
                  placeholder="e.g. Smt. Ananya Sen, IAS"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#002D62] focus:border-[#002D62]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Official NIC / Gov Email</label>
                <input
                  type="email"
                  placeholder="e.g. ananya.sen@nic.in"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#002D62] focus:border-[#002D62]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Department / Cadre</label>
                <input
                  type="text"
                  placeholder="e.g. District Rural Development Agency (DRDA)"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#002D62] focus:border-[#002D62]"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Designated Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#002D62] focus:border-[#002D62]"
                >
                  <option value="MONITORING_OFFICER">Monitoring Officer</option>
                  <option value="DISTRICT_AUTHORITY">District Authority</option>
                  <option value="AUDITOR_INVESTIGATOR">Auditor / Investigator</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 font-semibold shadow-2xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#002D62] hover:bg-[#001f44] text-white rounded font-bold shadow-xs"
                >
                  Provision Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
