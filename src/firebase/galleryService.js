import { db } from './config';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';

export async function getPublicGallery() {
  const q = query(
    collection(db, 'gallery'),
    where('public', '==', true),
    orderBy('order')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAllGallery() {
  const q = query(
    collection(db, 'gallery'),
    orderBy('order')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addGalleryImage(data) {
  const galleryRef = collection(db, 'gallery');
  const newImageData = {
    ...data,
    public: true,
    createdAt: Timestamp.now()
  };
  const docRef = await addDoc(galleryRef, newImageData);
  return docRef.id;
}

export async function updateGalleryImage(id, data) {
  const docRef = doc(db, 'gallery', id);
  await updateDoc(docRef, data);
}

export async function deleteGalleryImage(id) {
  const docRef = doc(db, 'gallery', id);
  await deleteDoc(docRef);
}
