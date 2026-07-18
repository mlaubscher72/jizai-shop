"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState("error");
      setTimeout(() => setState("idle"), 1200);
      return;
    }
    setState("busy");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error();
      setState("sent");
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 1500);
    }
  }

  return (
    <form className={`waitlist-form${state === "sent" ? " is-sent" : ""}`} onSubmit={submit} noValidate>
      <div className="wf-field">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deine@email.ch"
          required
          autoComplete="email"
          aria-label="E-Mail-Adresse"
          style={state === "error" ? { color: "#b03a2b" } : undefined}
        />
        <button type="submit" data-hover disabled={state === "busy"}>
          <span className="wf-btn-label">{state === "busy" ? "…" : "Join the ritual"}</span>
          <span className="wf-btn-kana">参加</span>
        </button>
      </div>
      <p className="wf-note">Early Access auf Akt II · kein Spam · nur Drops</p>
      <p className="wf-success">ようこそ — Du bist auf der Liste. Begin before the noise.</p>
    </form>
  );
}
