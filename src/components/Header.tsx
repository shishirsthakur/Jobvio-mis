import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Briefcase,
  Plus,
  Bell,
  HelpCircle,
  CheckCircle2,
  Users,
  LayoutGrid,
  Database,
  Building2,
  Check,
  UserPlus,
  LogOut,
  Award,
  Clock,
  Send,
  AlertCircle,
  ExternalLink,
  Sparkles,
  X,
} from 'lucide-react';
import { ActivePage, PipelineNotification } from '../types';

interface HeaderProps {
  activePage: ActivePage;
  onPageChange: (page: ActivePage) => void;
  candidateCount: number;
  clientCount: number;
  onOpenNewCandidate: () => void;
  onOpenNewClient?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCommandPalette: () => void;
  onOpenImportData?: () => void;
  onTriggerToast?: (msg: string) => void;
  currentUser?: { email?: string | null; displayName?: string | null } | null;
  onSignOut?: () => void;
  pipelineNotifications?: PipelineNotification[];
  onClearNotifications?: () => void;
  onMarkNotificationsAsRead?: () => void;
  onSelectNotification?: (notif: PipelineNotification) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onPageChange,
  candidateCount,
  clientCount,
  onOpenNewCandidate,
  onOpenNewClient,
  searchQuery,
  onSearchChange,
  onOpenCommandPalette,
  onOpenImportData,
  onTriggerToast,
  currentUser,
  onSignOut,
  pipelineNotifications = [],
  onClearNotifications,
  onMarkNotificationsAsRead,
  onSelectNotification,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'ALL' | 'HIRING' | 'CLIENTS'>('ALL');

