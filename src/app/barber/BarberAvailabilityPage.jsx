import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getBarberByUserId, updateBarber } from '../../firebase/barberService';

export const BarberAvailabilityPage = () => {
  const { user } = useAuth();
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const [workingHours, setWorkingHours] = useState(
    days.map(day => ({
      day,
      isOpen: day !== 'Sunday',
      openTime: '09:00',
      closeTime: '19:00'
    }))
  );

  const [leaves, setLeaves] = useState([]);
  const [newLeaveDate, setNewLeaveDate] = useState('');
  const [newLeaveReason, setNewLeaveReason] = useState('');

  // Static breaks for MVP, or we can load them if they exist
  const [breaks, setBreaks] = useState([
    { id: 1, label: 'Lunch', startTime: '13:00', endTime: '14:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] }
  ]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const b = await getBarberByUserId(user.uid);
        if (b) {
          setBarber(b);
          if (b.workingHours) setWorkingHours(b.workingHours);
          if (b.leaves) setLeaves(b.leaves);
          if (b.breaks) setBreaks(b.breaks);
        }
      } catch (err) {
        console.error("Error loading availability", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleToggleDay = (index) => {
    const newHours = [...workingHours];
    newHours[index].isOpen = !newHours[index].isOpen;
    setWorkingHours(newHours);
  };

  const handleTimeChange = (index, field, value) => {
    const newHours = [...workingHours];
    newHours[index][field] = value;
    setWorkingHours(newHours);
  };

  const handleAddLeave = () => {
    if (!newLeaveDate || !newLeaveReason) return;
    setLeaves([...leaves, { id: Date.now(), date: newLeaveDate, reason: newLeaveReason }]);
    setNewLeaveDate('');
    setNewLeaveReason('');
  };

  const handleRemoveLeave = (id) => {
    setLeaves(leaves.filter(l => l.id !== id));
  };

  const handleSave = async () => {
    if (!barber) return;
    setSaving(true);
    try {
      await updateBarber(barber.id, {
        workingHours,
        leaves,
        breaks
      });
      alert("Availability saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save availability.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-navy" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">Availability</h1>
          <p className="text-text-secondary">Set your working hours, breaks, and leaves.</p>
        </div>
        <Button onClick={handleSave} isLoading={saving}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="space-y-8">
        {/* Working Hours */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <h2 className="text-xl font-bold text-navy">Working Hours</h2>
            <p className="text-sm text-text-secondary mt-1">Set your standard weekly schedule.</p>
          </div>
          <div className="p-6 space-y-4">
            {workingHours.map((wh, index) => (
              <div key={wh.day} className="flex items-center gap-4 p-4 border border-border rounded-xl">
                <div className="w-32 flex items-center gap-3">
                  <div 
                    className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${wh.isOpen ? 'bg-success' : 'bg-muted'}`}
                    onClick={() => handleToggleDay(index)}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${wh.isOpen ? 'left-5' : 'left-1'}`}></div>
                  </div>
                  <span className={`font-medium ${wh.isOpen ? 'text-navy' : 'text-text-muted'}`}>{wh.day}</span>
                </div>

                {wh.isOpen ? (
                  <div className="flex flex-1 items-center gap-4">
                    <input 
                      type="time" 
                      value={wh.openTime}
                      onChange={(e) => handleTimeChange(index, 'openTime', e.target.value)}
                      className="border border-border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-navy outline-none text-sm"
                    />
                    <span className="text-text-muted text-sm">to</span>
                    <input 
                      type="time" 
                      value={wh.closeTime}
                      onChange={(e) => handleTimeChange(index, 'closeTime', e.target.value)}
                      className="border border-border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-navy outline-none text-sm"
                    />
                  </div>
                ) : (
                  <div className="flex-1 text-text-muted text-sm italic">Closed</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Breaks */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden opacity-70">
          <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-navy">Recurring Breaks</h2>
              <p className="text-sm text-text-secondary mt-1">Add daily breaks (e.g., Lunch). (Coming Soon)</p>
            </div>
            <Button variant="secondary" size="sm" disabled>
              <Plus className="w-4 h-4 mr-1" /> Add Break
            </Button>
          </div>
          <div className="p-6 space-y-4">
            {breaks.map(breakItem => (
              <div key={breakItem.id} className="border border-border rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-navy">{breakItem.label}</h4>
                  <div className="text-sm text-text-secondary mt-1 flex items-center gap-2">
                    <span className="font-medium bg-muted px-2 py-0.5 rounded text-navy">{breakItem.startTime} - {breakItem.endTime}</span>
                    <span>• {breakItem.days.length} days/week</span>
                  </div>
                </div>
                <button className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors" disabled>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Leaves */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <h2 className="text-xl font-bold text-navy">Leave Management</h2>
            <p className="text-sm text-text-secondary mt-1">Block out entire days for vacation or personal leave.</p>
          </div>
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <input 
                type="date" 
                value={newLeaveDate}
                onChange={e => setNewLeaveDate(e.target.value)}
                className="border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none" 
              />
              <input 
                type="text" 
                placeholder="Reason (e.g., Vacation)" 
                value={newLeaveReason}
                onChange={e => setNewLeaveReason(e.target.value)}
                className="flex-1 border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none" 
              />
              <Button variant="secondary" onClick={handleAddLeave}>Mark as Leave</Button>
            </div>

            <div className="space-y-3">
              {leaves.map(leave => (
                <div key={leave.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border border-dashed">
                  <div>
                    <span className="font-semibold text-error mr-3">{leave.date}</span>
                    <span className="text-text-secondary">{leave.reason}</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveLeave(leave.id)}
                    className="text-text-muted hover:text-error text-sm font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
