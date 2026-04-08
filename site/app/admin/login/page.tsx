"use client";

import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <main className="detail-main" style={{ display: "grid", placeItems: "center", minHeight: "70vh" }}>
      <div className="contact-card" style={{ width: "min(520px, 100%)" }}>
        <p className="eyebrow">Admin Access</p>
        <h1 className="detail-name" style={{ maxWidth: "none", fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>
          Sign in to the MallowMauve admin.
        </h1>
        <form
          className="contact-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setPending(true);
            setMessage("");

            const supabase = getSupabaseBrowserClient();
            const { error } = await supabase.auth.signInWithOtp({
              email,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
              },
            });

            setPending(false);
            setMessage(
              error
                ? error.message
                : "Magic link sent. Use an approved admin email to complete sign-in.",
            );
          }}
        >
          <div className="contact-field">
            <label htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <button className="button button-filled" type="submit" disabled={pending}>
            {pending ? "Sending..." : "Send Magic Link"}
          </button>
          <p className={`contact-feedback${message ? " is-visible" : ""}`}>{message}</p>
        </form>
      </div>
    </main>
  );
}
