
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const FUNCTIONS_BASE = "https://jpvjdpgtpjbrkcamyqie.supabase.co/functions/v1";

export interface ReservationResult {
  reservationId: string;
  holdExpiresAt: string; // ISO string
}

export const useReservationTimer = (expiresAt?: string | null) => {
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setRemainingMs(0);
      return;
    }
    const target = new Date(expiresAt).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setRemainingMs(diff);
    };

    tick();
    intervalRef.current = window.setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [expiresAt]);

  const formatted = useMemo(() => {
    const totalSec = Math.floor(remainingMs / 1000);
    const m = Math.floor(totalSec / 60).toString().padStart(2, "0");
    const s = (totalSec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [remainingMs]);

  return { remainingMs, formatted };
};

export const useSlotBooking = () => {
  const [loading, setLoading] = useState(false);

  const reserveSlot = async (params: { slotId: string; holdMinutes?: number; }): Promise<ReservationResult> => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) throw new Error("Not authenticated");

    setLoading(true);
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/reserve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(params),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to reserve slot");
      }
      return { reservationId: json.reservationId, holdExpiresAt: json.holdExpiresAt };
    } finally {
      setLoading(false);
    }
  };

  const initiateCheckout = async (reservationId: string): Promise<{ url: string; sessionId: string; }> => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) throw new Error("Not authenticated");

    setLoading(true);
    try {
      const origin = window.location.origin;
      const res = await fetch(`${FUNCTIONS_BASE}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          reservationId,
          successUrl: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/checkout`,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to create checkout session");
      }
      return { url: json.url, sessionId: json.sessionId };
    } finally {
      setLoading(false);
    }
  };

  // Realtime subscription for events table
  const subscribeToEvents = (onEvent: (payload: any) => void) => {
    const channel = supabase
      .channel("events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "events" },
        (payload) => {
          console.log("[events] new event", payload);
          onEvent?.(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    loading,
    reserveSlot,
    initiateCheckout,
    subscribeToEvents,
  };
};
