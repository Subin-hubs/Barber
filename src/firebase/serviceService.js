import { db } from './config';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';

export async function getActiveServices() {
  const q = query(
    collection(db, 'services'),
    where('active', '==', true)
  );
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return docs.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getAllServices() {
  const q = query(
    collection(db, 'services'),
    orderBy('order')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getServiceById(id) {
  const docRef = doc(db, 'services', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
  return null;
}

export async function createService(data) {
  const servicesRef = collection(db, 'services');
  const newServiceData = {
    ...data,
    active: true,
    createdAt: Timestamp.now()
  };
  const docRef = await addDoc(servicesRef, newServiceData);
  return docRef.id;
}

export async function updateService(id, data) {
  const docRef = doc(db, 'services', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now()
  });
}

export async function deleteService(id) {
  const docRef = doc(db, 'services', id);
  await updateDoc(docRef, {
    active: false,
    deletedAt: Timestamp.now()
  });
}
