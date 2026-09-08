import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Shield,
  ArrowRight,
  TrendingUp,
  Cpu,
  Copy,
  FileCheck2,
  FileSearch,
  CheckCircle2,
  Clock,
  Layers,
  ExternalLink,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setCurrentPage, setCurrentRole } = useApp();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Government Portal Top Header */}
      <div className="border-b border-slate-800 bg-slate-950">
        <div className="h-1 w-full flex">
          <div className="h-full w-1/3 bg-[#FF9933]"></div>
          <div className="h-full w-1/3 bg-white"></div>
          <div className="h-full w-1/3 bg-[#138808]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-blue-700 text-white font-black flex items-center justify-center text-xs">
              GOI
            </div>
            <div>
              <span className="font-bold text-white tracking-wide">Government of India</span>
              <span className="text-slate-400 mx-1.5">•</span>
              <span className="text-slate-400">Public Works Surveillance & Audit Division</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Ministry of Statistics & Programme Implementation (MoSPI)</span>
            <button
              onClick={() => setCurrentPage('signin')}
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              Sign In →
            </button>
          </div>
        </div>
      </div>

      {/* Nav */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
            MI
          </div>
          <div>
            <div className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>MPLADS INTELLIGENCE</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-blue-900/60 border border-blue-500/40 text-blue-300 rounded font-mono">
                MONITORING SYSTEM
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Project Monitoring & Risk Analytics System
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <a href="#overview" className="hover:text-white transition-colors">Overview</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
          <button
            onClick={() => setCurrentPage('signin')}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors shadow-xs"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-950/80 border border-blue-800/80 text-blue-300 text-xs font-semibold mb-6">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Public Expenditure Surveillance & Risk Analytics</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            MPLADS Project Risk & Anomaly Surveillance Platform
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
            A specialized decision-support platform designed for District Collectors, Monitoring Officers, and Statutory Auditors. Identifies expenditure spikes, physical-financial mismatches, cross-scheme duplicate sanctions, and project execution delays across Member of Parliament Local Area Development Scheme (MPLADS) works.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <button
              onClick={() => {
                setCurrentRole('MONITORING_OFFICER');
                setCurrentPage('dashboard');
              }}
              className="px-6 py-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-950 transition-colors"
            >
              <span>Enter Monitoring Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage('signin')}
              className="px-5 py-3 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors"
            >
              Sign In / Select Office
            </button>

            <button
              onClick={() => {
                setCurrentPage('project-details');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4"
            >
              Inspect Monitored Project Record (Pune CHC) →
            </button>
          </div>

          <div className="mt-8 p-3 bg-slate-800/50 border border-slate-700/60 rounded text-xs text-slate-400 flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Statutory Compliance Guardrail:</strong> The analytics system strictly flags <em>“Potential Risk Detected”</em> or <em>“Requires Human Verification”</em>. Final decisions remain strictly with authorized administrative officers.
            </span>
          </div>
        </div>
      </section>

      {/* 6-Stage Government Workflow */}
      <section id="how-it-works" className="border-t border-slate-800 bg-slate-950/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Surveillance Methodology
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              End-to-End Human-in-the-Loop Risk Architecture
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              How the platform converts raw public works data into actionable audit intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                step: '01',
                title: 'Government Data',
                desc: 'Ingests administrative sanctions, Treasury billings, measurement books & GPS coordinates.',
              },
              {
                step: '02',
                title: 'Data Analysis',
                desc: 'Performs expenditure velocity tests, timeline benchmarking and geospatial clustering.',
              },
              {
                step: '03',
                title: 'Anomaly Detection',
                desc: 'Identifies budget overruns (>15%), physical lag, and cross-scheme duplicate scope.',
              },
              {
                step: '04',
                title: 'Risk Scoring',
                desc: 'Computes explainable 0–100 composite risk rating with transparent factor weighting.',
              },
              {
                step: '05',
                title: 'Investigation Priority',
                desc: 'Automates triage queue and routes high-risk dossiers to designated audit teams.',
              },
              {
                step: '06',
                title: 'Human Verification',
                desc: 'Field verification, official clarification notices, and statutory closure by officers.',
              },
            ].map((st) => (
              <div
                key={st.step}
                className="bg-slate-900 border border-slate-800 rounded p-4 relative flex flex-col justify-between"
              >
                <div className="text-xs font-mono font-bold text-blue-400 mb-2">
                  STAGE {st.step}
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section id="capabilities" className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Enterprise GovTech Features
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Built for District & State Monitoring Cells
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-950 border border-slate-800 rounded p-5">
            <div className="p-2 w-fit rounded bg-rose-950/60 border border-rose-800/60 text-rose-400 mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Cost & Expenditure Anomalies</h4>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Detects expenditure disbursements that exceed sanctioned project ceilings, rapid lump-sum transfers, and anomalous contractor billing velocities.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-5">
            <div className="p-2 w-fit rounded bg-amber-950/60 border border-amber-800/60 text-amber-400 mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Physical vs Financial Divergence</h4>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Cross-checks financial drawdowns against independently verified physical milestones to highlight premature fund exhaustions before work completion.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-5">
            <div className="p-2 w-fit rounded bg-purple-950/60 border border-purple-800/60 text-purple-400 mb-3">
              <Copy className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Duplicate Scheme Identification</h4>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Scans across adjacent survey numbers and parallel schemes (PMGSY, Jal Jeevan Mission, ZP funds) using geospatial proximity and BoQ description matching.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-5">
            <div className="p-2 w-fit rounded bg-blue-950/60 border border-blue-800/60 text-blue-400 mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Explainable Risk Scoring</h4>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Every flagged project provides a clear mathematical decomposition across 5 transparent risk dimensions with adjustable administrative weights.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-5">
            <div className="p-2 w-fit rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 mb-3">
              <FileSearch className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Formal Audit Case Management</h4>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Full lifecycle tracking for audit cases: assign investigators, issue statutory clarification notices, upload evidence dockets, and record resolutions.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-5">
            <div className="p-2 w-fit rounded bg-slate-900 border border-slate-700 text-slate-200 mb-3">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Four Distinct Role Interfaces</h4>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Tailored workspaces for Super Admin, Monitoring Officers, District Implementing Authorities, and Senior Statutory Auditors with fine-grained access control.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-200">MPLADS INTELLIGENCE</span> — Project Monitoring & Risk Analytics
          </div>
          <div className="text-slate-400">
            © 2026 | Government Project Monitoring System • Decision-Support Platform
          </div>
        </div>
      </footer>
    </div>
  );
};
