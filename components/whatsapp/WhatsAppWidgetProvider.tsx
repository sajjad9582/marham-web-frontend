"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { WhatsAppWidgetContext } from "@/lib/whatsapp/whatsapp-chat";

type WhatsAppWidgetProviderValue = {
  config: WhatsAppWidgetContext;
  setConfig: (config: WhatsAppWidgetContext) => void;
};

const WhatsAppWidgetContextInstance = createContext<WhatsAppWidgetProviderValue | null>(null);

export function WhatsAppWidgetProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<WhatsAppWidgetContext>({});

  const value = useMemo(
    () => ({
      config,
      setConfig,
    }),
    [config],
  );

  return (
    <WhatsAppWidgetContextInstance.Provider value={value}>
      {children}
    </WhatsAppWidgetContextInstance.Provider>
  );
}

export function useWhatsAppWidgetConfig() {
  const context = useContext(WhatsAppWidgetContextInstance);
  if (!context) {
    throw new Error("useWhatsAppWidgetConfig must be used within WhatsAppWidgetProvider");
  }
  return context;
}
