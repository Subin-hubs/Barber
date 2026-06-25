import { db } from './config';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, orderBy, writeBatch, Timestamp } from 'firebase/firestore';

export function generateBookingId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) result += '-';
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createBooking(data) {
  const bookingId = generateBookingId();
  const bookingsRef = collection(db, 'bookings');
  
  const bookingData = {
    ...data,
    bookingId,
    status: 'pending',
    emailSent: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  // Uses batch to allow future expansion (e.g. marking a slot document if needed)
  const batch = writeBatch(db);
  const newBookingRef = doc(bookingsRef);
  batch.set(newBookingRef, bookingData);
  
  await batch.commit();
  return { id: newBookingRef.id, bookingId };
}

export async function trackBooking(bookingId, phone) {
  const q = query(
    collection(db, 'bookings'),
    where('bookingId', '==', bookingId),
    where('customerPhone', '==', phone)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

export async function getBookingsByDate(date) {
  const q = query(
    collection(db, 'bookings'),
    where('date', '==', date),
    orderBy('slot')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getBarberBookings(barberId, date) {
  const q = query(
    collection(db, 'bookings'),
    where('barberId', '==', barberId),
    where('date', '==', date)
    // Removed orderBy('slot') here because Firestore requires a composite index
    // when using == on one field and orderBy on another. We can sort client-side.
  );
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return docs.sort((a, b) => a.slot.localeCompare(b.slot));
}

export async function getTakenSlots(date, barberId) {
  const q = query(
    collection(db, 'bookings'),
    where('date', '==', date),
    where('status', 'in', ['pending', 'confirmed', 'in_progress'])
  );
  const snapshot = await getDocs(q);
  const takenSlots = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    // If we're looking for 'any', consider all barbers' slots taken?
    // Actually, 'any' should only exclude slots where ALL barbers are booked.
    // For simplicity, if a specific barber is requested, only block their slots.
    if (barberId !== 'any' && data.barberId !== barberId) return;
    takenSlots.push(data.slot);
  });
  
  return takenSlots;
}

export async function updateBookingStatus(docId, status) {
  const docRef = doc(db, 'bookings', docId);
  await updateDoc(docRef, {
    status,
    updatedAt: Timestamp.now()
  });
}

export async function cancelBooking(docId) {
  return updateBookingStatus(docId, 'cancelled');
}

export async function getAllBookings({ status, barberId, startDate, endDate } = {}) {
  let q = collection(db, 'bookings');
  const constraints = [];
  
  if (status) constraints.push(where('status', '==', status));
  if (barberId) constraints.push(where('barberId', '==', barberId));
  if (startDate) constraints.push(where('date', '>=', startDate));
  if (endDate) constraints.push(where('date', '<=', endDate));
  
  if (constraints.length > 0) {
    q = query(q, ...constraints);
  }
  
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Sort client side to avoid complex index requirements initially
  return docs.sort((a, b) => {
    if (a.date === b.date) return b.slot.localeCompare(a.slot);
    return b.date.localeCompare(a.date);
  });
}

export async function markEmailSent(docId) {
  const docRef = doc(db, 'bookings', docId);
  await updateDoc(docRef, { emailSent: true });
}
