import { db } from './config';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, writeBatch, Timestamp } from 'firebase/firestore';

export function generateBookingId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) result += '-';
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const normalizeBookingData = (docId, data) => {
  return {
    id: docId,
    bookingId: data.bookingId || docId,
    serviceId: data.serviceId || '',
    serviceName: data.serviceName || '',
    barberId: data.barberId || '',
    barberName: data.barberName || '',
    date: data.date || '',
    slot: data.slot || '',
    customerName: data.customerName || '',
    customerPhone: data.customerPhone || '',
    customerEmail: data.customerEmail || '',
    notes: data.notes || '',
    price: data.price || 0,
    duration: data.duration || 30,
    status: data.status || 'pending',
    source: data.source || 'online',
    emailSent: !!data.emailSent,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};

export async function createBooking(data) {
  const bookingId = generateBookingId();
  const bookingsRef = collection(db, 'bookings');
  
  const bookingData = {
    bookingId,
    serviceId: data.serviceId || '',
    serviceName: data.serviceName || '',
    barberId: data.barberId || '',
    barberName: data.barberName || '',
    date: data.date || '',
    slot: data.slot || '',
    customerName: data.customerName || '',
    customerPhone: data.customerPhone || '',
    customerEmail: data.customerEmail || '',
    notes: data.notes || '',
    price: data.price || 0,
    duration: data.duration || 30,
    status: data.status || 'pending',
    source: data.source || 'online',
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
  return normalizeBookingData(docSnap.id, docSnap.data());
}

export async function getBookingsByDate(date) {
  const q = query(
    collection(db, 'bookings'),
    where('date', '==', date),
    orderBy('slot')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => normalizeBookingData(doc.id, doc.data()));
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
  const docs = snapshot.docs.map(doc => normalizeBookingData(doc.id, doc.data()));
  return docs.sort((a, b) => a.slot.localeCompare(b.slot));
}

/**
 * Fetch all bookings for a specific barber with optional filters.
 * Sorting and advanced filtering are done client-side to avoid Firestore composite index requirements.
 * @param {string} barberId
 * @param {{ startDate?: string, endDate?: string, status?: string }} options
 */
export async function getBarberAllBookings(barberId, { startDate, endDate, status } = {}) {
  const constraints = [where('barberId', '==', barberId)];
  if (startDate) constraints.push(where('date', '>=', startDate));
  if (endDate) constraints.push(where('date', '<=', endDate));

  const q = query(collection(db, 'bookings'), ...constraints);
  const snapshot = await getDocs(q);
  let docs = snapshot.docs.map(doc => normalizeBookingData(doc.id, doc.data()));

  // Client-side status filter (avoids needing a composite index with date range + status)
  if (status && status !== 'all') {
    docs = docs.filter(d => d.status === status);
  }

  // Sort by date descending, then slot ascending
  return docs.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return a.slot.localeCompare(b.slot);
  });
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
  const docs = snapshot.docs.map(doc => normalizeBookingData(doc.id, doc.data()));
  
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

/**
 * Permanently delete a booking document.
 */
export async function deleteBooking(docId) {
  await deleteDoc(doc(db, 'bookings', docId));
}

/**
 * Generate and trigger a CSV download of the provided bookings array.
 * Runs entirely client-side.
 */
export function exportBookingsToCsv(bookings, filename = 'appointments.csv') {
  if (!bookings || bookings.length === 0) return;

  const headers = [
    'Booking ID', 'Customer Name', 'Phone', 'Email',
    'Barber', 'Service', 'Date', 'Slot', 'Duration (min)',
    'Price (NPR)', 'Status', 'Source', 'Notes'
  ];

  const escape = (val) => {
    const str = val == null ? '' : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const rows = bookings.map(b => [
    escape(b.bookingId),
    escape(b.customerName),
    escape(b.customerPhone),
    escape(b.customerEmail),
    escape(b.barberName),
    escape(b.serviceName),
    escape(b.date),
    escape(b.slot),
    escape(b.duration),
    escape(b.price),
    escape(b.status),
    escape(b.source),
    escape(b.notes)
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function getAdminDashboardMetrics() {
  const snapshot = await getDocs(collection(db, 'bookings'));
  const docs = snapshot.docs.map(doc => normalizeBookingData(doc.id, doc.data()));
  
  const today = new Date();
  const dateStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');
  
  let todaysBookings = 0;
  let todaysRevenue = 0;
  let pendingConfirmations = 0;
  let completedToday = 0;
  let cancelledToday = 0;
  let statusCounts = { confirmed: 0, completed: 0, pending: 0, in_progress: 0, cancelled: 0 };
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekStats = [];
  for(let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');
    weekStats.push({ day: weekDays[d.getDay()], date: ds, count: 0 });
  }

  docs.forEach(b => {
    if (b.date === dateStr) {
      todaysBookings++;
      if (['completed', 'in_progress', 'confirmed'].includes(b.status)) {
         todaysRevenue += Number(b.price || 0);
      }
      if (b.status === 'completed') completedToday++;
      if (b.status === 'cancelled') cancelledToday++;
    }
    
    if (b.status === 'pending') {
      pendingConfirmations++;
    }
    
    if (statusCounts[b.status] !== undefined) {
      statusCounts[b.status]++;
    } else {
      statusCounts[b.status] = 1;
    }

    const weekStat = weekStats.find(ws => ws.date === b.date);
    if (weekStat) {
      weekStat.count++;
    }
  });

  const recentAppointments = docs.sort((a, b) => {
    const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return bTime - aTime;
  }).slice(0, 5);

  const totalStatus = (statusCounts.confirmed || 0) + (statusCounts.completed || 0) + (statusCounts.pending || 0) + (statusCounts.in_progress || 0) + (statusCounts.cancelled || 0);
  const statusPercentages = {
    confirmed: totalStatus ? Math.round(((statusCounts.confirmed || 0) / totalStatus) * 100) : 0,
    completed: totalStatus ? Math.round(((statusCounts.completed || 0) / totalStatus) * 100) : 0,
    pending: totalStatus ? Math.round(((statusCounts.pending || 0) / totalStatus) * 100) : 0,
  };
  
  const noShowRate = totalStatus ? Math.round(((statusCounts.cancelled || 0) / totalStatus) * 100) : 0;

  // Find max weekly count to calculate percentage for bars
  const maxWeeklyCount = Math.max(...weekStats.map(ws => ws.count), 1);
  const weekHeights = weekStats.map(ws => Math.round((ws.count / maxWeeklyCount) * 100));

  return {
    todaysBookings,
    todaysRevenue,
    completedToday,
    cancelledToday,
    pendingConfirmations,
    recentAppointments,
    weekCounts: weekStats.map(ws => ws.count),
    weekDays: weekStats.map(ws => ws.day),
    weekHeights,
    statusPercentages,
    noShowRate
  };
}
