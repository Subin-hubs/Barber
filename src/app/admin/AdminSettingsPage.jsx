import React, { useState, useEffect, useCallback } from 'react';
import { Save, Loader2, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { getShopSettings, updateShopSettings } from '../../firebase/settingsService';
import { getAllBarbers } from '../../firebase/barberService';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };

const DEFAULT_HOURS = Object.fromEntries(
  DAYS.map(d => [d, { open: '09:00', close: d === 'sun' ? '14:00' : d === 'sat' ? '17:00' : '19:00', active: d !== 'sun' }])
);

export const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('Shop');
  const tabs = ['Shop', 'Hours', 'Booking', 'Roles'];

  // Shop tab state
  const [settings, setSettings]   = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings]   = useState(false);
  const [settingsError, setSettingsError]     = useState(null);
  const [settingsSaved, setSettingsSaved]     = useState(false);

  // Shop general fields
  const [shopName, setShopName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [email, setEmail]         = useState('');
  const [address, setAddress]     = useState('');
  const [currency, setCurrency]   = useState('NPR');

  // Working hours
  const [workingHours, setWorkingHours] = useState(DEFAULT_HOURS);

  // Booking prefs
  const [bookingNotice, setBookingNotice]     = useState(60);
  const [cancellationWindow, setCancellationWindow] = useState(120);

  // Roles
  const [barbers, setBarbers] = useState([]);
  const [loadingBarbers, setLoadingBarbers] = useState(false);

  /* ---- Load settings ----------------------------------------------- */
  const loadSettings = useCallback(async () => {
    setLoadingSettings(true);
    setSettingsError(null);
    try {
      const data = await getShopSettings();
      setSettings(data);
      setShopName(data.shopName || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setAddress(data.address || '');
      setCurrency(data.currency || 'NPR');
      setBookingNotice(data.bookingNotice ?? 60);
      setCancellationWindow(data.cancellationWindow ?? 120);
      if (data.workingHours) {
        setWorkingHours(prev => ({ ...prev, ...data.workingHours }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setSettingsError('Failed to load settings. Please try again.');
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  /* ---- Load barbers for Roles tab ----------------------------------- */
  useEffect(() => {
    if (activeTab !== 'Roles') return;
    setLoadingBarbers(true);
    getAllBarbers()
      .then(data => setBarbers(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error loading barbers:', err))
      .finally(() => setLoadingBarbers(false));
  }, [activeTab]);

  /* ---- Save settings ----------------------------------------------- */
  const handleSave = async (e) => {
    e?.preventDefault();
    setSavingSettings(true);
    setSettingsError(null);
    setSettingsSaved(false);
    try {
      await updateShopSettings({
        shopName: shopName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        currency,
        bookingNotice: Number(bookingNotice),
        cancellationWindow: Number(cancellationWindow),
        workingHours,
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setSettingsError('Failed to save settings. Please try again.');
    } finally {
      setSavingSettings(false);
    }
  };

  /* ---- Working hours helpers --------------------------------------- */
  const toggleDay = (day) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active }
    }));
  };

  const setHourField = (day, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  /* ---- Shared heading styles --------------------------------------- */
  const SectionCard = ({ title, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
      <h3 className="text-lg font-bold text-navy mb-4 border-b border-border pb-4">{title}</h3>
      {children}
    </div>
  );

  /* ---- Loading state ---------------------------------------------- */
  if (loadingSettings) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  /* ---- Render ------------------------------------------------------- */
  const renderShopTab = () => (
    <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
      <SectionCard title="General Information">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">Shop Name</label>
            <input
              type="text"
              className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none"
              value={shopName}
              onChange={e => setShopName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Phone</label>
              <input
                type="text"
                className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">Address</label>
            <textarea
              className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none resize-none"
              rows={2}
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">Currency</label>
            <select
              className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none bg-white"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
            >
              <option value="NPR">Nepalese Rupee (NPR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="INR">Indian Rupee (INR)</option>
            </select>
          </div>
        </div>
      </SectionCard>

      {settingsError && (
        <div className="flex items-center gap-3 p-4 bg-error/5 border border-error/20 text-error rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {settingsError}
        </div>
      )}
      {settingsSaved && (
        <div className="flex items-center gap-3 p-4 bg-success/5 border border-success/20 text-success rounded-xl text-sm">
          <Check className="w-5 h-5 shrink-0" />
          Settings saved successfully!
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={loadSettings}>
          <RefreshCw className="w-4 h-4 mr-2" /> Reload
        </Button>
        <Button onClick={handleSave} isLoading={savingSettings}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );

  const renderHoursTab = () => (
    <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
      <SectionCard title="Working Hours">
        <p className="text-sm text-text-secondary mb-4">Set your shop's opening and closing times for each day of the week.</p>
        <div className="space-y-3">
          {DAYS.map(day => {
            const h = workingHours[day] || { open: '09:00', close: '19:00', active: true };
            return (
              <div key={day} className="flex flex-wrap items-center gap-3 p-3 border border-border rounded-xl">
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${h.active ? 'bg-success' : 'bg-muted'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${h.active ? 'left-5' : 'left-1'}`} />
                </button>
                <span className={`w-24 font-medium text-sm shrink-0 ${h.active ? 'text-navy' : 'text-text-muted'}`}>
                  {DAY_LABELS[day]}
                </span>
                {h.active ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="time"
                      value={h.open}
                      onChange={e => setHourField(day, 'open', e.target.value)}
                      className="border border-border rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-navy outline-none"
                    />
                    <span className="text-text-muted text-xs">to</span>
                    <input
                      type="time"
                      value={h.close}
                      onChange={e => setHourField(day, 'close', e.target.value)}
                      className="border border-border rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-navy outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-text-muted italic">Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {settingsError && (
        <div className="flex items-center gap-3 p-4 bg-error/5 border border-error/20 text-error rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" /> {settingsError}
        </div>
      )}
      {settingsSaved && (
        <div className="flex items-center gap-3 p-4 bg-success/5 border border-success/20 text-success rounded-xl text-sm">
          <Check className="w-5 h-5 shrink-0" /> Settings saved successfully!
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={savingSettings}>
          <Save className="w-4 h-4 mr-2" /> Save Hours
        </Button>
      </div>
    </div>
  );

  const renderBookingTab = () => (
    <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
      <SectionCard title="Booking Preferences">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Minimum Notice (minutes)</label>
              <input
                type="number"
                min="0"
                className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none"
                value={bookingNotice}
                onChange={e => setBookingNotice(e.target.value)}
              />
              <p className="text-xs text-text-muted mt-1">How far in advance must a customer book?</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Cancellation Window (minutes)</label>
              <input
                type="number"
                min="0"
                className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none"
                value={cancellationWindow}
                onChange={e => setCancellationWindow(e.target.value)}
              />
              <p className="text-xs text-text-muted mt-1">Minutes before appointment a customer can still cancel.</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {settingsError && (
        <div className="flex items-center gap-3 p-4 bg-error/5 border border-error/20 text-error rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" /> {settingsError}
        </div>
      )}
      {settingsSaved && (
        <div className="flex items-center gap-3 p-4 bg-success/5 border border-success/20 text-success rounded-xl text-sm">
          <Check className="w-5 h-5 shrink-0" /> Settings saved successfully!
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={savingSettings}>
          <Save className="w-4 h-4 mr-2" /> Save Preferences
        </Button>
      </div>
    </div>
  );

  const renderRolesTab = () => (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <h3 className="text-lg font-bold text-navy">Staff Members</h3>
          <p className="text-sm text-text-secondary mt-1">All active barbers registered in the system.</p>
        </div>
        {loadingBarbers ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-navy" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {barbers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-text-muted">No barbers found. Add barbers from the Barbers page.</td>
                  </tr>
                ) : (
                  barbers.map(barber => (
                    <tr key={barber.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-navy">{barber.name}</td>
                      <td className="p-4 text-text-secondary">{barber.email}</td>
                      <td className="p-4">
                        <span className="bg-gold-light text-gold text-xs font-bold px-2 py-1 rounded uppercase">Barber</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${barber.active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                          {barber.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-navy mb-1">Settings</h1>
        <p className="text-sm text-text-secondary">Configure your shop parameters and system settings.</p>
      </div>

      <div className="flex overflow-x-auto border-b border-border mb-8 hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 whitespace-nowrap text-sm font-medium transition-colors relative ${
              activeTab === tab ? 'text-navy' : 'text-text-secondary hover:text-navy'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-gold rounded-t-full z-10" />
            )}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'Shop'    && renderShopTab()}
        {activeTab === 'Hours'   && renderHoursTab()}
        {activeTab === 'Booking' && renderBookingTab()}
        {activeTab === 'Roles'   && renderRolesTab()}
      </div>
    </div>
  );
};
