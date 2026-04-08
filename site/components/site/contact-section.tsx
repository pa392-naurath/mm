"use client";

import { useState } from "react";

import { ContactForm } from "@/components/site/contact-form";

export const ContactSection = () => {
  const [activePanel, setActivePanel] = useState<"conversation" | "form">(
    "conversation",
  );

  return (
    <section className="contact-section" id="contact">
      <div className="contact-shell">
        <div className="contact-mobile-tabs" role="tablist" aria-label="Contact panels">
          <button
            className={`contact-mobile-tab${activePanel === "conversation" ? " is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activePanel === "conversation"}
            onClick={() => setActivePanel("conversation")}
          >
            Contact
          </button>
          <button
            className={`contact-mobile-tab${activePanel === "form" ? " is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activePanel === "form"}
            onClick={() => setActivePanel("form")}
          >
            Inquiry Form
          </button>
        </div>

        <div
          className={`contact-copy${activePanel === "conversation" ? " is-active" : ""}`}
        >
          <p className="eyebrow">Contact</p>
          <h2>Begin a quieter conversation with MallowMauve.</h2>
          <p>
            Share what you would like to enquire about and we will return with
            availability, guidance, and a considered response within 24 hours.
          </p>
          <div className="contact-details">
            <div className="contact-detail">
              <span>Email</span>
              <a href="mailto:info@mallowmauve.com">info@mallowmauve.com</a>
            </div>
            <div className="contact-detail">
              <span>Phone</span>
              <a href="tel:+919990709988">+91-9990709988</a>
            </div>
            <div className="contact-detail">
              <span>Work Timings</span>
              <p>11am to 6pm, Monday to Saturday</p>
            </div>
          </div>
        </div>

        <div className={`contact-card${activePanel === "form" ? " is-active" : ""}`}>
          <p className="eyebrow">Inquiry Form</p>
          <ContactForm />
        </div>
      </div>
    </section>
  );
};
