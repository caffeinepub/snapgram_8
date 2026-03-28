import { useCallback, useEffect, useRef, useState } from "react";

const KEYS = {
  limit: "snapgram_time_limit_seconds",
  used: "snapgram_used_seconds_today",
  date: "snapgram_last_reset_date",
};

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadState() {
  const today = getTodayStr();
  const storedDate = localStorage.getItem(KEYS.date) ?? "";
  let used = Number(localStorage.getItem(KEYS.used) ?? 0);
  if (storedDate !== today) {
    used = 0;
    localStorage.setItem(KEYS.used, "0");
    localStorage.setItem(KEYS.date, today);
  }
  const limit = Number(localStorage.getItem(KEYS.limit) ?? 3600);
  return { used, limit };
}

export function useTimeLimitTracker() {
  const initial = loadState();
  const [usedSeconds, setUsedSeconds] = useState(initial.used);
  const [limitSeconds, setLimitSeconds] = useState(initial.limit);
  const activeRef = useRef(document.visibilityState === "visible");

  useEffect(() => {
    const onVisibility = () => {
      activeRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!activeRef.current) return;

      // Daily reset check
      const today = getTodayStr();
      const storedDate = localStorage.getItem(KEYS.date) ?? "";
      if (storedDate !== today) {
        localStorage.setItem(KEYS.date, today);
        localStorage.setItem(KEYS.used, "0");
        setUsedSeconds(0);
        return;
      }

      setUsedSeconds((prev) => {
        const next = prev + 1;
        localStorage.setItem(KEYS.used, String(next));
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const setLimit = useCallback((minutes: number) => {
    const secs = minutes * 60;
    localStorage.setItem(KEYS.limit, String(secs));
    setLimitSeconds(secs);
  }, []);

  const resetToday = useCallback(() => {
    localStorage.setItem(KEYS.used, "0");
    localStorage.setItem(KEYS.date, getTodayStr());
    setUsedSeconds(0);
  }, []);

  const remainingSeconds = Math.max(0, limitSeconds - usedSeconds);
  const isLimitReached = usedSeconds >= limitSeconds;

  return {
    remainingSeconds,
    usedSeconds,
    limitSeconds,
    setLimit,
    isLimitReached,
    resetToday,
  };
}
