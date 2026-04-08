import { randomBytes } from "node:crypto";

export const buildSessionRef = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  const body = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");

  return `MM-S-${body}`;
};

export const buildLeadRefFromNumber = (sequence: number) =>
  `MM-L-${String(sequence).padStart(6, "0")}`;
