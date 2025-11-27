
import React, { useState, useCallback, useEffect } from 'react';
import LoginContainer from './components/LoginContainer';
import PredictorScreen from './components/PredictorScreen';
import { User } from './types';
import { LanguageProvider } from './contexts/LanguageContext';

const App: React.FC = () => {
  // Initialize state from localStorage if available to persist session across refreshes
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('session_user');
        return savedUser ? JSON.parse(savedUser) : null;
      } catch (error) {
        console.error("Failed to restore session:", error);
        return null;
      }
    }
    return null;
  });

  const handleLoginSuccess = useCallback((playerId: string, initialPredictions: number) => {
    const newUser = { playerId, predictionsLeft: initialPredictions };
    setUser(newUser);
    // Save user session to localStorage
    localStorage.setItem('session_user', JSON.stringify(newUser));
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    // Clear user session from localStorage
    localStorage.removeItem('session_user');
  }, []);

  return (
    <LanguageProvider>
      <div className="min-h-screen font-sans">
        {user ? (
          <PredictorScreen 
            user={user} 
            onLogout={handleLogout} 
          />
        ) : (
          <LoginContainer 
            onLoginSuccess={handleLoginSuccess} 
          />
        )}
      </div>
    </LanguageProvider>
  );
};

export default App;
