
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const FUNCTIONS_BASE = "https://jpvjdpgtpjbrkcamyqie.supabase.co/functions/v1";

export interface ReservationResult {
  reservationId: string;
  expiresAt: string; // ISO string
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

  const reserveSlot = async (params: { slotId: string; serviceId?: string; providerId?: string; holdMinutes?: number; }): Promise<ReservationResult> => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) throw new Error("Not authenticated");

    setLoading(true);
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/reserve-slot`, {
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
      return { reservationId: json.reservationId, expiresAt: json.expiresAt };
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (reservationId: string): Promise<{ clientSecret: string; paymentIntentId: string; }> => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) throw new Error("Not authenticated");

    setLoading(true);
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/create-payment-intent-slots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ reservationId }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to create payment intent");
      }
      return { clientSecret: json.clientSecret, paymentIntentId: json.paymentIntentId };
    } finally {
      setLoading(false);
    }
  };

  // Realtime subscription for booking events
  const subscribeToEvents = (onEvent: (payload: any) => void) => {
    const channel = supabase
      .channel("booking-events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "booking_events" },
        (payload) => {
          console.log("[booking_events] new event", payload);
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
    initiatePayment,
    subscribeToEvents,
  };
};
