"use client";

import { useEffect } from "react";

import type { WhatsAppWidgetContext } from "@/lib/whatsapp/whatsapp-chat";

import { useWhatsAppWidgetConfig } from "./WhatsAppWidgetProvider";

type WhatsAppWidgetConfigProps = WhatsAppWidgetContext;

export function WhatsAppWidgetConfig(props: WhatsAppWidgetConfigProps) {
  const { setConfig } = useWhatsAppWidgetConfig();

  useEffect(() => {
    setConfig(props);
    return () => setConfig({});
  }, [
    props.pageUrl,
    props.specialityId,
    props.doctorName,
    props.doctorId,
    props.doctorOnPanel,
    setConfig,
  ]);

  return null;
}
