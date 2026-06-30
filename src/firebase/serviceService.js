import { db } from './config';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';

const normalizeServiceData = (docId, data) => {
  return {
    id: docId,
    name: data.name || '',
    category: data.category || '',
    duration: Number(data.duration) || 30,
    price: Number(data.price) || 0,
    active: data.active !== false,
    order: Number(data.order) || 0,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};

export async function getActiveServices() {
  const q = query(
    collection(db, 'services'),
    where('active', '==', true)
  );
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map(doc => normalizeServiceData(doc.id, doc.data()));
  return docs.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getAllServices() {
  const q = query(
    collection(db, 'services'),
    orderBy('order')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => normalizeServiceData(doc.id, doc.data()));
}

export async function getServiceById(id) {
  const docRef = doc(db, 'services', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return normalizeServiceData(docSnap.id, docSnap.data());
  return null;
}

export async function createService(data) {
  const servicesRef = collection(db, 'services');
  const newServiceData = {
    name: data.name || '',
    category: data.category || '',
    duration: Number(data.duration) || 30,
    price: Number(data.price) || 0,
    active: true,
    order: Number(data.order) || 0,
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
