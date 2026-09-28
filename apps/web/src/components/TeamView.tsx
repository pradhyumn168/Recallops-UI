import React, { useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Shield,
  PhoneCall,
  CheckCircle2,
  X,
  AlertTriangle,
  UserPlus,
  Radio,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { TeamMember } from '../types';

interface TeamViewProps {
  teamMembers: TeamMember[];
  onAddTeamMember: (member: TeamMember) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({
  teamMembers,
  onAddTeamMember,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Lead SRE');
  const [teamService, setTeamService] = useState('checkout-service');
  const [onCallStatus, setOnCallStatus] = useState<TeamMember['on_call_status']>('Available');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Generate initials from name
    const initials = name
      .trim()
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    // Pick a distinct color
    const colors = [
      'bg-indigo-600',
      'bg-purple-600',
      'bg-sky-600',
      'bg-teal-600',
      'bg-rose-600',
      'bg-emerald-600',
      'bg-amber-600',
    ];
    const avatar_color = colors[Math.floor(Math.random() * colors.length)];

    const newMember: TeamMember = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      team_service: teamService,
      on_call_status: onCallStatus,
      initials: initials || 'SR',
      avatar_color,
      is_lead: onCallStatus === 'Primary On-Call',
    };

    onAddTeamMember(newMember);

    // Reset form
    setName('');
    setEmail('');
    setRole('Lead SRE');
    setTeamService('checkout-service');
    setOnCallStatus('Available');
    setErrors({});
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: TeamMember['on_call_status']) => {
    switch (status) {
      case 'Primary On-Call':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Primary On-Call</span>
          </span>
        );
      case 'Secondary On-Call':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Secondary On-Call</span>
          </span>
        );
      case 'Available':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Available</span>
          </span>
        );
      case 'Off-Duty':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Off-Duty</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" role="region" aria-label="Team Management and On-Call Roster">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-800">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Platform SRE Team & Responders
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Managed incident responders, on-call schedules, and escalation policies recalled from Hindsight team memory bank
          </p>
        </div>

        {/* PROMINENT ADD TEAM MEMBER BUTTON */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Team Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white dark:bg-[#161F36] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg hover:shadow-md hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                {/* TRUE CIRCLE AVATAR: aspect-square, w-11 h-11, rounded-full */}
                <div
                  className={`w-11 h-11 min-w-[44px] min-h-[44px] aspect-square rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs ring-2 ring-slate-100 dark:ring-slate-700 select-none ${
                    member.avatar_color || 'bg-brand-600'
                  }`}
                >
                  {member.initials}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {member.name}
                  </h3>
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                    {member.role}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {member.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Team / Service
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  {member.team_service}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Availability
                </span>
                {getStatusBadge(member.on_call_status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Escalation Policies & Constraints from Hindsight Memory */}
      <div className="bg-white dark:bg-[#161F36] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg space-y-4 transition-colors">
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Shield className="w-4 h-4 text-brand-500" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            Escalation Rules & Mandatory Operational Constraints
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Recalled from Hindsight <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">team</span> memory bank to ensure compliance during high-severity outages.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <PhoneCall className="w-3.5 h-3.5 text-brand-500" />
              <span>Active Escalation Rotation</span>
            </h4>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              • <strong className="text-slate-900 dark:text-white">Alice Chen (Primary Lead)</strong> — Slack: #incident-checkout-p1
            </p>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              • <strong className="text-slate-900 dark:text-white">Bob Martinez (Secondary SRE)</strong> — PagerDuty Tier 2
            </p>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              • <strong className="text-slate-900 dark:text-white">Alex Rivera (Platform Incident Commander)</strong> — Escalation point
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Lock className="w-3.5 h-3.5 text-rose-500" />
              <span>Mandatory Safety Constraints</span>
            </h4>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              • Cache configuration releases require strict <span className="font-bold text-slate-900 dark:text-white">5% canary deployment</span> before 100% rollout.
            </p>
            <p className="text-rose-600 dark:text-rose-400 font-bold">
              • Pod restarts under active Redis max-memory eviction cascades are strictly prohibited.
            </p>
          </div>
        </div>
      </div>

      {/* ADD TEAM MEMBER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#161F36] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in zoom-in-95 duration-150 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-900">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Add Team Member
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Vance"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium ${
                    errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.name && <p className="text-rose-500 text-[11px] font-semibold">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. david.vance@company.internal"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium ${
                    errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.email && <p className="text-rose-500 text-[11px] font-semibold">{errors.email}</p>}
              </div>

              {/* Role & Team/Service */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-semibold"
                  >
                    <option value="Lead SRE">Lead SRE</option>
                    <option value="Secondary SRE">Secondary SRE</option>
                    <option value="Incident Commander">Incident Commander</option>
                    <option value="Platform Engineer">Platform Engineer</option>
                    <option value="Database Specialist">Database Specialist</option>
                    <option value="Security Responder">Security Responder</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Team / Service</label>
                  <select
                    value={teamService}
                    onChange={(e) => setTeamService(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-semibold"
                  >
                    <option value="checkout-service">checkout-service</option>
                    <option value="Core Infrastructure">Core Infrastructure</option>
                    <option value="Data Platform">Data Platform</option>
                    <option value="Payment Gateway">Payment Gateway</option>
                    <option value="Platform Ops">Platform Ops</option>
                  </select>
                </div>
              </div>

              {/* On-Call Status */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">On-Call Availability Status</label>
                <select
                  value={onCallStatus}
                  onChange={(e) => setOnCallStatus(e.target.value as TeamMember['on_call_status'])}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-semibold"
                >
                  <option value="Primary On-Call">Primary On-Call</option>
                  <option value="Secondary On-Call">Secondary On-Call</option>
                  <option value="Available">Available</option>
                  <option value="Off-Duty">Off-Duty</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamView;
