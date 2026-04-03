"use client";

import { Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SPLASH_SESSION_KEY = "asset-lens-splash-shown";

/**
 * Full-screen splash overlay shown once per browser session.
 *
 * Renders the overlay on first paint (SSR-safe) to prevent
 * a flash of page content before the splash appears.
 * On the client, useEffect checks sessionStorage and either
 * schedules the exit animation or removes it immediately.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "exiting" | "done">("visible");
  const resolved = useRef(false);

  useEffect(() => {
    if (resolved.current) return;
    resolved.current = true;

    // If already shown this session, remove immediately without animation
    if (sessionStorage.getItem(SPLASH_SESSION_KEY)) {
      setPhase("done");
      return;
    }

    sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
    // Stay visible, then schedule exit
    const exitTimer = setTimeout(() => setPhase("exiting"), 1500);
    const doneTimer = setTimeout(() => setPhase("done"), 2000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, hsl(220 25% 10%) 0%, hsl(240 20% 18%) 50%, hsl(260 25% 14%) 100%)",
        animation:
          phase === "exiting"
            ? "splash-slide-up 500ms ease-in forwards"
            : undefined,
        pointerEvents: "none",
      }}
    >
      {/* Logo */}
      <div
        style={{
          animation: "splash-pulse 1.4s ease-in-out infinite",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 96,
          height: 96,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, hsl(250 60% 55%) 0%, hsl(220 70% 50%) 100%)",
          boxShadow: "0 0 60px hsl(240 60% 50% / 0.35)",
        }}
      >
        <Wallet size={48} color="white" strokeWidth={1.8} />
      </div>

      {/* App name */}
      <h1
        style={{
          marginTop: 28,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "white",
          animation: "splash-text-in 600ms ease-out 200ms both",
        }}
      >
        AssetLens
      </h1>

      {/* Tagline */}
      <p
        style={{
          marginTop: 8,
          fontSize: 14,
          fontWeight: 400,
          color: "hsl(220 15% 65%)",
          animation: "splash-text-in 600ms ease-out 400ms both",
        }}
      >
        スマート家計管理
      </p>
    </div>
  );
}
