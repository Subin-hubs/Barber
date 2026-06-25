import { db } from './config';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

const DEFAULT_SETTINGS = {
  shopName: "John's Barber",
  phone: "+977-",
  email: "john@johnsbarber.com",
  address: "Thamel, Kathmandu",
  timezone: "Asia/Kathmandu",
  workingHours: {
    mon: { open: "09:00", close: "19:00", active: true },
    tue: { open: "09:00", close: "19:00", active: true },
    wed: { open: "09:00", close: "19:00", active: true },
    thu: { open: "09:00", close: "19:00", active: true },
    fri: { open: "09:00", close: "19:00", active: true },
    sat: { open: "09:00", close: "17:00", active: true },
    sun: { open: "09:00", close: "14:00", active: false },
  },
  bookingNotice: 60,
  cancellationWindow: 120,
  currency: "NPR",
};

export async function getShopSettings() {
  const docRef = doc(db, 'settings', 'shop');
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data();
  }
  
  // Seed with default settings if none exist
  await setDoc(docRef, DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export async function updateShopSettings(data) {
  const docRef = doc(db, 'settings', 'shop');
  await setDoc(docRef, { ...data, updatedAt: Timestamp.now() }, { merge: true });
}
