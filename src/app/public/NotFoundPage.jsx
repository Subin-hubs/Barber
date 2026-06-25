import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-8xl font-bold text-navy mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-navy mb-6">Page not found</h2>
      <p className="text-text-secondary mb-8 max-w-md mx-auto">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      <Button onClick={() => navigate('/')}>
        Go back home
      </Button>
    </div>
  );
};
