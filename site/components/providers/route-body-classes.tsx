"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const RouteBodyClasses = () => {
  const pathname = usePathname();

  useEffect(() => {
    const { body } = document;
    const isHome = pathname === "/";

    if (isHome) {
      body.classList.add("home-page");

      const frame = window.requestAnimationFrame(() => {
        body.classList.add("is-loaded");
      });

      return () => {
        window.cancelAnimationFrame(frame);
        body.classList.remove("home-page", "is-loaded");
      };
    }

    body.classList.remove("home-page", "is-loaded");

    return () => {
      body.classList.remove("home-page", "is-loaded");
    };
  }, [pathname]);

  return null;
};
