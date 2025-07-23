import React, { useState } from 'react';
import { AppContext } from './AppContext';
import type { User } from '@supabase/supabase-js';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  return (
    <AppContext.Provider value={{ 
        user,
        isAuthenticated,
        setUser,
        setIsAuthenticated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
