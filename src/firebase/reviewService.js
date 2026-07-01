import { db } from './config';
import {
  collection, doc, addDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, Timestamp
} from 'firebase/firestore';

export async function getApprovedReviews() {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    // Fallback without orderBy if index doesn't exist
    const q = query(collection(db, 'reviews'), where('status', '==', 'approved'));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return docs.sort((a, b) => {
      const aT = a.createdAt?.toMillis?.() ?? 0;
      const bT = b.createdAt?.toMillis?.() ?? 0;
      return bT - aT;
    });
  }
}

export async function getAllReviews() {
  try {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    // Fallback without orderBy if composite index doesn't exist
    const snapshot = await getDocs(collection(db, 'reviews'));
    const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return docs.sort((a, b) => {
      const aT = a.createdAt?.toMillis?.() ?? 0;
      const bT = b.createdAt?.toMillis?.() ?? 0;
      return bT - aT;
    });
  }
}

export async function submitReview(data) {
  const reviewsRef = collection(db, 'reviews');
  const newReviewData = {
    ...data,
    status: 'pending',
    createdAt: Timestamp.now()
  };
  const docRef = await addDoc(reviewsRef, newReviewData);
  return docRef.id;
}

export async function approveReview(id) {
  await updateDoc(doc(db, 'reviews', id), { status: 'approved', updatedAt: Timestamp.now() });
}

export async function rejectReview(id) {
  await updateDoc(doc(db, 'reviews', id), { status: 'rejected', updatedAt: Timestamp.now() });
}

export async function deleteReview(id) {
  await deleteDoc(doc(db, 'reviews', id));
}
