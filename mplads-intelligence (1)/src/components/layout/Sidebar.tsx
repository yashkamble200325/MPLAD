import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  AlertTriangle,
  ClipboardList,
  ShieldAlert,
  Activity,
  Users,
  Settings,
  Home,
  Shield,
  IndianRupee,
  Clock,
  Copy,
  MapPin,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const {
    currentRole,
    currentPage,
    setCurrentPage,
    alerts,
    investigations,
    duplicatePairs,
    projects,
  } = useApp();

  const unackAlertsCount = alerts.filter((a) => a.status === 'New' || a.status === 'Acknowledged').length;
  const activeCasesCount = investigations.filter(
    (c) => c.status !== 'Resolved' && c.status !== 'False Positive'
  ).length;
  const pendingDuplicatesCount = duplicatePairs.filter((d) => d.status === 'Pending Review').length;
  const overrunCount = projects.filter((p) => p.expenditure > p.sanctionedAmount).length;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
    roles: string[];
    group: 'MAIN' | 'ANALYSIS' | 'ADMINISTRATION';
  }

  const navItems: NavItem[] = [
    // MAIN
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'MONITORING_OFFICER', 'DISTRICT_AUTHORITY', 'AUDITOR_INVESTIGATOR'],
      group: 'MAIN',
    },
    {
      id: 'projects',
      label: currentRole === 'DISTRICT_AUTHORITY' ? 'My District Projects' : 'Projects',
      icon: FolderKanban,
      roles: ['SUPER_ADMIN', 'MONITORING_OFFICER', 'DISTRICT_AUTHORITY', 'AUDITOR_INVESTIGATOR'],
      group: 'MAIN',
    },
    {
      id: 'risk-alerts',
      label: currentRole === 'DISTRICT_AUTHORITY' ? 'District Alerts' : 'Alerts',
      icon: AlertTriangle,
      badge: unackAlertsCount,
      badgeColor: 'bg-rose-600',
      roles: ['SUPER_ADMIN', 'MONITORING_OFFICER', 'DISTRICT_AUTHORITY', 'AUDITOR_INVESTIGATOR'],
      group: 'MAIN',
    },
    {
      id: 'investigations',
      label:
        currentRole === 'AUDITOR_INVESTIGATOR'
          ? 'Assigned Cases'
          : currentRole === 'DISTRICT_AUTHORITY'
          ? 'Clarifications & Actions'
          : 'Investigations',
      icon: ClipboardList,
      badge: activeCasesCount,
      badgeColor: 'bg-purple-600',
      roles: ['SUPER_ADMIN', 'MONITORING_OFFICER', 'DISTRICT_AUTHORITY', 'AUDITOR_INVESTIGATOR'],
      group: 'MAIN',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      roles: ['SUPER_ADMIN', 'MONITORING_OFFICER', 'DISTRICT_AUTHORITY', 'AUDITOR_INVESTIGATOR'],
      group: 'MAIN',
    },

    // ANALYSIS
    {
      id: 'ai-analysis',
      label: 'Risk Analysis',
      icon: ShieldAlert,
      roles: ['SUPER_ADMIN', 'MONITORING_OFFICER', 'AUDITOR_INVESTIGATOR'],
      group: 'ANALYSIS',
    },
    {
      id: 'financial-monitoring',
      label: currentRole === 'DISTRICT_AUTHORITY' ? 'Financial Updates' : 'Financial Monitoring',
      icon: IndianRupee,
      roles: ['SUPER_ADMIN', 'MONITORING_OFFICER', 'DISTRICT_AUTHORITY'],
      group: 'ANALYSIS',
    },
    {
      id: 'delay-progress',
      label: currentRole === 'DISTRICT_AUTHORITY' ? 'Progress Updates' : 'Delay & Progress',
      icon: Clock,
      roles: ['SUPER_ADMIN', 'MONITORING_OFFICER', 'DISTRICT_AUTHORITY'],
      group: 'ANALYSIS',
    },
    {
      id: 'duplicate-detection',
      label: 'Duplicate Detection',
      icon: Copy,
      badge: pendingDuplicatesCount > 0 ? pendingDuplicatesCount : undefined,
      badgeColor: 'bg-amber-600',
      roles: ['SUPER_ADMIN', 'MONITORING_OFFICER'],
      group: 'ANALYSIS',
    },
    {
      id: 'risk-map',
      label: 'Risk Map',
      icon: MapPin,
      roles: ['SUPER_ADMIN', 'MONITORING_OFFICER', 'AUDITOR_INVESTIGATOR'],
      group: 'ANALYSIS',
    },
    {
      id: 'predictions',
      label: 'Predictions',
      icon: TrendingUp,
      roles: ['SUPER_ADMIN', 'MONITORING_OFFICER'],
      group: 'ANALYSIS',
    },
    {
      id: 'project-monitoring',
      label: 'Full Monitoring Suite',
      icon: Activity,
      roles: ['SUPER_ADMIN', 'MONITORING_OFFICER'],
      group: 'ANALYSIS',
    },

    // ADMINISTRATION
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      roles: ['SUPER_ADMIN'],
      group: 'ADMINISTRATION',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      roles: ['SUPER_ADMIN'],
      group: 'ADMINISTRATION',
    },
  ];

  const groups: Array<'MAIN' | 'ANALYSIS' | 'ADMINISTRATION'> = [
    'MAIN',
    'ANALYSIS',
    'ADMINISTRATION',
  ];

  const handleNavClick = (pageId: string) => {
    setCurrentPage(pageId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-[240px] bg-[#002D62] text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#ffffff1a]">
          <div className="font-bold text-lg tracking-tight uppercase text-white flex items-center gap-1.5">
            <span className="text-amber-400 font-extrabold">MPLADS</span>
            <span>INTELLIGENCE</span>
          </div>
          <div className="text-[10px] uppercase opacity-75 tracking-wider leading-tight font-medium text-slate-200 mt-0.5">
            Project Monitoring & Risk Analytics
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-white/70 bg-[#ffffff10] px-2 py-1 rounded">
            <span>Surveillance Node</span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Active
            </span>
          </div>
        </div>

        {/* Navigation Links Grouped */}
        <nav className="flex-grow py-2 overflow-y-auto space-y-3">
          {groups.map((grp) => {
            const grpItems = navItems.filter(
              (item) => item.group === grp && item.roles.includes(currentRole)
            );
            if (grpItems.length === 0) return null;

            return (
              <div key={grp} className="space-y-0.5">
                <div className="px-4 py-1 text-[10px] font-bold text-white/50 uppercase tracking-widest">
                  {grp}
                </div>
                {grpItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-1.5 text-xs font-medium transition-colors text-left border-l-3 ${
                        isActive
                          ? 'bg-[#ffffff15] border-amber-400 text-white font-semibold'
                          : 'border-transparent text-white/75 hover:bg-[#ffffff08] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                            isActive ? 'opacity-100 text-amber-400' : 'opacity-70 text-white'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold text-white shrink-0 ${
                            item.badgeColor || 'bg-rose-500'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Portal Group */}
          <div className="space-y-0.5 pt-1 border-t border-white/10">
            <div className="px-4 py-1 text-[10px] font-bold text-white/50 uppercase tracking-widest">
              PORTAL
            </div>
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full flex items-center gap-2.5 px-4 py-1.5 text-xs font-medium border-l-3 transition-colors ${
                currentPage === 'home'
                  ? 'bg-[#ffffff15] border-amber-400 text-white font-semibold'
                  : 'border-transparent text-white/70 hover:bg-[#ffffff08] hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5 opacity-70 text-white" />
              <span>Public Portal</span>
            </button>
            <button
              onClick={() => handleNavClick('signin')}
              className={`w-full flex items-center gap-2.5 px-4 py-1.5 text-xs font-medium border-l-3 transition-colors ${
                currentPage === 'signin' || currentPage === 'demo-access'
                  ? 'bg-[#ffffff15] border-amber-400 text-white font-semibold'
                  : 'border-transparent text-white/70 hover:bg-[#ffffff08] hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 opacity-70 text-white" />
              <span>Authentication</span>
            </button>
          </div>
        </nav>

        {/* Operational Status Indicator */}
        <div className="p-3 bg-[#001f44] text-[10px] flex items-center justify-between border-t border-[#ffffff1a] shrink-0">
          <span className="text-white/70 font-mono">SYSTEM RELEASE 2.1</span>
          <span className="px-2 py-0.5 bg-emerald-800 text-emerald-100 font-semibold rounded text-[9px] tracking-wide">
            OPERATIONAL
          </span>
        </div>

        {/* Authenticated Officer Profile */}
        <div className="px-3 py-2.5 bg-[#001835] text-[11px] text-white/80 flex items-center justify-between border-t border-[#ffffff10]">
          <div className="min-w-0 pr-2">
            <div className="text-white font-semibold truncate leading-tight">
              {currentRole === 'SUPER_ADMIN'
                ? 'Shri Amitabh Sharma, IAS'
                : currentRole === 'MONITORING_OFFICER'
                ? 'Yash Kamble'
                : currentRole === 'DISTRICT_AUTHORITY'
                ? 'Er. Sandeep Patil'
                : 'Dr. Vivek Deshmukh'}
            </div>
            <div className="text-[10px] text-white/60 truncate">
              {currentRole === 'SUPER_ADMIN'
                ? 'Super Admin • Central'
                : currentRole === 'MONITORING_OFFICER'
                ? 'Monitoring Officer • Maharashtra'
                : currentRole === 'DISTRICT_AUTHORITY'
                ? 'District Authority • Pune'
                : 'Senior Auditor • CAG'}
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="System Status: Operational" />
        </div>
      </aside>
    </>
  );
};
