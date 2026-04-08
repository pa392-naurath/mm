"use client";

import { useState } from "react";

export const ContactForm = () => {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="contact-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setMessage("");

        const formData = new FormData(event.currentTarget);
        const payload = {
          name: String(formData.get("name") ?? ""),
          contact: String(formData.get("contact") ?? ""),
          email: String(formData.get("email") ?? ""),
          location: String(formData.get("location") ?? ""),
          note: String(formData.get("note") ?? ""),
          anonymousId:
            window.localStorage.getItem("mallowmauve.anonymousId") ?? crypto.randomUUID(),
        };

        const response = await fetch("/api/lead", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({ message: "Unable to send inquiry." }));

        setMessage(
          response.ok
            ? "Inquiry received. We will return with a considered response within 24 hours."
            : data.message ?? "Unable to send inquiry.",
        );
        setPending(false);
      }}
    >
      <div className="contact-form-grid">
        <div className="contact-field">
          <label htmlFor="contact-name">Name</label>
          <input id="contact-name" name="name" type="text" autoComplete="name" required />
        </div>
        <div className="contact-field">
          <label htmlFor="contact-phone">Contact Details</label>
          <input id="contact-phone" name="contact" type="text" autoComplete="tel" required />
        </div>
        <div className="contact-field">
          <label htmlFor="contact-email">Email</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="contact-field">
          <label htmlFor="contact-location">Location</label>
          <input id="contact-location" name="location" type="text" autoComplete="address-level2" required />
        </div>
        <div className="contact-field contact-field--full">
          <label htmlFor="contact-note">Inquiry Note</label>
          <textarea
            id="contact-note"
            name="note"
            placeholder="Tell us what you would like to enquire about."
            required
          />
        </div>
      </div>

      <button className="button button-filled" type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send Inquiry"}
      </button>
      <p className={`contact-feedback${message ? " is-visible" : ""}`} aria-live="polite">
        {message}
      </p>
    </form>
  );
};
