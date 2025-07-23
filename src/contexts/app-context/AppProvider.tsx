import React, { useState } from 'react';
import { AppContext } from './AppContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AppContext.Provider value={{ 
        isAuthenticated,
        setIsAuthenticated,

      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
