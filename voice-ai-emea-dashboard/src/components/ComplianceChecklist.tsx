import React from 'react';
import type { Compliance } from '../types/vendor';

interface ComplianceChecklistProps {
  compliance: Compliance;
}

const COMPLIANCE_ITEMS: { key: keyof Compliance; label: string }[] = [
  { key: 'gdpr', label: 'GDPR' },
  { key: 'iso27001', label: 'ISO 27001' },
  { key: 'soc2', label: 'SOC 2' },
  { key: 'hipaa', label: 'HIPAA' },
  { key: 'bsi_c5', label: 'BSI C5' },
  { key: 'on_prem', label: 'On-Prem' },
];

const ComplianceChecklist: React.FC<ComplianceChecklistProps> = ({ compliance }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {COMPLIANCE_ITEMS.map(({ key, label }) => {
        const passed = compliance[key];
        return (
          <div
            key={key}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              passed
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <span className="text-lg">{passed ? '\u2705' : '\u274C'}</span>
            <span className={`text-sm font-medium ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ComplianceChecklist;
