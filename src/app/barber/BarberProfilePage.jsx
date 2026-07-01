import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Briefcase, Clock,
  Save, X, Loader2, CheckCircle, AlertCircle, Edit2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getBarberByUserId, updateBarber } from '../../firebase/barberService';

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function InputField({ label, icon: Icon, value, onChange, type = 'text', disabled = false, placeholder = '' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder || label}
          className={`w-full rounded-lg border border-border py-2.5 text-sm focus:ring-2 focus:ring-navy outline-none transition-colors
            ${Icon ? 'pl-10 pr-4' : 'px-4'}
            ${disabled ? 'bg-muted text-text-muted cursor-not-allowed' : 'bg-white text-text-primary'}
          `}
        />
      </div>
    </div>
  );
}

function TextAreaField({ label, value, onChange, disabled = false, placeholder = '', rows = 3 }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder || label}
        rows={rows}
        className={`w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy outline-none transition-colors resize-none
          ${disabled ? 'bg-muted text-text-muted cursor-not-allowed' : 'bg-white text-text-primary'}
        `}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export const BarberProfilePage = () => {
  const { user } = useAuth();

  const [barber, setBarber]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [isEditing, setIsEditing]       = useState(false);
  const [saveStatus, setSaveStatus]     = useState(null); // 'success' | 'error' | null
  const [error, setError]               = useState(null);

  // Form state
  const [form, setForm] = useState({
    name:       '',
    phone:      '',
    address:    '',
    bio:        '',
    specialty:  '',
    experience: '',
    photoUrl:   '',
  });

  // Snapshot to restore on cancel
  const [formSnapshot, setFormSnapshot] = useState(null);

  /* ---------------------------------------------------------------- */
  /* Load                                                               */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      try {
        const b = await getBarberByUserId(user.uid);
        if (!b) {
          setError('Barber profile not found for your account.');
          return;
        }
        setBarber(b);
        const initialForm = {
          name:       b.name       || '',
          phone:      b.phone      || '',
          address:    b.address    || '',
          bio:        b.bio        || '',
          specialty:  b.specialty  || '',
          experience: b.experience || '',
          photoUrl:   b.photoUrl   || '',
        };
        setForm(initialForm);
        setFormSnapshot(initialForm);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  /* ---------------------------------------------------------------- */
  /* Handlers                                                           */
  /* ---------------------------------------------------------------- */

  const handleEdit = () => {
    setFormSnapshot({ ...form });
    setIsEditing(true);
    setSaveStatus(null);
  };

  const handleCancel = () => {
    setForm({ ...formSnapshot });
    setIsEditing(false);
    setSaveStatus(null);
  };

  const handleSave = async () => {
    if (!barber) return;
    if (!form.name.trim()) {
      setSaveStatus('error');
      setError('Name is required.');
      return;
    }
    setSaving(true);
    setSaveStatus(null);
    setError(null);
    try {
      await updateBarber(barber.id, {
        name:       form.name.trim(),
        phone:      form.phone.trim(),
        address:    form.address.trim(),
        bio:        form.bio.trim(),
        specialty:  form.specialty.trim(),
        experience: form.experience.trim(),
        photoUrl:   form.photoUrl.trim(),
      });
      // Update local barber with new values
      setBarber(prev => ({ ...prev, ...form }));
      setFormSnapshot({ ...form });
      setIsEditing(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err) {
      console.error('Error saving profile:', err);
      setSaveStatus('error');
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const field = (key) => ({
    value:    form[key],
    onChange: (e) => setForm(prev => ({ ...prev, [key]: e.target.value })),
    disabled: !isEditing,
  });

  /* ---------------------------------------------------------------- */
  /* Working days summary (read-only)                                   */
  /* ---------------------------------------------------------------- */

  const workingDaysSummary = (() => {
    if (!barber?.workingHours || !Array.isArray(barber.workingHours)) return 'Not set';
    const open = barber.workingHours.filter(wh => wh.isOpen).map(wh => wh.day.substring(0, 3));
    return open.length > 0 ? open.join(', ') : 'No working days set';
  })();

  const workingHoursSummary = (() => {
    if (!barber?.workingHours || !Array.isArray(barber.workingHours)) return 'Not set';
    const firstOpen = barber.workingHours.find(wh => wh.isOpen);
    if (!firstOpen) return 'Not set';
    return `${firstOpen.openTime} – ${firstOpen.closeTime}`;
  })();

  /* ---------------------------------------------------------------- */
  /* Loading / Error states                                             */
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-error/5 border border-error/20 text-error rounded-2xl p-8 flex flex-col items-center gap-4">
          <AlertCircle className="w-10 h-10" />
          <p className="font-semibold text-lg">{error || 'Profile not found.'}</p>
        </div>
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
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-1">My Profile</h1>
          <p className="text-sm text-text-secondary">View and update your barber profile information.</p>
        </div>

        <div className="flex items-center gap-3 self-start">
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={handleCancel} disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} isLoading={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={handleEdit}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Status banners */}
      {saveStatus === 'success' && (
        <div className="mb-6 bg-success/10 border border-success/30 text-success rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Profile updated successfully!
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="mb-6 bg-error/10 border border-error/30 text-error rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error || 'Failed to save changes.'}
        </div>
      )}

      <div className="space-y-6">

        {/* ── Profile Card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <h2 className="text-lg font-bold text-navy">Personal Information</h2>
          </div>
          <div className="p-6">
            {/* Avatar + photo URL */}
            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-20 rounded-full bg-gold-light border-2 border-gold flex items-center justify-center overflow-hidden shrink-0">
                {form.photoUrl ? (
                  <img
                    src={form.photoUrl}
                    alt={form.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <User className="w-9 h-9 text-gold" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-navy">{barber.name || 'Unnamed Barber'}</p>
                <p className="text-sm text-text-secondary">{user?.email}</p>
                <div className="mt-1">
                  <StatusBadge status={barber.active ? 'confirmed' : 'cancelled'} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Full Name"
                icon={User}
                placeholder="Your full name"
                {...field('name')}
              />
              <InputField
                label="Phone Number"
                icon={Phone}
                type="tel"
                placeholder="+977 98XXXXXXXX"
                {...field('phone')}
              />
              <div className="md:col-span-2">
                <InputField
                  label="Address"
                  icon={MapPin}
                  placeholder="Your location or area"
                  {...field('address')}
                />
              </div>
              <div className="md:col-span-2">
                <InputField
                  label="Profile Photo URL"
                  icon={null}
                  placeholder="https://example.com/photo.jpg"
                  {...field('photoUrl')}
                />
                <p className="text-xs text-text-muted mt-1">Paste a direct image URL to set your profile picture.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Professional Information ──────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <h2 className="text-lg font-bold text-navy">Professional Information</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Specialty"
                icon={Briefcase}
                placeholder="e.g., Fade Cuts, Beard Styling"
                {...field('specialty')}
              />
              <InputField
                label="Years of Experience"
                icon={Clock}
                placeholder="e.g., 5 years"
                {...field('experience')}
              />
            </div>
            <TextAreaField
              label="Biography"
              placeholder="Tell clients a little about yourself…"
              rows={4}
              {...field('bio')}
            />
          </div>
        </div>

        {/* ── Account Information (read-only) ───────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <h2 className="text-lg font-bold text-navy">Account Information</h2>
            <p className="text-sm text-text-secondary mt-1">These fields are managed by the administrator.</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Email Address"
                icon={Mail}
                value={user?.email || ''}
                onChange={() => {}}
                disabled={true}
              />
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Account Status</label>
                <div className="flex items-center h-10">
                  <StatusBadge status={barber.active !== false ? 'confirmed' : 'cancelled'} />
                  <span className="ml-2 text-sm text-text-secondary">
                    {barber.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Working Days</label>
                <p className="text-sm text-text-primary bg-muted rounded-lg px-4 py-2.5 border border-border">
                  {workingDaysSummary}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Working Hours</label>
                <p className="text-sm text-text-primary bg-muted rounded-lg px-4 py-2.5 border border-border">
                  {workingHoursSummary}
                </p>
              </div>
            </div>
            <p className="text-xs text-text-muted mt-4">
              To update working days and hours, visit the{' '}
              <a href="/barber/availability" className="text-navy underline underline-offset-2">Availability</a> page.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
