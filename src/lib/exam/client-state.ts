"use client";
import { useSyncExternalStore } from "react";
import { todayInPakistan } from "./exam-dates";

const noop = () => () => {};
/** Today's date in Pakistan; null during server render so markup matches on hydration. */
export function useToday(): string | null {
  return useSyncExternalStore(noop, () => todayInPakistan(), () => null);
}

const EVENT = "exam-local-storage-change";
/** Used when localStorage is unavailable (private mode, blocked): works for this visit only. */
const memory = new Map<string, string>();
let storageBroken = false;

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function read(key: string) {
  try {
    const value = localStorage.getItem(key);
    return value ?? memory.get(key) ?? "";
  } catch {
    storageBroken = true;
    return memory.get(key) ?? "";
  }
}

function write(key: string, value: string) {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value);
    memory.delete(key);
  } catch {
    storageBroken = true;
  }
  window.dispatchEvent(new Event(EVENT));
}

function remove(key: string) {
  memory.delete(key);
  try {
    localStorage.removeItem(key);
  } catch {
    storageBroken = true;
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Raw stored string for `key` ("" when unset); null before hydration. Never throws. */
export function useStoredString(key: string): {
  value: string | null;
  save: (value: string) => void;
  clear: () => void;
  unavailable: boolean;
} {
  const value = useSyncExternalStore(subscribe, () => read(key), () => null);
  const unavailable = useSyncExternalStore(subscribe, () => storageBroken, () => false);
  return { value, save: (next) => write(key, next), clear: () => remove(key), unavailable };
}
