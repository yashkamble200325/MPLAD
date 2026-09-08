import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface GovDisclaimerProps {
  compact?: boolean;
}

export const GovDisclaimer: React.FC<GovDisclaimerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 py-1 px-3 bg-amber-50/70 border border-amber-200/80 rounded text-xs text-amber-900">
        <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
        <span>
          <strong>Advisory Note:</strong> AI risk indicators highlight statistical anomalies and require human verification.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 border border-slate-200 rounded p-3 text-xs text-slate-700 flex items-start gap-2.5">
      <ShieldCheck className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
      <div>
        <span className="font-semibold text-slate-900">Government Advisory Notice & Oversight Protocol:</span>{' '}
        All risk flags, cost deviations, and anomaly scores provided by the MPLADS Intelligence engine are purely analytical decision-support indicators. The platform enforces a strict human-in-the-loop mandate—no project can be penalized or classified without formal on-site verification and signed adjudication by an authorized audit/monitoring officer.
      </div>
    </div>
  );
};
