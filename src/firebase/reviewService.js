import { db } from './config';
import { collection, doc, addDoc, getDocs, updateDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';

export async function getApprovedReviews() {
  const q = query(
    collection(db, 'reviews'),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAllReviews(status = null) {
  let q = collection(db, 'reviews');
  if (status) {
    q = query(q, where('status', '==', status), orderBy('createdAt', 'desc'));
  } else {
    q = query(q, orderBy('createdAt', 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  const docRef = doc(db, 'reviews', id);
  await updateDoc(docRef, { status: 'approved' });
}

export async function rejectReview(id) {
  const docRef = doc(db, 'reviews', id);
  await updateDoc(docRef, { status: 'rejected' });
}
