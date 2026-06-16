"use client";

import { createContext, useContext } from "react";

const SettingsContext = createContext<any>(null);

export function SettingsProvider({ children, settings }: { children: React.ReactNode, settings: any }) {
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
