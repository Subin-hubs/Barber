import { db } from './config';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, Timestamp } from 'firebase/firestore';

export async function getActiveBarbers() {
  const q = query(
    collection(db, 'barbers'),
    where('active', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAllBarbers() {
  const snapshot = await getDocs(collection(db, 'barbers'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getBarberById(id) {
  const docRef = doc(db, 'barbers', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
  return null;
}

export async function getBarberByUserId(uid) {
  const q = query(collection(db, 'barbers'), where('userId', '==', uid));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

export async function createBarber(data) {
  const barbersRef = collection(db, 'barbers');
  const newBarberData = {
    ...data,
    active: true,
    slotDuration: 30,
    createdAt: Timestamp.now()
  };
  const docRef = await addDoc(barbersRef, newBarberData);
  return docRef.id;
}

export async function updateBarber(id, data) {
  const docRef = doc(db, 'barbers', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now()
  });
}

export async function deactivateBarber(id) {
  const docRef = doc(db, 'barbers', id);
  await updateDoc(docRef, { active: false });
}

export async function updateBarberAvailability(id, workingHours) {
  const docRef = doc(db, 'barbers', id);
  await updateDoc(docRef, {
    workingHours,
    updatedAt: Timestamp.now()
  });
}
