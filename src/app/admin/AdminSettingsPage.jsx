import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('Shop');
  const tabs = ['Shop', 'Notifications', 'Roles', 'Danger Zone'];

  const renderShopTab = () => (
    <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
        <h3 className="text-lg font-bold text-navy mb-4 border-b border-border pb-4">General Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">Shop Name</label>
            <input type="text" className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none" defaultValue="John's Barber" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Phone</label>
              <input type="text" className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none" defaultValue="+977-98XXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Email</label>
              <input type="email" className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none" defaultValue="hello@johnsbarber.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">Address</label>
            <textarea className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none resize-none" defaultValue="Thamel, Kathmandu, Nepal"></textarea>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
        <h3 className="text-lg font-bold text-navy mb-4 border-b border-border pb-4">Booking Preferences</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Minimum Notice (minutes)</label>
              <input type="number" className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none" defaultValue="60" />
              <p className="text-xs text-text-muted mt-1">How soon before a slot can a customer book?</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Cancellation Window (hours)</label>
              <input type="number" className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none" defaultValue="2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">Currency</label>
            <select className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none bg-white">
              <option value="NPR">Nepalese Rupee (NPR)</option>
              <option value="USD">US Dollar (USD)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );

  const renderRolesTab = () => (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
          <div>
            <h3 className="text-lg font-bold text-navy">Staff Roles</h3>
            <p className="text-sm text-text-secondary mt-1">Manage admin and barber access permissions.</p>
          </div>
          <Button variant="secondary" size="sm">Assign Role</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border">
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              <tr className="hover:bg-muted/30">
                <td className="p-4 font-medium text-navy">Admin User</td>
                <td className="p-4 text-text-secondary">admin@johnsbarber.com</td>
                <td className="p-4"><span className="bg-navy/10 text-navy text-xs font-bold px-2 py-1 rounded uppercase">Admin</span></td>
                <td className="p-4 text-right"></td>
              </tr>
              <tr className="hover:bg-muted/30">
                <td className="p-4 font-medium text-navy">John Doe</td>
                <td className="p-4 text-text-secondary">john@johnsbarber.com</td>
                <td className="p-4"><span className="bg-gold-light text-gold text-xs font-bold px-2 py-1 rounded uppercase">Barber</span></td>
                <td className="p-4 text-right">
                  <button className="text-xs font-medium text-error hover:underline">Revoke</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Settings</h1>
        <p className="text-text-secondary">Configure your shop parameters and system settings.</p>
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
              <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-gold rounded-t-full z-10"></span>
            )}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'Shop' && renderShopTab()}
        {activeTab === 'Roles' && renderRolesTab()}
        {activeTab === 'Notifications' && (
          <div className="p-10 text-center text-text-muted bg-white border border-border rounded-2xl animate-in fade-in">
            Notification logs will appear here.
          </div>
        )}
        {activeTab === 'Danger Zone' && (
          <div className="p-6 border border-error bg-error/5 rounded-2xl animate-in fade-in max-w-2xl">
            <h3 className="text-lg font-bold text-error mb-2">Danger Zone</h3>
            <p className="text-text-secondary mb-4">These actions are irreversible.</p>
            <Button variant="danger">Reset All Data</Button>
          </div>
        )}
      </div>
    </div>
  );
};
