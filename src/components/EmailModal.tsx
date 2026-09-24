import React, { useState } from 'react';
import { X, Send, Mail, CheckCircle2 } from 'lucide-react';
import { Candidate } from '../types';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCandidates: Candidate[];
  onSent: (count: number) => void;
}

const EMAIL_TEMPLATES = [
  {
    id: 'interview',
    title: 'Round 1 Interview Invitation',
    subject: 'Next Steps with Engineering Team: Technical Assessment & Discussion',
    body: 'Hi {name},\n\nThanks for your interest in the {role} position. We were very impressed with your background and skills matrix, and would love to schedule a 45-minute technical discussion with our engineering leads.\n\nPlease share your availability for the coming week.\n\nBest regards,\nTalent Acquisition Team',
  },
  {
    id: 'status_update',
    title: 'Application Pipeline Update',
    subject: 'Update regarding your application for {role}',
    body: 'Hi {name},\n\nWe wanted to touch base regarding your current status ({status}) in our recruitment process for the {role} role. Our hiring committee is actively reviewing candidate profiles and we will reach out with the final schedule shortly.\n\nWarm regards,\nRecruitment Team',
  },
  {
    id: 'offer',
    title: 'Offer Letter Discussion',
    subject: 'Offer of Employment: {role}',
    body: 'Hi {name},\n\nOn behalf of the leadership team, we are thrilled to formally extend an offer of employment for the {role} role based in {location}.\n\nPlease find the summary terms attached. We look forward to welcoming you aboard.\n\nWarm regards,\nPeople Operations',
  },
];

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  selectedCandidates,
  onSent,
}) => {
  if (!isOpen) return null;

  const [templateId, setTemplateId] = useState(EMAIL_TEMPLATES[0].id);
  const [subject, setSubject] = useState(EMAIL_TEMPLATES[0].subject);
  const [body, setBody] = useState(EMAIL_TEMPLATES[0].body);
  const [isSending, setIsSending] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    const tmpl = EMAIL_TEMPLATES.find((t) => t.id === id);
    if (tmpl) {
      setSubject(tmpl.subject);
      setBody(tmpl.body);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSentSuccess(true);
      setTimeout(() => {
        setIsSentSuccess(false);
        onSent(selectedCandidates.length);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div
      id="email-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="email-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg border border-gray-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-700" />
            <h2 className="text-base font-bold text-gray-950">
              Email Selected Candidates ({selectedCandidates.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-black rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSentSuccess ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-3 animate-bounce" />
            <h3 className="text-base font-bold text-gray-900">
              Emails Dispatched Successfully
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Sent notification to {selectedCandidates.length} candidate(s).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-6 overflow-y-auto space-y-4 text-xs">
            {/* Recipients list chip display */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Recipients ({selectedCandidates.length})
              </label>
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded max-h-24 overflow-y-auto flex flex-wrap gap-1">
                {selectedCandidates.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 text-gray-800 text-[11px] rounded"
                  >
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-gray-400 font-mono text-[10px]">
                      &lt;{c.email}&gt;
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Template Selector */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Template Preset
              </label>
              <div className="flex flex-wrap gap-2">
                {EMAIL_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTemplateChange(t.id)}
                    className={`px-2.5 py-1 text-xs rounded border transition cursor-pointer ${
                      templateId === t.id
                        ? 'bg-black text-white border-black font-semibold'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Subject Line
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Message Body
              </label>
              <textarea
                rows={7}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black font-sans leading-relaxed text-xs"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Supported dynamic tags: {'{name}'}, {'{role}'}, {'{status}'}, {'{location}'}
              </p>
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
                disabled={isSending}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-black hover:bg-gray-800 text-white rounded font-medium transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Dispatching...' : `Send to ${selectedCandidates.length} Candidates`}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
