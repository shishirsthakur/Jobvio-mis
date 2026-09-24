import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Candidate, CandidateStatus } from '../types';

interface NewCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newCandidate: Candidate) => void;
  nextCandidateId: string;
  existingRoles: string[];
  existingLocations: string[];
}

const ALL_STATUSES: Exclude<CandidateStatus, 'ALL'>[] = [
  'SOURCED',
  'SCREENING',
  'SHORTLISTED',
  'INTERVIEWING',
  'OFFERED',
  'JOINED',
  'REJECTED',
];

export const NewCandidateModal: React.FC<NewCandidateModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  nextCandidateId,
  existingRoles,
  existingLocations,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(existingRoles[0] || 'React Developer');
  const [experienceYears, setExperienceYears] = useState('4.0');
  const [expectedCtcLpa, setExpectedCtcLpa] = useState('20.0');
  const [location, setLocation] = useState(existingLocations[0] || 'Bangalore');
  const [skillsInput, setSkillsInput] = useState('');
  const [status, setStatus] = useState<Exclude<CandidateStatus, 'ALL'>>('SCREENING');
  const [currentCompany, setCurrentCompany] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('30 Days');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newCandidate: Candidate = {
      id: nextCandidateId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      role: role.trim(),
      experienceYears: parseFloat(experienceYears) || 0,
      expectedCtcLpa: parseFloat(expectedCtcLpa) || 0,
      location: location.trim(),
      skills: parsedSkills.length > 0 ? parsedSkills : ['General'],
      status,
      currentCompany: currentCompany.trim() || undefined,
      noticePeriod: noticePeriod.trim() || '30 Days',
      notes: [`Candidate record created on ${new Date().toLocaleDateString()}.`],
      createdAt: new Date().toISOString().split('T')[0],
      timeline: [
        {
          id: `evt-created-${Date.now()}`,
          type: 'CREATED',
          title: 'Candidate Profile Created',
          description: `Candidate profile registered in Jobvio database for ${role.trim()} (${status}).`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          author: 'Recruiter Admin',
          toStatus: status,
          metaBadge: 'Created',
        },
      ],
    };

    onAdd(newCandidate);
    onClose();
  };

  return (
    <div
      id="new-candidate-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="new-candidate-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg border border-gray-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-700">
              {nextCandidateId}
            </span>
            <h2 className="text-base font-bold text-gray-950">
              Create Candidate Record
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-black rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sen"
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@company.com"
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Target Role
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. React Developer"
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Expected CTC (₹ LPA)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={expectedCtcLpa}
                onChange={(e) => setExpectedCtcLpa(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Location
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore"
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Initial Pipeline Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black font-mono"
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Skills Matrix (comma-separated)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. React, Next.js, TypeScript, Tailwind"
              className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Current Company (optional)
              </label>
              <input
                type="text"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                placeholder="e.g. Infosys / Startup"
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Notice Period
              </label>
              <input
                type="text"
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(e.target.value)}
                placeholder="e.g. 30 Days / Immediate"
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-black hover:bg-gray-800 text-white rounded font-medium transition"
            >
              Save Candidate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
