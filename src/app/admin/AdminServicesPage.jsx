import React, { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdminServicesPage = () => {
  const [services, setServices] = useState([
    { id: '1', name: 'Classic Haircut', category: 'Haircut', duration: 45, price: 500, active: true },
    { id: '2', name: 'Skin Fade', category: 'Haircut', duration: 60, price: 600, active: true },
    { id: '3', name: 'Beard Trim & Shape', category: 'Beard', duration: 30, price: 300, active: true },
    { id: '4', name: 'Hot Towel Shave', category: 'Beard', duration: 45, price: 400, active: false },
    { id: '5', name: 'Hair & Beard Combo', category: 'Combo', duration: 75, price: 700, active: true },
  ]);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">Services</h1>
          <p className="text-text-secondary">Manage the services offered by your barbershop.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border">
                <th className="p-4 w-10"></th>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="p-4 cursor-grab active:cursor-grabbing text-text-muted">
                    <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-navy">{service.name}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm px-2.5 py-1 bg-muted rounded-md text-text-secondary font-medium">
                      {service.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    {service.duration} min
                  </td>
                  <td className="p-4 font-semibold text-gold">
                    NPR {service.price}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${service.active ? 'bg-success' : 'bg-muted'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${service.active ? 'left-5' : 'left-1'}`}></div>
                      </div>
                      <span className="text-xs font-medium text-text-muted">
                        {service.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-text-muted hover:text-navy transition-colors rounded-md hover:bg-muted">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-text-muted hover:text-error transition-colors rounded-md hover:bg-error/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
