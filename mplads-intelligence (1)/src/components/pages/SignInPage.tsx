import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Shield,
  Activity,
  Building2,
  SearchCheck,
  CheckCircle,
  ArrowRight,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { setCurrentRole, setCurrentPage, showToast } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('MONITORING_OFFICER');
  const [employeeId, setEmployeeId] = useState('yash.kamble@gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const officerProfiles: {
    role: UserRole;
    officerName: string;
    title: string;
    department: string;
    badge: string;
    badgeColor: string;
    icon: React.ElementType;
    empId: string;
    jurisdiction: string;
    features: string[];
  }[] = [
    {
      role: 'MONITORING_OFFICER',
      officerName: 'Yash Kamble',
      title: 'Monitoring Officer',
      department: 'State Planning & Monitoring Cell, Maharashtra',
      badge: 'State Surveillance',
      badgeColor: 'bg-blue-900/60 text-blue-200 border-blue-700',
      icon: Activity,
      empId: 'yash.kamble@gov.in',
      jurisdiction: 'Statewide Risk Triage & Anomaly Surveillance',
      features: [
        'Real-time surveillance of high-risk projects & early warnings',
        'Triage anomaly alerts & assign formal investigation cases',
        'Analyze cost-deviation patterns & duplicate detection scores',
        'Generate district performance and expenditure reports',
      ],
    },
    {
      role: 'DISTRICT_AUTHORITY',
      officerName: 'Er. Sandeep Patil',
      title: 'District Implementing Authority',
      department: 'Public Works Division (Haveli), Pune',
      badge: 'Field Execution',
      badgeColor: 'bg-emerald-900/60 text-emerald-200 border-emerald-700',
      icon: Building2,
      empId: 'sandeep.patil@pwd.mh.gov.in',
      jurisdiction: 'Pune District MPLADS Projects',
      features: [
        'Restricted access to Pune district project portfolio',
        'Submit on-ground physical milestones and Measurement Books',
        'File formal rejoinders to statutory auditor clarification notices',
        'Record milestone expense bills and contractor payments',
      ],
    },
    {
      role: 'AUDITOR_INVESTIGATOR',
      officerName: 'Dr. Vivek Deshmukh',
      title: 'Senior Statutory Auditor',
      department: 'Office of the Principal Accountant General (Audit)',
      badge: 'Audit & Investigation',
      badgeColor: 'bg-purple-900/60 text-purple-200 border-purple-700',
      icon: SearchCheck,
      empId: 'vivek.deshmukh@cag.gov.in',
      jurisdiction: 'Statutory Verification & Evidence Dockets',
      features: [
        'Lead investigation dockets on flagged critical cases',
        'Issue formal clarification notices to field engineers',
        'Upload verified audit evidence, drone photos, and bank sheets',
        'Record formal determinations: Verified Anomaly or False Positive',
      ],
    },
    {
      role: 'SUPER_ADMIN',
      officerName: 'Shri Amitabh Sharma, IAS',
      title: 'Super Admin',
      department: 'Central Oversight Directorate',
      badge: 'Executive Oversight',
      badgeColor: 'bg-slate-800 text-amber-300 border-slate-700',
      icon: Shield,
      empId: 'amitabh.sharma@gov.in',
      jurisdiction: 'Full Central Oversight & Calibration',
      features: [
        'Access to all surveillance, risk, and administration modules',
        'Calibrate multi-factor risk scoring weights and thresholds',
        'Manage officer credentials and district assignments',
        'Statewide compliance reviews and executive reporting',
      ],
    },
  ];

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    const profile = officerProfiles.find((p) => p.role === role);
    if (profile) {
      setEmployeeId(profile.empId);
    }
  };

  const handleSignIn = (roleToUse: UserRole = selectedRole) => {
    setIsSigningIn(true);
    setCurrentRole(roleToUse);

    const profile = officerProfiles.find((p) => p.role === roleToUse);
    const officer = profile?.officerName || 'Authorized Officer';

    setTimeout(() => {
      setIsSigningIn(false);
      showToast('Authenticated', `Session initiated for ${officer} (${profile?.title})`, 'success');
      setCurrentPage('dashboard');
    }, 450);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Top Tricolor Strip */}
      <div className="border-b border-slate-800 bg-slate-950">
        <div className="h-1 w-full flex">
          <div className="h-full w-1/3 bg-[#FF9933]"></div>
          <div className="h-full w-1/3 bg-white"></div>
          <div className="h-full w-1/3 bg-[#138808]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-white tracking-wide">Government Project Monitoring System</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Secure Surveillance Node</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <button
              onClick={() => setCurrentPage('home')}
              className="text-slate-300 hover:text-white transition-colors"
            >
              Public Portal
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              System Status: Operational
            </span>
          </div>
        </div>
      </div>

      {/* Main Authentication Container */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-950/80 border border-blue-800/80 text-blue-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Member of Parliament Local Area Development Scheme</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
            MPLADS INTELLIGENCE
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Project Monitoring & Risk Analytics
          </p>
        </div>

        {/* Two-Column Sign-In & Profile Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sign In Card */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-lg p-6 shadow-xl">
            <div className="border-b border-slate-800/80 pb-4 mb-5">
              <h2 className="text-xl font-bold text-white tracking-tight">Sign In</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your official credentials to access the surveillance system.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSignIn();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Employee ID / Official Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Authorized Role / Designation
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="MONITORING_OFFICER">Monitoring Officer (Yash Kamble)</option>
                  <option value="DISTRICT_AUTHORITY">District Authority (Er. Sandeep Patil)</option>
                  <option value="AUDITOR_INVESTIGATOR">Senior Auditor (Dr. Vivek Deshmukh)</option>
                  <option value="SUPER_ADMIN">Super Admin (Shri Amitabh Sharma, IAS)</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberTerminal}
                    onChange={(e) => setRememberTerminal(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Remember terminal</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {isSigningIn ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Authenticating Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 p-3 rounded bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>
                Protected Government Enterprise Portal. Session access is audited with cryptographic timestamp logging.
              </span>
            </div>
          </div>

          {/* Officer Profiles Fast Selection */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Institutional Account
              </h3>
              <span className="text-[11px] text-slate-500">
                Click any profile to sign in
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {officerProfiles.map((p) => {
                const Icon = p.icon;
                const isCurrent = selectedRole === p.role;
                return (
                  <div
                    key={p.role}
                    onClick={() => {
                      handleRoleChange(p.role);
                      handleSignIn(p.role);
                    }}
                    className={`bg-slate-950 border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-500 hover:shadow-md flex flex-col justify-between ${
                      isCurrent
                        ? 'border-blue-500 ring-1 ring-blue-500/50 bg-blue-950/20'
                        : 'border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded bg-slate-900 border border-slate-800 text-blue-400">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white leading-tight">
                              {p.officerName}
                            </h4>
                            <span className="text-[11px] text-blue-300 font-medium">
                              {p.title}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 mb-2.5 line-clamp-2">
                        {p.department}
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800/80 mb-3">
                        <span className="text-slate-400 font-semibold">Jurisdiction:</span> {p.jurisdiction}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-slate-500">
                        {p.empId}
                      </span>
                      <span className="text-blue-400 font-semibold flex items-center gap-1 hover:text-blue-300">
                        Sign In →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Security & Statutory Notice */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
        <div className="bg-slate-950 border border-slate-800/80 rounded p-3 text-xs text-slate-400 flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>Statutory Access Notice:</strong> This system is reserved for authorized monitoring officers, district authorities, and statutory auditors. Analytical findings represent decision-support indicators and require human verification.
          </span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded bg-amber-950/80 border border-amber-800/80 text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Institutional Credential Recovery</h3>
                <p className="text-xs text-slate-400">Security Protocol Compliance Notice</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Under Government institutional IT security policies, self-service password reset is disabled for high-privilege project surveillance terminals.
            </p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 space-y-1.5 mb-5">
              <div className="font-semibold text-white">To reset your institutional credentials:</div>
              <div>1. Contact your District Informatics Officer (DIO) at the local NIC centre.</div>
              <div>2. Alternatively, raise an internal IT service ticket via the Nodal Directorate Helpdesk.</div>
              <div className="font-mono text-[11px] text-slate-400 pt-1">
                Helpdesk: helpdesk-surveillance@nic.in | Ext: 4892
              </div>
            </div>

            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Operational Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-300">MPLADS INTELLIGENCE</span> — Project Monitoring & Risk Analytics
          </div>
          <div>
            © 2026 | Government Project Monitoring System • Operational
          </div>
        </div>
      </footer>
    </div>
  );
};
