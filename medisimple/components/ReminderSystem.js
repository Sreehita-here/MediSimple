import { useEffect, useRef, useCallback } from "react";

export default function ReminderSystem() {
  const notifiedRef = useRef(new Set()); // Track which reminders already fired this minute
  const intervalRef = useRef(null);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  const checkReminders = useCallback(async () => {
    if (typeof window === "undefined" || Notification.permission !== "granted") return;
    if (localStorage.getItem("medisimple_reminders_enabled") === "false") return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    try {
      const res = await fetch("/api/user-medicines");
      if (!res.ok) return;
      const data = await res.json();
      const activeMeds = data.active || [];

      for (const med of activeMeds) {
        if (!med.reminderTimes || med.reminderTimes.length === 0) continue;

        for (const time of med.reminderTimes) {
          const key = `${med._id}-${time}-${currentTime}`;
          if (time === currentTime && !notifiedRef.current.has(key)) {
            notifiedRef.current.add(key);

            new Notification("💊 MediSimple — Time for your medicine!", {
              body: `Take ${med.name} ${med.strength}${med.frequency ? ` (${med.frequency})` : ""}`,
              icon: "/favicon.ico",
              tag: key,
              requireInteraction: true,
            });

            // Clean up old keys (keep set from growing forever)
            if (notifiedRef.current.size > 500) {
              notifiedRef.current.clear();
            }
          }
        }
      }
    } catch {
      // Silently fail — don't crash the app for reminder issues
    }
  }, []);

  useEffect(() => {
    requestPermission();

    // Check every 30 seconds for reminder matches
    intervalRef.current = setInterval(checkReminders, 30000);
    // Also run immediately once
    checkReminders();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [requestPermission, checkReminders]);

  // This component renders nothing — it just runs the background check
  return null;
}
