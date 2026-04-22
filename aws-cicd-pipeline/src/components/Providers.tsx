"use client";

import { AppProvider } from "@/context/AppContext";
import { AppLayout } from "@/components/AppLayout";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppLayout>{children}</AppLayout>
    </AppProvider>
  );
}
