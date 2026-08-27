"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { WorkspaceProvider } from "../lib/workspace/workspace-context";

export const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WorkspaceProvider>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="niwa-theme"
        >
          {children}
        </NextThemesProvider>
      </WorkspaceProvider>
    </QueryClientProvider>
  );
};
