import React, { useState } from 'react';
import { X, Building2, Briefcase, Plus, Sparkles } from 'lucide-react';
import { Client, ClientMandate } from '../types';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newClient: Client) => void;
}

const COMMON_INDUSTRIES = [
  'FinTech / Payments',
  'SaaS / Enterprise Software',
  'E-Commerce & Quick Commerce',
  'AI & DeepTech',
  'Consumer Internet',
  'Logistics & Supply Chain',
  'HealthTech & BioTech',
  'EdTech',
  'Gaming & Web3',
];

const ACCOUNT_LEADS = [
  'Aditya Vardhan',
  'Neha Sharma',
  'Rahul Mukherjee',
  'Priya Kulkarni',
  'Daniel Phillips',
];

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('FinTech / Payments');
  const [headquarters, setHeadquarters] = useState('Bangalore, India');
  const [accountManager, setAccountManager] = useState('Aditya Vardhan');
  const [contractTier, setContractTier] = useState<
    'Tier 1 Exclusive' | 'Preferred Partner' | 'Standard Retainer'
  >('Preferred Partner');
  const [status, setStatus] = useState<'ACTIVE' | 'STRATEGIC' | 'ONBOARDING'>('ACTIVE');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('+91 80 4000 1000');
  const [notes, setNotes] = useState('');

  // Optional initial mandate
  const [includeMandate, setIncludeMandate] = useState(true);
  const [mandateTitle, setMandateTitle] = useState('React Developer');
  const [mandateDept, setMandateDept] = useState('Frontend Engineering');
  const [mandateLocation, setMandateLocation] = useState('Bangalore');
  const [mandateMinExp, setMandateMinExp] = useState(3);
  const [mandateMaxExp, setMandateMaxExp] = useState(7);
  const [mandateBudget, setMandateBudget] = useState(24);
  const [mandateSkills, setMandateSkills] = useState('React, TypeScript, Next.js');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const trimmedName = name.trim();
    const initials = trimmedName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'CL';

    const generatedId = `CLI-${Date.now().toString().slice(-4)}`;

    const mandates: ClientMandate[] = [];
    if (includeMandate && mandateTitle.trim()) {
      const skillsArray = mandateSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      mandates.push({
        id: `MAN-${Date.now().toString().slice(-4)}`,
        title: mandateTitle.trim(),
        department: mandateDept.trim() || 'Engineering Pod',
        location: mandateLocation.trim() || 'Bangalore',
        experienceMinYears: Number(mandateMinExp) || 3,
        experienceMaxYears: Number(mandateMaxExp) || 7,
        budgetLpa: Number(mandateBudget) || 24,
        targetSkills: skillsArray.length > 0 ? skillsArray : ['React', 'TypeScript'],
        openPositions: 2,
        filledPositions: 0,
        status: 'OPEN',
        urgency: 'HIGH',
      });
    }

    const newClient: Client = {
      id: generatedId,
      name: trimmedName,
      logoText: initials,
      industry: industry.trim() || 'Tech / Services',
      headquarters: headquarters.trim() || 'Bangalore, India',
      accountManager,
      contactEmail:
        contactEmail.trim() ||
        `hiring@${trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      contactPhone: contactPhone.trim() || '+91 80 4000 1000',
      status,
      activeMandatesCount: mandates.length,
      totalPlacements: 0,
      avgClosureDays: 18,
      contractTier,
      mandates,
      notes: notes.trim() || `Client onboarded into Jobvio MIS on ${new Date().toLocaleDateString()}.`,
    };

    onAdd(newClient);
    onClose();
  };

  return (
    <div
      id="new-client-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="new-client-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg border border-gray-200 shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center font-bold text-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-950">
                Create Client Partner Account
              </h2>
              <p className="text-xs text-gray-500">
                Register corporate account and hiring requisitions
              </p>
            </div>
          </div>
          <button
            id="close-new-client-modal"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-black rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Company Name & Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Company Name *
              </label>
              <input
                id="client-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Swiggy, Zepto, InMobi"
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black font-medium text-gray-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Industry Vertical
              </label>
              <select
                id="client-industry-select"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black bg-white text-gray-800"
              >
                {COMMON_INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Headquarters & Account Manager */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Headquarters Location
              </label>
              <input
                type="text"
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                placeholder="e.g. Bangalore, India"
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black text-gray-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Jobvio Account Lead
              </label>
              <select
                value={accountManager}
                onChange={(e) => setAccountManager(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black bg-white text-gray-800"
              >
                {ACCOUNT_LEADS.map((lead) => (
                  <option key={lead} value={lead}>
                    {lead}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contract Tier & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Contract Tier
              </label>
              <select
                value={contractTier}
                onChange={(e) => setContractTier(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black bg-white text-gray-800"
              >
                <option value="Tier 1 Exclusive">Tier 1 Exclusive (Highest SLA)</option>
                <option value="Preferred Partner">Preferred Partner</option>
                <option value="Standard Retainer">Standard Retainer</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Client Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black bg-white text-gray-800 font-mono"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="STRATEGIC">STRATEGIC</option>
                <option value="ONBOARDING">ONBOARDING</option>
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Hiring Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. talent@company.com"
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black text-gray-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 80 4000 1000"
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black text-gray-800"
              />
            </div>
          </div>

          {/* Initial Job Mandate Requisition Section */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between py-1 mb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeMandate}
                  onChange={(e) => setIncludeMandate(e.target.checked)}
                  className="rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                />
                <span className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-gray-600" />
                  Attach Initial Open Job Mandate
                </span>
              </label>
              <span className="text-[10px] font-mono text-gray-400">Requisition</span>
            </div>

            {includeMandate && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                      Role Title
                    </label>
                    <input
                      type="text"
                      value={mandateTitle}
                      onChange={(e) => setMandateTitle(e.target.value)}
                      placeholder="e.g. React Developer"
                      className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-black text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                      Department / Pod
                    </label>
                    <input
                      type="text"
                      value={mandateDept}
                      onChange={(e) => setMandateDept(e.target.value)}
                      placeholder="e.g. Core App Team"
                      className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-black text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                      Exp Min (Yrs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={mandateMinExp}
                      onChange={(e) => setMandateMinExp(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-black text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                      Exp Max (Yrs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="25"
                      value={mandateMaxExp}
                      onChange={(e) => setMandateMaxExp(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-black text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                      Max Budget (₹ LPA)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={mandateBudget}
                      onChange={(e) => setMandateBudget(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-black text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                    Key Tech Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={mandateSkills}
                    onChange={(e) => setMandateSkills(e.target.value)}
                    placeholder="e.g. React, TypeScript, Redux, Node.js"
                    className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-black text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Account Notes */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Internal Account Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Commercial terms, preferred interview format, billing frequency..."
              className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black text-gray-800"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded hover:bg-gray-50 text-gray-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-new-client-btn"
              type="submit"
              className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Create Client Partner</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
