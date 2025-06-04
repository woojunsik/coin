import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from '@/pages/context/UserContext';

const queryClient = new QueryClient();

const AppProvider = ({ children }) => {
  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </UserProvider>
  );
};

export default AppProvider;
