import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  Timestamp,
  setDoc
} from 'firebase/firestore';

import { initializeApp, deleteApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

/* -------------------------------------------------------------------------- */
/*                          Create Firebase Auth User                         */
/* -------------------------------------------------------------------------- */

const createAuthUser = async (email, password) => {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  // Remove existing secondary app if it already exists
  const existing = getApps().find(app => app.name === "SecondaryApp");
  if (existing) {
    await deleteApp(existing);
  }

  const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password
    );

    const uid = userCredential.user.uid;

    await secondaryAuth.signOut();
    await deleteApp(secondaryApp);

    return uid;
  } catch (error) {
    await deleteApp(secondaryApp);
    throw error;
  }
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const normalizeBarberData = (docId, data) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let normalizedWorkingHours = data.workingHours;

  // Fallback: If workingHours is an object or missing, convert to Array
  if (!Array.isArray(normalizedWorkingHours)) {
    const defaultStart = normalizedWorkingHours?.start || "09:00";
    const defaultEnd = normalizedWorkingHours?.end || "19:00";
    
    // Check if they had a workingDays array (from previous implementations)
    const workingDays = Array.isArray(data.workingDays) ? data.workingDays : days;
    
    normalizedWorkingHours = days.map(day => ({
      day,
      // Mapping 'Mon' to 'Monday' if needed, or just checking prefix
      isOpen: workingDays.some(wd => wd.startsWith(day.substring(0, 3))),
      openTime: defaultStart,
      closeTime: defaultEnd
    }));
  }

  return {
    id: docId,
    ...data,
    workingHours: normalizedWorkingHours,
    leaves: Array.isArray(data.leaves) ? data.leaves : [],
    breaks: Array.isArray(data.breaks) ? data.breaks : []
  };
};

/* -------------------------------------------------------------------------- */
/*                                  READ                                      */
/* -------------------------------------------------------------------------- */

export async function getActiveBarbers() {
  const q = query(
    collection(db, "barbers"),
    where("active", "==", true)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => normalizeBarberData(doc.id, doc.data()));
}

export async function getAllBarbers() {
  const snapshot = await getDocs(collection(db, "barbers"));

  return snapshot.docs.map(doc => normalizeBarberData(doc.id, doc.data()));
}

export async function getBarberById(id) {
  const docSnap = await getDoc(doc(db, "barbers", id));

  if (!docSnap.exists()) return null;

  return normalizeBarberData(docSnap.id, docSnap.data());
}

export async function getBarberByUserId(uid) {
  const docSnap = await getDoc(doc(db, "barbers", uid));

  if (!docSnap.exists()) return null;

  return normalizeBarberData(docSnap.id, docSnap.data());
}

/* -------------------------------------------------------------------------- */
/*                                  CREATE                                    */
/* -------------------------------------------------------------------------- */

export async function createBarber(data, password) {
  try {
    // Create Authentication account
    const uid = await createAuthUser(data.email, password);

    // Create Firestore document using UID as document ID
    const newBarberData = {
      userId: uid,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      address: data.address || '',
      gender: data.gender || '',
      specialty: data.specialty || '',
      experience: data.experience || '',
      photoUrl: data.photoUrl || '',
      bio: data.bio || '',
      
      // Setup default normalized schema
      workingHours: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => ({
        day,
        isOpen: data.workingDays ? data.workingDays.some(wd => wd.startsWith(day.substring(0,3))) : day !== 'Sunday',
        openTime: data.workingHours?.start || "09:00",
        closeTime: data.workingHours?.end || "17:00"
      })),
      leaves: [],
      breaks: [],
      
      active: true,
      slotDuration: 30,
      createdAt: Timestamp.now(),
      role: 'barber'
    };

    await setDoc(doc(db, "barbers", uid), newBarberData);

    return uid;
  } catch (error) {
    console.error("createBarber error:", error);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                                  UPDATE                                    */
/* -------------------------------------------------------------------------- */

export async function updateBarber(id, data) {
  await updateDoc(doc(db, "barbers", id), {
    ...data,
    updatedAt: Timestamp.now()
  });
}

export async function deactivateBarber(id) {
  await updateDoc(doc(db, 'barbers', id), {
    active: false,
    updatedAt: Timestamp.now()
  });
}

export async function reactivateBarber(id) {
  await updateDoc(doc(db, 'barbers', id), {
    active: true,
    updatedAt: Timestamp.now()
  });
}

export async function updateBarberAvailability(id, workingHours) {
  await updateDoc(doc(db, 'barbers', id), {
    workingHours,
    updatedAt: Timestamp.now()
  });
}