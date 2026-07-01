import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, Filter, Loader2, AlertCircle,
  CheckCircle, XCircle, PlayCircle, FlagTriangleRight, Clock,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { getBarberByUserId } from '../../firebase/barberService';
import { getBarberAllBookings, updateBookingStatus } from '../../firebase/bookingService';
import { todayString } from '../../utils/slots';

/* ── Helpers ─────────────────────────────────────────────────────── */

const STATUS_OPTIONS = ['All', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
const STATUS_LABELS  = {
  pending: 'Pending', confirmed: 'Confirmed', in_progress: 'In Progress',
  completed: 'Completed', cancelled: 'Cancelled', no_show: 'No Show',
};

function offsetDate(n) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function getAllowedActions(status) {
  switch (status) {
    case 'pending':     return ['confirmed', 'cancelled'];
    case 'confirmed':   return ['in_progress', 'completed', 'no_show', 'cancelled'];
    case 'in_progress': return ['completed', 'no_show'];
    default:            return [];
  }
}

const ACTION_META = {
  confirmed:   { label: 'Accept',        icon: CheckCircle,       isDestructive: false },
  in_progress: { label: 'Start Service', icon: PlayCircle,        isDestructive: false },
  completed:   { label: 'Complete',      icon: CheckCircle,       isDestructive: false },
  cancelled:   { label: 'Cancel',        icon: XCircle,           isDestructive: true  },
  no_show:     { label: 'No Show',       icon: FlagTriangleRight, isDestructive: true  },
};

/** Styles for each action button */
function actionBtnClass(nextStatus) {
  if (ACTION_META[nextStatus]?.isDestructive)
    return 'border border-error/40 text-error hover:bg-error hover:text-white';
  if (nextStatus === 'completed')
    return 'bg-navy text-white hover:bg-navy-hover';
  if (nextStatus === 'confirmed')
    return 'bg-success/10 text-success border border-success/30 hover:bg-success hover:text-white';
  return 'bg-muted text-navy border border-border hover:bg-navy hover:text-white';
}

/* ── Component ───────────────────────────────────────────────────── */

export const BarberAppointmentsPage = () => {
  const { user } = useAuth();

  const [barber, setBarber]             = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const [activeTab, setActiveTab]       = useState('Today');
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedId, setExpandedId]     = useState(null); // mobile card expand

  const [pendingAction, setPendingAction] = useState(null);
  const [isUpdating, setIsUpdating]       = useState(false);

  const TABS = ['Today', 'Upcoming', 'Past', 'All'];

  /* ---- Load -------------------------------------------------------- */
  const loadAppointments = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError(null);
    try {
      let b = barber;
      if (!b) { b = await getBarberByUserId(user.uid); setBarber(b); }
      if (!b) { setError('Barber profile not found for your account.'); return; }
      const bookings = await getBarberAllBookings(b.id);
      setAppointments(bookings);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally { setLoading(false); }
  }, [user]); // eslint-disable-line

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  /* ---- Filtering --------------------------------------------------- */
  const today    = todayString();
  const tomorrow = offsetDate(1);

  const filtered = appointments
    .filter(apt => {
      switch (activeTab) {
        case 'Today':    return apt.date === today;
        case 'Upcoming': return apt.date > today;
        case 'Past':     return apt.date < today;
        default:         return true;
      }
    })
    .filter(apt => filterStatus === 'All' || apt.status === filterStatus)
    .filter(apt => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        apt.customerName?.toLowerCase().includes(q) ||
        apt.serviceName?.toLowerCase().includes(q)  ||
        apt.bookingId?.toLowerCase().includes(q)    ||
        apt.customerPhone?.includes(q)
      );
    });

  const tabCounts = {
    Today:    appointments.filter(a => a.date === today).length,
    Upcoming: appointments.filter(a => a.date > today).length,
    Past:     appointments.filter(a => a.date < today).length,
    All:      appointments.length,
  };

  /* ---- Actions ----------------------------------------------------- */
  const handleActionClick = (apt, nextStatus) => setPendingAction({ apt, nextStatus });

  const confirmAction = async () => {
    if (!pendingAction) return;
    const { apt, nextStatus } = pendingAction;
    setIsUpdating(true);
    try {
      await updateBookingStatus(apt.id, nextStatus);
      setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, status: nextStatus } : a));
      setPendingAction(null);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update appointment status. Please try again.');
    } finally { setIsUpdating(false); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    if (dateStr === today)    return 'Today';
    if (dateStr === tomorrow) return 'Tomorrow';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  /* ---- Loading / Error --------------------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  if (error && !appointments.length) {
    return (
      <div className="bg-error/5 border border-error/20 text-error rounded-2xl p-8 flex flex-col items-center gap-4">
        <AlertCircle className="w-10 h-10" />
        <p className="font-semibold">{error}</p>
        <Button variant="ghost" onClick={loadAppointments}>
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  /* ---- Render action buttons --------------------------------------- */
  const ActionButtons = ({ apt }) => {
    const actions = getAllowedActions(apt.status);
    if (!actions.length) return <span className="text-xs text-text-muted italic">—</span>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {actions.map(ns => {
          const meta = ACTION_META[ns]; if (!meta) return null;
          const Icon = meta.icon;
          return (
            <button
              key={ns}
              onClick={() => handleActionClick(apt, ns)}
              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${actionBtnClass(ns)}`}
            >
              <Icon className="w-3 h-3" />
              {meta.label}
            </button>
          );
        })}
      </div>
    );
  };

  /* ---- Main render ------------------------------------------------- */
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-1">Appointments</h1>
          <p className="text-sm text-text-secondary">Manage and update all your bookings.</p>
        </div>
        <Button variant="ghost" className="bg-white border-border text-text-primary self-start sm:self-center" onClick={loadAppointments}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 bg-error/5 border border-error/20 text-error rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-border hide-scrollbar px-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3.5 whitespace-nowrap text-sm font-medium transition-colors relative flex items-center gap-1.5 ${
                activeTab === tab ? 'text-navy' : 'text-text-secondary hover:text-navy hover:bg-muted/40'
              }`}
            >
              {tab}
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                activeTab === tab ? 'bg-navy text-white' : 'bg-muted text-text-muted'
              }`}>
                {tabCounts[tab]}
              </span>
              {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gold rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="p-3 md:p-4 border-b border-border flex flex-col sm:flex-row gap-2 md:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search name, service, booking ID…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-navy outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto pl-9 pr-8 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-navy outline-none bg-white appearance-none cursor-pointer"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Statuses' : STATUS_LABELS[s] || s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Desktop table (md+) ──────────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border">
                <th className="p-4">Date / Time</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Service</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-text-muted">
                      <Clock className="w-9 h-9 opacity-30" />
                      <p className="font-medium text-sm">
                        {searchTerm || filterStatus !== 'All'
                          ? 'No appointments match your filters.'
                          : `No ${activeTab.toLowerCase()} appointments.`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(apt => (
                  <tr key={apt.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <span className="font-semibold text-navy text-sm">{apt.slot}</span>
                      <div className="text-xs text-text-muted mt-0.5">{formatDate(apt.date)}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-text-primary text-sm">{apt.customerName || '—'}</div>
                      {apt.customerPhone && <div className="text-xs text-text-muted">{apt.customerPhone}</div>}
                    </td>
                    <td className="p-4 text-sm text-text-secondary">{apt.serviceName || '—'}</td>
                    <td className="p-4 text-sm text-text-secondary">{apt.duration ? `${apt.duration} min` : '—'}</td>
                    <td className="p-4 text-sm font-medium text-text-secondary">
                      {apt.price ? `NPR ${apt.price.toLocaleString()}` : '—'}
                    </td>
                    <td className="p-4"><StatusBadge status={apt.status} /></td>
                    <td className="p-4"><div className="flex justify-end"><ActionButtons apt={apt} /></div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile card list (< md) ───────────────────────────────── */}
        <div className="md:hidden divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-9 h-9 mx-auto mb-2 opacity-30 text-text-muted" />
              <p className="font-medium text-sm text-text-muted">
                {searchTerm || filterStatus !== 'All'
                  ? 'No appointments match your filters.'
                  : `No ${activeTab.toLowerCase()} appointments.`}
              </p>
            </div>
          ) : (
            filtered.map(apt => {
              const isOpen = expandedId === apt.id;
              return (
                <div key={apt.id} className="p-4">
                  {/* Top row: time + status + expand toggle */}
                  <div
                    className="flex items-start justify-between gap-2 cursor-pointer"
                    onClick={() => setExpandedId(isOpen ? null : apt.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-navy">{apt.slot}</span>
                        <span className="text-xs text-text-muted">{formatDate(apt.date)}</span>
                      </div>
                      <p className="font-semibold text-text-primary text-sm truncate">{apt.customerName || '—'}</p>
                      <p className="text-xs text-text-secondary truncate">{apt.serviceName || '—'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={apt.status} />
                      {isOpen
                        ? <ChevronUp className="w-4 h-4 text-text-muted" />
                        : <ChevronDown className="w-4 h-4 text-text-muted" />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {apt.customerPhone && (
                          <div>
                            <p className="text-xs text-text-muted">Phone</p>
                            <p className="font-medium text-text-primary">{apt.customerPhone}</p>
                          </div>
                        )}
                        {apt.duration && (
                          <div>
                            <p className="text-xs text-text-muted">Duration</p>
                            <p className="font-medium text-text-primary">{apt.duration} min</p>
                          </div>
                        )}
                        {apt.price > 0 && (
                          <div>
                            <p className="text-xs text-text-muted">Price</p>
                            <p className="font-medium text-text-primary">NPR {apt.price.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      <div className="pt-1">
                        <ActionButtons apt={apt} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 md:p-4 border-t border-border text-sm text-text-muted">
          Showing <span className="font-semibold text-navy">{filtered.length}</span> of{' '}
          <span className="font-semibold text-navy">{appointments.length}</span> appointments
        </div>
      </div>

      {/* Confirm dialog */}
      {pendingAction && (
        <ConfirmDialog
          isOpen={!!pendingAction}
          onClose={() => setPendingAction(null)}
          onConfirm={confirmAction}
          title={
            pendingAction.nextStatus === 'confirmed'   ? 'Accept Booking'   :
            pendingAction.nextStatus === 'in_progress' ? 'Start Service'    :
            pendingAction.nextStatus === 'completed'   ? 'Complete Service' :
            pendingAction.nextStatus === 'cancelled'   ? 'Cancel Booking'   :
            pendingAction.nextStatus === 'no_show'     ? 'Mark as No Show'  : 'Update Status'
          }
          message={
            pendingAction.nextStatus === 'cancelled'
              ? `Cancel ${pendingAction.apt.customerName}'s booking? This cannot be undone.`
              : `Update ${pendingAction.apt.customerName}'s appointment to "${STATUS_LABELS[pendingAction.nextStatus]}"?`
          }
          confirmText={ACTION_META[pendingAction.nextStatus]?.label || 'Confirm'}
          cancelText="Go Back"
          isDestructive={ACTION_META[pendingAction.nextStatus]?.isDestructive}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
};
