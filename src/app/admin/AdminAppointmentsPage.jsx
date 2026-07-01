import React, { useState, useEffect, useCallback } from 'react';
import { Filter, Search, Download, ChevronRight, Loader2, AlertCircle, X, Trash2, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { getAllBookings, updateBookingStatus, deleteBooking, exportBookingsToCsv } from '../../firebase/bookingService';
import { getActiveBarbers } from '../../firebase/barberService';

const STATUSES = ['All Status', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
const STATUS_LABELS = {
  pending: 'Pending', confirmed: 'Confirmed', in_progress: 'In Progress',
  completed: 'Completed', cancelled: 'Cancelled', no_show: 'No Show',
};

export const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [barbers, setBarbers]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const [searchTerm, setSearchTerm]     = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterBarber, setFilterBarber] = useState('All Barbers');
  const [filterDate, setFilterDate]     = useState('All Dates');

  const [selectedApt, setSelectedApt]   = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Delete confirm dialog
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, aptId: null, aptName: '' });
  const [deleting, setDeleting]         = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookings, barberList] = await Promise.all([
        getAllBookings(),
        getActiveBarbers()
      ]);
      setAppointments(bookings);
      setBarbers(barberList);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ---- Date helpers ------------------------------------------------- */
  const todayStr = () => {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
  };
  const tomorrowStr = () => {
    const d = new Date(); d.setDate(d.getDate()+1);
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
  };

  /* ---- Filtering ----------------------------------------------------- */
  const filtered = appointments.filter(apt => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = !search ||
      apt.customerName?.toLowerCase().includes(search) ||
      apt.customerPhone?.includes(search) ||
      apt.bookingId?.toLowerCase().includes(search) ||
      apt.serviceName?.toLowerCase().includes(search) ||
      apt.barberName?.toLowerCase().includes(search);

    const matchesStatus = filterStatus === 'All Status' || apt.status === filterStatus;
    const matchesBarber = filterBarber === 'All Barbers' || apt.barberId === filterBarber;

    let matchesDate = true;
    if (filterDate === 'Today') matchesDate = apt.date === todayStr();
    else if (filterDate === 'Tomorrow') matchesDate = apt.date === tomorrowStr();
    else if (filterDate === 'This Week') {
      const now = new Date(); const d = new Date(apt.date + 'T00:00:00');
      const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd   = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
      matchesDate = d >= weekStart && d <= weekEnd;
    }

    return matchesSearch && matchesStatus && matchesBarber && matchesDate;
  });

  /* ---- Actions ------------------------------------------------------- */
  const handleStatusUpdate = async (newStatus) => {
    if (!selectedApt) return;
    setUpdatingStatus(true);
    try {
      await updateBookingStatus(selectedApt.id, newStatus);
      const updated = { ...selectedApt, status: newStatus };
      setAppointments(prev => prev.map(a => a.id === selectedApt.id ? updated : a));
      setSelectedApt(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openDeleteDialog = (apt, e) => {
    e?.stopPropagation();
    setDeleteDialog({ isOpen: true, aptId: apt.id, aptName: apt.customerName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.aptId) return;
    setDeleting(true);
    try {
      await deleteBooking(deleteDialog.aptId);
      setAppointments(prev => prev.filter(a => a.id !== deleteDialog.aptId));
      if (selectedApt?.id === deleteDialog.aptId) setSelectedApt(null);
    } catch (err) {
      console.error('Failed to delete appointment:', err);
    } finally {
      setDeleting(false);
      setDeleteDialog({ isOpen: false, aptId: null, aptName: '' });
    }
  };

  const handleExportCsv = () => {
    exportBookingsToCsv(filtered, `appointments-${filterDate.replace(' ', '_').toLowerCase()}.csv`);
  };

  /* ---- Loading / Error ---------------------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-1">All Appointments</h1>
          <p className="text-sm text-text-secondary">Manage and track all bookings across the shop.</p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <Button variant="secondary" className="bg-white border-border text-navy hover:bg-muted" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="secondary"
            className="bg-white border-border text-navy hover:bg-muted"
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-border">
          <AlertCircle className="w-10 h-10 text-error mb-4" />
          <p className="text-error font-medium">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={loadData}>Try Again</Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-border bg-muted/30 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex-1 min-w-[220px] max-w-sm relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search by name, phone, ID, barber..."
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-navy focus:border-navy text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                className="border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
              >
                {['All Dates', 'Today', 'Tomorrow', 'This Week'].map(o => <option key={o}>{o}</option>)}
              </select>
              <select
                className="border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s === 'All Status' ? 'All Statuses' : STATUS_LABELS[s] || s}</option>
                ))}
              </select>
              <select
                className="border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy"
                value={filterBarber}
                onChange={e => setFilterBarber(e.target.value)}
              >
                <option>All Barbers</option>
                {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border">
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Barber</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Slot</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-text-muted">
                      {searchTerm || filterStatus !== 'All Status' || filterBarber !== 'All Barbers' || filterDate !== 'All Dates'
                        ? 'No appointments match your filters.'
                        : 'No appointments found.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(apt => (
                    <tr key={apt.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => setSelectedApt(apt)}>
                      <td className="p-4">
                        <span className="font-mono text-sm text-gold font-medium">{apt.bookingId}</span>
                        <div className="text-[10px] uppercase font-semibold text-text-muted mt-1 px-2 py-0.5 bg-muted rounded-full inline-block ml-1">
                          {apt.source}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-text-primary">{apt.customerName}</p>
                        <p className="text-xs text-text-secondary mt-0.5">{apt.customerPhone}</p>
                      </td>
                      <td className="p-4 text-sm text-text-secondary">{apt.barberName || '—'}</td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-text-primary">{apt.serviceName}</p>
                        <p className="text-xs text-text-muted mt-0.5">{apt.duration} min</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-navy">{apt.slot}</p>
                        <p className="text-xs text-text-secondary mt-0.5">{apt.date}</p>
                      </td>
                      <td className="p-4"><StatusBadge status={apt.status} /></td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelectedApt(apt); }}>
                            Manage <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                          <button
                            onClick={e => openDeleteDialog(apt, e)}
                            className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                            title="Delete appointment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-border">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-text-muted">
                {searchTerm || filterStatus !== 'All Status' || filterBarber !== 'All Barbers' || filterDate !== 'All Dates'
                  ? 'No appointments match your filters.'
                  : 'No appointments found.'}
              </div>
            ) : (
              filtered.map(apt => (
                <div key={apt.id} className="p-4 cursor-pointer hover:bg-muted/30" onClick={() => setSelectedApt(apt)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-gold font-medium">{apt.bookingId}</span>
                        <span className="text-[10px] uppercase font-semibold text-text-muted px-1.5 py-0.5 bg-muted rounded-full">{apt.source}</span>
                      </div>
                      <p className="font-semibold text-text-primary text-sm truncate">{apt.customerName}</p>
                      <p className="text-xs text-text-secondary truncate">{apt.serviceName} · {apt.barberName}</p>
                      <p className="text-xs text-text-muted">{apt.date} {apt.slot}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <StatusBadge status={apt.status} />
                      <button onClick={e => openDeleteDialog(apt, e)} className="p-1.5 text-text-muted hover:text-error rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-muted">
            <span>Showing <strong className="text-navy">{filtered.length}</strong> of <strong className="text-navy">{appointments.length}</strong> appointments</span>
          </div>
        </div>
      )}

      {/* Detail / Status Update Drawer */}
      {selectedApt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedApt(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-right duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-navy">Appointment Details</h2>
              <button onClick={() => setSelectedApt(null)} className="p-2 hover:bg-muted rounded-lg text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gold-light rounded-xl p-4">
                <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-1">Booking ID</p>
                <p className="font-mono font-bold text-navy text-lg">{selectedApt.bookingId}</p>
              </div>

              {[
                { label: 'Customer',  value: selectedApt.customerName },
                { label: 'Phone',     value: selectedApt.customerPhone },
                { label: 'Email',     value: selectedApt.customerEmail || '—' },
                { label: 'Service',   value: selectedApt.serviceName },
                { label: 'Duration',  value: `${selectedApt.duration} min` },
                { label: 'Price',     value: `NPR ${(selectedApt.price || 0).toLocaleString()}` },
                { label: 'Barber',    value: selectedApt.barberName || '—' },
                { label: 'Date',      value: selectedApt.date },
                { label: 'Time',      value: selectedApt.slot },
                { label: 'Source',    value: selectedApt.source },
                { label: 'Notes',     value: selectedApt.notes || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm border-b border-border/50 pb-3">
                  <span className="font-medium text-text-muted">{label}</span>
                  <span className="text-text-primary font-semibold text-right max-w-[60%]">{value}</span>
                </div>
              ))}

              {/* Status update */}
              <div>
                <p className="text-sm font-semibold text-text-secondary mb-3">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {['confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'].map(status => (
                    <button
                      key={status}
                      disabled={updatingStatus || selectedApt.status === status}
                      onClick={() => handleStatusUpdate(status)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${
                        selectedApt.status === status
                          ? 'bg-navy text-white border-navy'
                          : 'bg-white border-border text-text-primary hover:border-navy hover:bg-navy/5'
                      }`}
                    >
                      {STATUS_LABELS[status] || status}
                    </button>
                  ))}
                </div>
                {updatingStatus && <p className="text-xs text-text-muted mt-2 text-center">Updating...</p>}
              </div>

              {/* Delete button */}
              <div className="pt-2 border-t border-border">
                <button
                  onClick={() => openDeleteDialog(selectedApt)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-error/30 text-error hover:bg-error hover:text-white transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, aptId: null, aptName: '' })}
        onConfirm={handleConfirmDelete}
        title="Delete Appointment"
        message={`Permanently delete the appointment for "${deleteDialog.aptName}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deleting}
      />
    </div>
  );
};
