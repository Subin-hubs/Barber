import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Scissors, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, role, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'barber') navigate('/barber/dashboard');
    }
  }, [user, role, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const userCredential = await login(email, password);
      const uid = userCredential.user.uid;
      
      // Look up role in Firestore to navigate instantly and show error if unauthorized
      let adminDoc = await getDoc(doc(db, 'admins', uid));
      
      // Automatic Admin Bootstrap
      if (!adminDoc.exists() && userCredential.user.email === 'admin@barbershop.com') {
        await setDoc(doc(db, 'admins', uid), {
          role: "admin",
          name: "Administrator",
          email: "admin@barbershop.com",
          active: true,
          createdAt: Timestamp.now()
        });
        adminDoc = await getDoc(doc(db, 'admins', uid));
      }

      if (adminDoc.exists()) {
        navigate('/admin/dashboard');
      } else {
        const barberDoc = await getDoc(doc(db, 'barbers', uid));
        if (barberDoc.exists()) {
          navigate('/barber/dashboard');
        } else {
          // If the user has no staff role in Firestore, log them out and show error
          await logout();
          setError('You do not have staff access.');
        }
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError("No account found with these credentials.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-sm w-full rounded-2xl shadow-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold-light text-gold mb-4">
            <Scissors className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-navy">John's Barber</h1>
          <p className="text-text-muted text-sm mt-1">Staff Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-gold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-gold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-muted hover:text-navy"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-border pt-6">
          <Link to="/book" className="text-xs text-text-muted hover:text-navy transition-colors">
            Customer? Book your appointment &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
