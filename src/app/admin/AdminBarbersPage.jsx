import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { BarberCard } from '../../components/ui/BarberCard';
import { createBarber } from '../../firebase/barberService';

const handleAddBarber = async () => {
  try {
    const id = await createBarber({
      name: 'Test Barber',
      specialty: 'Fade',
      imageUrl: '',
      active: true
    });

    console.log('Created barber:', id);
  } catch (error) {
    console.error(error);
  }
};
export const AdminBarbersPage = () => {
  const dummyBarbers = [
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">Barbers</h1>
          <p className="text-text-secondary">Manage staff profiles and availability.</p>
        </div>
        <Button onClick={handleAddBarber}>
          <Plus className="w-4 h-4 mr-2" />
          Add Barber
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {dummyBarbers.map((barber) => (
          <BarberCard 
            key={barber.id} 
            {...barber} 
            isAdmin={true} 
          />
        ))}
      </div>
    </div>
  );
};
