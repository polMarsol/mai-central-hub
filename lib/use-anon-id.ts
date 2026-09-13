"use client";

import { useSyncExternalStore } from "react";

const COOKIE_NAME = "anon_id";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 400; // límite máximo aceptado por los navegadores

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function getSnapshot(): string {
  let id = readCookie(COOKIE_NAME);
  if (!id) {
    id = crypto.randomUUID();
    document.cookie = `${COOKIE_NAME}=${id}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
  }
  return id;
}

function getServerSnapshot(): string | null {
  return null;
}

function subscribe() {
  return () => {};
}

export function useAnonId(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
