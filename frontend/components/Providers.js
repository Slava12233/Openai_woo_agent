'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../context/AuthContext";
import { AgentProvider } from "../context/AgentContext";

// יצירת מופע של QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AgentProvider>
          {children}
        </AgentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