  const addMenuRef = useRef<HTMLDivElement>(null);
  const notificationsContainerRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Click outside listener for Add Menu, Notifications, and Profile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (addMenuRef.current && !addMenuRef.current.contains(target)) {
        setShowAddMenu(false);
      }
      if (notificationsContainerRef.current && !notificationsContainerRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
    };
    if (showAddMenu || showNotifications || showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddMenu, showNotifications, showProfileMenu]);

  const unreadCount = pipelineNotifications.filter((n) => n.isUnread).length;

  const filteredNotifications = pipelineNotifications.filter((n) => {
    if (notificationFilter === 'HIRING') return n.category === 'HIRING';
    if (notificationFilter === 'CLIENTS') return n.category === 'CLIENT_ONBOARDING' || n.category === 'MANDATE';
    return true;
  });

  const hiringCount = pipelineNotifications.filter((n) => n.category === 'HIRING').length;
  const clientCategoryCount = pipelineNotifications.filter(
    (n) => n.category === 'CLIENT_ONBOARDING' || n.category === 'MANDATE'
  ).length;

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1560px] mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        {/* Brand & Left Live Search */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Logo */}
          <button
            onClick={() => onPageChange('overview')}
            className="flex items-center gap-2.5 focus:outline-none cursor-pointer"
            title="Jobvio Recruitment Intelligence"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiw1ZnhdmSvlNakZSbk3o244fAcV1Y_ogFZJvKU4KLpBhvkljfg4EXJtDa8QLtaPopUv9oeLF2xXqY5c20HA0sJCK53Brm8XLhbSMzgWmHuAWKzO1l-JofCBppnmN0iqO8CuLGLD2YZ65WDIxY9bvVHLr6-qJNwPoL4DIuDtNa07l-PRpqXUTwX6-6TziLSkd8Tvw7gBdAmZbteruvyPeEuPEWhy_oTDfiE_ZcziVkw0Y8pvSw2SB3yPS97M9lgWqztA"
              alt="Jobvio"
              className="h-9 sm:h-10 md:h-11 max-h-11 w-auto object-contain object-left shrink-0"
            />
          </button>

          {/* Search Bar */}
          <div className="relative hidden md:block w-64 lg:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="globalSearchInput"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Live candidate query... (Cmd+K)"
              className="w-full h-8 pl-8 pr-12 text-xs bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black rounded transition"
            />
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="absolute inset-y-0 right-1.5 my-auto h-5 px-1.5 flex items-center bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded text-[10px] font-mono text-gray-500 font-medium tracking-tight transition cursor-pointer"
              title="Command Palette (Cmd+K)"
            >
              ⌘K
            </button>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden sm:flex items-center space-x-2 md:space-x-6 h-full pt-1.5">
          {/* Overview Tab */}
          <button
            id="tab-overview"
            onClick={() => onPageChange('overview')}
            className={`h-full pb-1 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer px-1.5 ${
              activePage === 'overview'
                ? 'border-black text-gray-950 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
            title="Overview Dashboard"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden lg:inline">Overview</span>
          </button>

          {/* Candidates Tab */}
          <button
            id="tab-candidates"
            onClick={() => onPageChange('candidates')}
            className={`h-full pb-1 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer px-1.5 ${
              activePage === 'candidates'
                ? 'border-black text-gray-950 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
            title="Candidates Database"
          >
            <Users className="w-4 h-4" />
            <span>Candidates</span>
            <span
              id="navCandidateCount"
              className="font-mono text-[10px] px-1.5 py-0.2 bg-gray-100 border border-gray-200 text-gray-800 rounded font-semibold"
            >
              {candidateCount}
            </span>
          </button>

          {/* Clients Tab */}
          <button
            id="tab-clients"
            onClick={() => onPageChange('clients')}
            className={`h-full pb-1 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer px-1.5 ${
              activePage === 'clients'
                ? 'border-black text-gray-950 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
            title="Clients & Jobs"
          >
            <Briefcase className="w-4 h-4" />
            <span>Clients & Jobs</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 bg-gray-100 border border-gray-200 text-gray-700 rounded font-semibold hidden lg:inline">
              {clientCount}
            </span>
          </button>
        </nav>

        {/* Right Trailing Controls */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Quick Add Dropdown (Candidates & Clients) */}
          <div className="relative" ref={addMenuRef}>
            <button
              id="header-quick-add-btn"
              onClick={() => {
                setShowAddMenu(!showAddMenu);
                setShowNotifications(false);
                setShowProfileMenu(false);
              }}
              title="Quick Add: Candidate or Client Partner"
              aria-label="Quick Add Menu"
              aria-expanded={showAddMenu}
              className={`w-8 h-8 rounded flex items-center justify-center transition cursor-pointer shadow-xs ${
                showAddMenu
                  ? 'bg-neutral-900 text-white ring-2 ring-black/20'
                  : 'bg-black hover:bg-neutral-800 text-white'
              }`}
            >
              <Plus
                className={`w-4 h-4 stroke-[2.5] transition-transform duration-200 ${
                  showAddMenu ? 'rotate-45' : ''
                }`}
              />
            </button>

            {showAddMenu && (
              <div
                id="quick-add-dropdown-menu"
                className="absolute right-0 mt-2 w-72 bg-white rounded-lg border border-gray-200 shadow-xl p-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2"
              >
                <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between text-gray-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-gray-500">
                    Quick Create
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">ESC to close</span>
                </div>

                <div className="py-1 space-y-1">
                  {/* Add Candidate */}
                  <button
                    id="quick-add-candidate-action"
                    onClick={() => {
                      setShowAddMenu(false);
                      onOpenNewCandidate();
                    }}
                    className="w-full text-left p-2.5 rounded hover:bg-gray-50 flex items-start gap-2.5 group transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded bg-gray-100 text-gray-800 group-hover:bg-black group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-900 group-hover:text-black">
                          Add Candidate
                        </span>
                        <span className="text-[9px] font-mono px-1 py-0.2 bg-gray-100 text-gray-600 rounded border border-gray-200">
                          Talent
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        Profile, skills, compensation & status
                      </p>
                    </div>
                  </button>

                  {/* Add Client Partner */}
                  <button
                    id="quick-add-client-action"
                    onClick={() => {
                      setShowAddMenu(false);
                      if (onOpenNewClient) {
                        onOpenNewClient();
                      } else {
                        onPageChange('clients');
                      }
                    }}
                    className="w-full text-left p-2.5 rounded hover:bg-gray-50 flex items-start gap-2.5 group transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded bg-gray-100 text-gray-800 group-hover:bg-black group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-900 group-hover:text-black">
                          Add Client Partner
                        </span>
                        <span className="text-[9px] font-mono px-1 py-0.2 bg-gray-100 text-gray-600 rounded border border-gray-200">
                          Company
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        Corporate partner & job requisitions
                      </p>
                    </div>
                  </button>
                </div>

                <div className="pt-1.5 pb-1 px-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                  <span>Global command palette</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-semibold border border-gray-200">
                    ⌘K
                  </kbd>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <div ref={notificationsContainerRef} className="relative">
            <button
              id="header-notification-btn"
              title={unreadCount > 0 ? `${unreadCount} unread pipeline activity alerts` : 'Pipeline Activity'}
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className={`relative w-8 h-8 border rounded flex items-center justify-center transition cursor-pointer shadow-xs ${
                showNotifications
                  ? 'bg-black text-white border-black'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span
                  id="pipeline-activity-badge"
                  className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-black text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center border border-white shadow-xs animate-pulse"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                ref={notificationsRef}
                id="notifications-popover"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg border border-gray-200 shadow-xl p-3.5 z-50 text-xs animate-in fade-in slide-in-from-top-2"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-950 font-mono tracking-tight text-sm">
                      Pipeline Activity
                    </span>
                    {unreadCount > 0 ? (
                      <span className="px-1.5 py-0.2 bg-black text-white text-[10px] font-mono font-semibold rounded">
                        {unreadCount} new
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 bg-gray-100 text-gray-600 text-[10px] font-mono rounded">
                        live
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && onMarkNotificationsAsRead && (
                      <button
                        id="pipeline-activity-mark-read-btn"
                        onClick={() => {
                          onMarkNotificationsAsRead();
                          if (onTriggerToast) onTriggerToast('Marked all activity notifications as read');
                        }}
                        className="text-[10px] text-gray-600 hover:text-black font-medium cursor-pointer"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      id="pipeline-activity-clear-btn"
                      onClick={() => {
                        if (onClearNotifications) {
                          onClearNotifications();
                        }
                        setShowNotifications(false);
                        if (onTriggerToast) onTriggerToast('Pipeline activity notifications cleared');
                      }}
                      className="text-[10px] text-gray-400 hover:text-rose-600 font-mono cursor-pointer transition"
                    >
                      Clear All
                    </button>
                    <button
                      id="pipeline-activity-close-btn"
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-black p-0.5 rounded transition cursor-pointer hover:bg-gray-100"
                      title="Close popover"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 mb-2.5 bg-gray-100/80 p-0.5 rounded text-[11px] font-medium">
                  <button
                    onClick={() => setNotificationFilter('ALL')}
                    className={`flex-1 py-1 px-2 text-center rounded transition cursor-pointer ${
                      notificationFilter === 'ALL'
                        ? 'bg-white text-gray-950 shadow-xs font-semibold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    All ({pipelineNotifications.length})
                  </button>
                  <button
                    onClick={() => setNotificationFilter('HIRING')}
                    className={`flex-1 py-1 px-2 text-center rounded transition cursor-pointer ${
                      notificationFilter === 'HIRING'
                        ? 'bg-white text-gray-950 shadow-xs font-semibold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Hiring ({hiringCount})
                  </button>
                  <button
                    onClick={() => setNotificationFilter('CLIENTS')}
                    className={`flex-1 py-1 px-2 text-center rounded transition cursor-pointer ${
                      notificationFilter === 'CLIENTS'
                        ? 'bg-white text-gray-950 shadow-xs font-semibold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Clients ({clientCategoryCount})
                  </button>
                </div>

                {/* Notifications Scroll List */}
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
                  {filteredNotifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 font-mono text-[11px]">
                      <p>No activity notifications recorded.</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        All hiring stage updates and client onboardings will alert here in real time.
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notif) => {
                      // Color and badge mappings
                      let bgClass = 'bg-white hover:bg-gray-50 border-gray-200';
                      let icon = <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />;

                      if (notif.statusBadge === 'JOINED') {
                        bgClass = 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200';
                        icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />;
                      } else if (notif.statusBadge === 'OFFERED' || notif.statusBadge === 'OFFER EXTENDED') {
                        bgClass = 'bg-emerald-50/40 hover:bg-emerald-50/70 border-emerald-200';
                        icon = <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
                      } else if (notif.statusBadge === 'INTERVIEWING') {
                        bgClass = 'bg-purple-50/40 hover:bg-purple-50/70 border-purple-200';
                        icon = <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
                      } else if (notif.category === 'CLIENT_ONBOARDING') {
                        bgClass = 'bg-emerald-50/40 hover:bg-emerald-50/70 border-emerald-200';
                        icon = <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />;
                      } else if (notif.category === 'MANDATE') {
                        bgClass = 'bg-indigo-50/40 hover:bg-indigo-50/70 border-indigo-200';
                        icon = <Briefcase className="w-3.5 h-3.5 text-indigo-700 shrink-0" />;
                      } else if (notif.statusBadge === 'SUBMITTED') {
                        bgClass = 'bg-indigo-50/40 hover:bg-indigo-50/70 border-indigo-200';
                        icon = <Send className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
                      } else if (notif.statusBadge === 'REJECTED') {
                        bgClass = 'bg-rose-50/40 hover:bg-rose-50/70 border-rose-200';
                        icon = <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
                      }

                      return (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (onSelectNotification) {
                              onSelectNotification(notif);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-2.5 rounded-lg border transition ${bgClass} ${
                            onSelectNotification ? 'cursor-pointer' : ''
                          } ${notif.isUnread ? 'ring-1 ring-black/10' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {icon}
                              <div className="font-semibold text-[11px] text-gray-950 truncate">
                                {notif.title}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {notif.isUnread && (
                                <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                              )}
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-medium bg-white text-gray-700 border-gray-200">
                                {notif.statusBadge}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                            {notif.subtitle}
                          </p>
                          <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-gray-100/80 text-[10px] text-gray-400 font-mono">
                            <span>{notif.timeFormatted}</span>
                            {onSelectNotification && (
                              <span className="text-gray-500 hover:text-black inline-flex items-center gap-0.5 font-sans font-medium">
                                View details →
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button
            id="header-help-btn"
            title="MIS Portal v2.4 Reference Documentation loaded"
            onClick={() => {
              if (onTriggerToast) {
                onTriggerToast('MIS Portal v2.4 Reference Documentation loaded');
              } else {
                onOpenCommandPalette();
              }
            }}
            className="w-8 h-8 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded flex items-center justify-center transition cursor-pointer shadow-xs"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User Profile Avatar */}
          <div className="relative">
            {(() => {
              const displayEmail = currentUser?.email || 'shararyan64@gmail.com';
              const displayName = currentUser?.displayName || 'Recruiter Admin';
              const initials = (displayName || displayEmail)
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'AD';

              return (
                <>
                  <button
                    id="header-user-avatar"
                    title={`${displayName} (${displayEmail})`}
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifications(false);
                    }}
                    className="w-8 h-8 bg-black text-white text-xs font-semibold rounded flex items-center justify-center select-none cursor-pointer tracking-wider hover:opacity-90 transition shadow-xs"
                  >
                    {initials}
                  </button>

                  {showProfileMenu && (
                    <div
                      id="user-profile-menu"
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-xl p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2"
                    >
                      <div className="p-2 border-b border-gray-100 mb-1">
                        <div className="font-semibold text-gray-900 truncate">{displayName}</div>
                        <div className="text-[11px] text-gray-500 truncate">{displayEmail}</div>
                      </div>
                      {onOpenImportData && (
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenImportData();
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                        >
                          <Database className="w-3.5 h-3.5 text-gray-500" />
                          <span>Manage / Import Data</span>
                        </button>
                      )}
                      {onSignOut && (
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onSignOut();
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer mt-1"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-500" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation for small screens */}
      <div className="sm:hidden flex items-center justify-around border-t border-gray-100 bg-gray-50/50 py-1.5 px-2">
        <button
          onClick={() => onPageChange('overview')}
          className={`px-3 py-1 text-xs font-semibold rounded ${
            activePage === 'overview' ? 'bg-black text-white' : 'text-gray-600'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => onPageChange('candidates')}
          className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 ${
            activePage === 'candidates' ? 'bg-black text-white' : 'text-gray-600'
          }`}
        >
          <span>Candidates</span>
          <span className="text-[10px] font-mono font-bold">({candidateCount})</span>
        </button>
        <button
          onClick={() => onPageChange('clients')}
          className={`px-3 py-1 text-xs font-semibold rounded ${
            activePage === 'clients' ? 'bg-black text-white' : 'text-gray-600'
          }`}
        >
          Clients & Jobs
        </button>
      </div>
    </header>
  );
};
