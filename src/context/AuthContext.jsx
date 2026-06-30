import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // First check admins
          let adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
          
          // Automatic Admin Bootstrap
          if (!adminDoc.exists() && currentUser.email === 'admin@barbershop.com') {
            await setDoc(doc(db, 'admins', currentUser.uid), {
              role: "admin",
              name: "Administrator",
              email: "admin@barbershop.com",
              active: true,
              createdAt: Timestamp.now()
            });
            adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
          }

          if (adminDoc.exists()) {
            setRole('admin');
          } else {
            // Then check barbers
            const barberDoc = await getDoc(doc(db, 'barbers', currentUser.uid));
            if (barberDoc.exists()) {
              setRole('barber');
            } else {
              setRole(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user role from Firestore", error);
          setRole(null);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    role,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return React.useContext(AuthContext);
};
