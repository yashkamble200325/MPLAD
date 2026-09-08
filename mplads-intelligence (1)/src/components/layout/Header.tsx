import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { INITIAL_PROJECTS } from '../../data/mockData';
import {
  Bell,
  Search,
  User,
  Shield,
  Layers,
  ChevronDown,
  Building2,
  ExternalLink,
  CheckCheck,
  AlertCircle,
  Menu,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    currentRole,
    setCurrentRole,
    currentPage,
    setCurrentPage,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    navigateToProject,
    navigateToCase,
    searchQuery,
    setSearchQuery,
    projects,
    supabaseConnected,
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesList: { role: UserRole; title: string; desc: string }[] = [
    {
      role: 'SUPER_ADMIN',
      title: 'Super Admin',
      desc: 'Full administrative access, user directory, system weights',
    },
    {
      role: 'MONITORING_OFFICER',
      title: 'Monitoring Officer',
      desc: 'Central risk surveillance, anomaly triage, audit assignment',
    },
    {
      role: 'DISTRICT_AUTHORITY',
      title: 'District Authority',
      desc: 'Pune district implementing agency, progress & bill updates',
    },
    {
      role: 'AUDITOR_INVESTIGATOR',
      title: 'Auditor / Investigator',
      desc: 'Independent audit verification, case notes & evidence docket',
    },
  ];

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-slate-900 text-amber-400 border-slate-700';
      case 'MONITORING_OFFICER':
        return 'bg-blue-900 text-blue-100 border-blue-700';
      case 'DISTRICT_AUTHORITY':
        return 'bg-emerald-900 text-emerald-100 border-emerald-700';
      case 'AUDITOR_INVESTIGATOR':
        return 'bg-purple-900 text-purple-100 border-purple-700';
    }
  };

  const getRoleUserDetail = () => {
    switch (currentRole) {
      case 'SUPER_ADMIN':
        return { name: 'Shri Amitabh Sharma, IAS', roleTitle: 'Super Admin', dept: 'Central Oversight Directorate' };
      case 'MONITORING_OFFICER':
        return { name: 'Yash Kamble', roleTitle: 'Monitoring Officer', dept: 'State Monitoring Cell, Maharashtra' };
      case 'DISTRICT_AUTHORITY':
        return { name: 'Er. Sandeep Patil', roleTitle: 'District Authority', dept: 'District Implementing Cell, Pune' };
      case 'AUDITOR_INVESTIGATOR':
        return { name: 'Dr. Vivek Deshmukh', roleTitle: 'Senior Auditor', dept: 'Statutory Audit Division' };
    }
  };

  const userDetail = getRoleUserDetail();

  // Search filtered results for quick dropdown
  const allSearchableProjects = [...projects];
  INITIAL_PROJECTS.forEach(ip => {
    if (!allSearchableProjects.some(p => p.id === ip.id)) {
      allSearchableProjects.push(ip);
    }
  });

  const searchResults = searchQuery.trim()
    ? allSearchableProjects.filter(
        (p) =>
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const getBreadcrumb = () => {
    const map: Record<string, string> = {
      dashboard: 'Surveillance Dashboard',
      projects: 'All MPLADS Projects',
      'project-details': 'Project Risk Dossier',
      'risk-alerts': 'Early-Warning Anomaly Alerts',
      'ai-analysis': 'Explainable Risk Decomposition',
      'financial-monitoring': 'Public Expenditure & Utilization',
      'delay-progress': 'Execution Milestones & Delay Forecasts',
      'duplicate-detection': 'Cross-Scheme Duplicate Identification',
      'risk-map': 'Maharashtra Geographic Risk Map',
      predictions: 'Predictive Analytics & Trajectories',
      investigations: 'Formal Investigation & Audit Workflow',
      reports: 'Statutory Reports & Dossier Generation',
      users: 'Access Control & User Directory',
      settings: 'Risk Engine Calibration & Parameters',
      home: 'Overview Portal',
      signin: 'Sign In / Account Access',
      'demo-access': 'Sign In / Account Access',
    };
    return map[currentPage] || 'Portal';
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      {/* Top Tricolor Micro Strip representing Government of India Scheme */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white border-y border-slate-100"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Sidebar Trigger + Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 rounded text-slate-600 hover:bg-slate-100 hover:text-[#002D62] transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-[#002D62] truncate">
              {getBreadcrumb()}
            </h1>
            <span className="hidden sm:inline-flex px-2 py-0.5 bg-gray-100 text-[11px] text-gray-500 rounded border border-gray-200 font-medium">
              Maharashtra State
            </span>
          </div>
        </div>

        {/* Middle: Global Quick Search */}
        <div ref={searchRef} className="relative hidden md:block w-72 lg:w-96">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search projects by ID, district, vendor, or category..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#002D62] focus:border-[#002D62] placeholder:text-slate-400 transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Search Results Dropdown */}
          {searchFocused && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg py-1 z-50 animate-in fade-in-50">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-gray-100">
                Matching Projects ({searchResults.length})
              </div>
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    navigateToProject(p.id);
                    setSearchFocused(false);
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {p.id} • {p.district} • ₹{p.expenditure}L / ₹{p.sanctionedAmount}L
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      p.riskLevel === 'CRITICAL'
                        ? 'bg-red-600 text-white'
                        : p.riskLevel === 'HIGH'
                        ? 'bg-amber-500 text-white'
                        : p.riskLevel === 'MEDIUM'
                        ? 'bg-amber-400 text-white'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {p.riskScore}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Role Switcher + Notification Bell + User Avatar */}
        <div className="flex items-center gap-2 sm:gap-4">
          {supabaseConnected && (
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800"
              title="Supabase PostgreSQL Database Connected"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Supabase Connected</span>
            </div>
          )}

          {/* Operational Role Switcher Dropdown */}
          <div ref={roleRef} className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-[#334155] transition-colors"
              title="Switch Active Operational Role"
            >
              <Shield className="w-3.5 h-3.5 text-[#002D62]" />
              <div className="flex items-center gap-1.5 text-left">
                <span className="hidden sm:inline text-gray-500 font-normal">Role:</span>
                <span className="font-semibold text-[#002D62]">
                  {currentRole === 'SUPER_ADMIN'
                    ? 'Super Admin'
                    : currentRole === 'MONITORING_OFFICER'
                    ? 'Monitoring Officer'
                    : currentRole === 'DISTRICT_AUTHORITY'
                    ? 'District Authority'
                    : 'Auditor'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-76 bg-white border border-gray-200 rounded shadow-xl py-1.5 z-50 animate-in fade-in-50">
                <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Authorized Designations
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-semibold border border-slate-200">
                    RBAC
                  </span>
                </div>
                {rolesList.map((item) => {
                  const isActive = currentRole === item.role;
                  return (
                    <div
                      key={item.role}
                      onClick={() => {
                        setCurrentRole(item.role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`px-3 py-2 hover:bg-slate-50 cursor-pointer transition-colors border-l-4 ${
                        isActive
                          ? 'border-[#002D62] bg-blue-50/50'
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                        {isActive && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-[#002D62] text-white rounded font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 rounded text-slate-600 hover:text-[#002D62] hover:bg-gray-100 transition-colors"
              title="System Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-white border border-gray-200 rounded shadow-xl z-50 animate-in fade-in-50 overflow-hidden">
                <div className="px-4 py-2.5 bg-[#002D62] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-white/80" />
                    <span className="text-xs font-bold">Surveillance Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] bg-red-600 text-white font-bold rounded">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-white/80 hover:text-white flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No notifications at this time
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.targetProjectId) {
                            navigateToProject(notif.targetProjectId);
                          } else if (notif.targetCaseId) {
                            navigateToCase(notif.targetCaseId);
                          } else {
                            setCurrentPage(notif.targetPage);
                          }
                          setNotifDropdownOpen(false);
                        }}
                        className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors flex gap-2.5 ${
                          !notif.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          {notif.type === 'critical' ? (
                            <span className="w-2 h-2 rounded-full bg-red-600 block"></span>
                          ) : notif.type === 'warning' ? (
                            <span className="w-2 h-2 rounded-full bg-amber-500 block"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-[#002D62] block"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="text-xs font-bold text-slate-900 truncate">
                              {notif.title}
                            </h5>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {notif.timestamp.split(' ')[1] || notif.timestamp}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info - High Density Theme Style */}
          <div className="hidden lg:flex items-center gap-3 border-l border-gray-200 pl-4">
            <div className="text-right">
              <div className="text-xs font-bold leading-none text-[#334155]">{userDetail.name}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{userDetail.roleTitle} • {userDetail.dept}</div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-[#002D62] border border-gray-300 text-xs">
              {userDetail.name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('') || 'RK'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
