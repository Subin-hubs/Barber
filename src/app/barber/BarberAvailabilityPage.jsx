import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getBarberByUserId, updateBarber } from '../../firebase/barberService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_SCHEDULE = DAYS.map(day => ({
  day,
  isOpen:    day !== 'Sunday',
  openTime:  '09:00',
  closeTime: '19:00',
}));

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export const BarberAvailabilityPage = () => {
  const { user } = useAuth();
  const [barber, setBarber]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [saveStatus, setSaveStatus]     = useState(null); // 'success' | 'error' | null
  const [validationError, setValidationError] = useState('');

  const [workingHours, setWorkingHours] = useState(DEFAULT_SCHEDULE);
  const [leaves, setLeaves]             = useState([]);
  const [newLeaveDate, setNewLeaveDate] = useState('');
  const [newLeaveReason, setNewLeaveReason] = useState('');
  const [breaks, setBreaks]             = useState([]);

  /* ---------------------------------------------------------------- */
  /* Load                                                               */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const b = await getBarberByUserId(user.uid);
        if (b) {
          setBarber(b);
          // normalizeBarberData in barberService already ensures workingHours is an array
          setWorkingHours(Array.isArray(b.workingHours) ? b.workingHours : DEFAULT_SCHEDULE);
          setLeaves(Array.isArray(b.leaves) ? b.leaves : []);
          setBreaks(Array.isArray(b.breaks) ? b.breaks : []);
        }
      } catch (err) {
        console.error('Error loading availability:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  /* ---------------------------------------------------------------- */
  /* Handlers — Working Hours                                           */
  /* ---------------------------------------------------------------- */

  const handleToggleDay = (index) => {
    setWorkingHours(prev => {
      const next = [...prev];
      next[index] = { ...next[index], isOpen: !next[index].isOpen };
      return next;
    });
  };

  const handleTimeChange = (index, field, value) => {
    setWorkingHours(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setValidationError(''); // clear on any change
  };

  /* ---------------------------------------------------------------- */
  /* Validation                                                         */
  /* ---------------------------------------------------------------- */

  function validate() {
    for (const wh of workingHours) {
      if (!wh.isOpen) continue;
      if (!wh.openTime || !wh.closeTime) {
        setValidationError(`${wh.day}: Both open and close times are required.`);
        return false;
      }
      if (wh.openTime >= wh.closeTime) {
        setValidationError(`${wh.day}: Close time must be after open time.`);
        return false;
      }
    }
    for (const br of breaks) {
      if (!br.startTime || !br.endTime) {
        setValidationError('Each break must have a start and end time.');
        return false;
      }
      if (br.startTime >= br.endTime) {
        setValidationError(`Break "${br.label || 'Unnamed'}": End time must be after start time.`);
        return false;
      }
    }
    setValidationError('');
    return true;
  }

  /* ---------------------------------------------------------------- */
  /* Handlers — Leaves                                                  */
  /* ---------------------------------------------------------------- */

  const handleAddLeave = () => {
    if (!newLeaveDate) return;
    if (leaves.some(l => l.date === newLeaveDate)) {
      setValidationError('This date is already marked as leave.');
      return;
    }
    setLeaves(prev => [
      ...prev,
      { id: Date.now(), date: newLeaveDate, reason: newLeaveReason || 'Personal Leave' }
    ]);
    setNewLeaveDate('');
    setNewLeaveReason('');
    setValidationError('');
  };

  const handleRemoveLeave = (id) => {
    setLeaves(prev => prev.filter(l => l.id !== id));
  };

  /* ---------------------------------------------------------------- */
  /* Handlers — Breaks                                                  */
  /* ---------------------------------------------------------------- */

  const handleAddBreak = () => {
    setBreaks(prev => [
      ...prev,
      { id: Date.now(), label: 'Lunch', startTime: '13:00', endTime: '14:00', days: DAYS.slice(0, 5) }
    ]);
  };

  const handleRemoveBreak = (id) => {
    setBreaks(prev => prev.filter(b => b.id !== id));
  };

  const handleBreakChange = (id, field, value) => {
    setBreaks(prev =>
      prev.map(b => b.id === id ? { ...b, [field]: value } : b)
    );
    setValidationError('');
  };

  /* ---------------------------------------------------------------- */
  /* Save                                                               */
  /* ---------------------------------------------------------------- */

  const handleSave = async () => {
    if (!barber) return;
    if (!validate()) return;

    setSaving(true);
    setSaveStatus(null);
    try {
      await updateBarber(barber.id, { workingHours, leaves, breaks });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Loading                                                            */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="text-center py-20 text-text-secondary">
        Barber profile not found.
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Render                                                             */
  /* ---------------------------------------------------------------- */

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-1">Availability</h1>
          <p className="text-sm text-text-secondary">Set your working hours, breaks, and leaves.</p>
        </div>
        <Button onClick={handleSave} isLoading={saving} className="self-start sm:self-auto">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Save status banner */}
      {saveStatus === 'success' && (
        <div className="mb-6 bg-success/10 border border-success/30 text-success rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Availability saved successfully!
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="mb-6 bg-error/10 border border-error/30 text-error rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Failed to save availability. Please try again.
        </div>
      )}
      {validationError && (
        <div className="mb-6 bg-warning/10 border border-warning/30 text-warning rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {validationError}
        </div>
      )}

      <div className="space-y-8">

        {/* ── Working Hours ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <h2 className="text-xl font-bold text-navy">Working Hours</h2>
            <p className="text-sm text-text-secondary mt-1">Set your standard weekly schedule.</p>
          </div>
          <div className="p-4 md:p-6 space-y-3">
            {workingHours.map((wh, index) => (
              <div key={wh.day} className="flex flex-wrap items-center gap-3 p-3 md:p-4 border border-border rounded-xl">

                {/* Toggle + Day Name */}
                <div className="flex items-center gap-3 w-32 shrink-0">
                  <button
                    type="button"
                    aria-label={`Toggle ${wh.day}`}
                    className={`w-10 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-navy shrink-0 ${wh.isOpen ? 'bg-success' : 'bg-muted'}`}
                    onClick={() => handleToggleDay(index)}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${wh.isOpen ? 'left-5' : 'left-1'}`} />
                  </button>
                  <span className={`font-medium text-sm ${wh.isOpen ? 'text-navy' : 'text-text-muted'}`}>
                    {wh.day}
                  </span>
                </div>

                {/* Time inputs */}
                {wh.isOpen ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="time"
                      value={wh.openTime}
                      onChange={e => handleTimeChange(index, 'openTime', e.target.value)}
                      className="border border-border rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-navy outline-none text-sm"
                    />
                    <span className="text-text-muted text-xs">to</span>
                    <input
                      type="time"
                      value={wh.closeTime}
                      onChange={e => handleTimeChange(index, 'closeTime', e.target.value)}
                      className={`border rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-navy outline-none text-sm ${
                        wh.closeTime && wh.openTime && wh.closeTime <= wh.openTime
                          ? 'border-error bg-error/5'
                          : 'border-border'
                      }`}
                    />
                    {wh.closeTime && wh.openTime && wh.closeTime <= wh.openTime && (
                      <span className="text-xs text-error w-full">Close time must be after open time</span>
                    )}
                  </div>
                ) : (
                  <div className="text-text-muted text-sm italic">Closed</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Recurring Breaks ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-navy">Recurring Breaks</h2>
              <p className="text-sm text-text-secondary mt-1">Add daily breaks such as lunch.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleAddBreak}>
              <Plus className="w-4 h-4 mr-1" />
              Add Break
            </Button>
          </div>
          <div className="p-6 space-y-4">
            {breaks.length === 0 ? (
              <p className="text-sm text-text-muted italic text-center py-4">No recurring breaks added.</p>
            ) : (
              breaks.map(br => (
                <div key={br.id} className="border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      placeholder="Label (e.g. Lunch)"
                      value={br.label}
                      onChange={e => handleBreakChange(br.id, 'label', e.target.value)}
                      className="border border-border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-navy outline-none w-32"
                    />
                    <input
                      type="time"
                      value={br.startTime}
                      onChange={e => handleBreakChange(br.id, 'startTime', e.target.value)}
                      className="border border-border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-navy outline-none"
                    />
                    <span className="text-text-muted text-sm">to</span>
                    <input
                      type="time"
                      value={br.endTime}
                      onChange={e => handleBreakChange(br.id, 'endTime', e.target.value)}
                      className="border border-border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-navy outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveBreak(br.id)}
                    className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors self-start"
                    aria-label="Remove break"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Leave Management ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <h2 className="text-xl font-bold text-navy">Leave Management</h2>
            <p className="text-sm text-text-secondary mt-1">Block out entire days for vacation or personal leave.</p>
          </div>
          <div className="p-6">
            {/* Add leave form */}
            <div className="flex flex-wrap gap-3 mb-6">
              <input
                type="date"
                value={newLeaveDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setNewLeaveDate(e.target.value)}
                className="border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Reason (e.g., Vacation)"
                value={newLeaveReason}
                onChange={e => setNewLeaveReason(e.target.value)}
                className="flex-1 min-w-[160px] border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none text-sm"
              />
              <Button variant="secondary" onClick={handleAddLeave} disabled={!newLeaveDate}>
                Mark as Leave
              </Button>
            </div>

            {/* Leave list */}
            <div className="space-y-3">
              {leaves.length === 0 ? (
                <p className="text-sm text-text-muted italic text-center py-4">No leave days added.</p>
              ) : (
                leaves
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map(leave => (
                    <div
                      key={leave.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-dashed border-border"
                    >
                      <div>
                        <span className="font-semibold text-error mr-3">{leave.date}</span>
                        <span className="text-text-secondary text-sm">{leave.reason}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveLeave(leave.id)}
                        className="text-text-muted hover:text-error text-sm font-medium transition-colors"
                        aria-label="Remove leave"
                      >
                        Remove
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
