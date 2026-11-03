"use client";

import { useSearchParams } from "next/navigation";
import { Builder } from "./Builder";
import { useHydrated } from "@/lib/cv/useHydrated";

// The form reads its initial values once, so it waits for the saved draft.
export function BuilderScreen() {
  const hydrated = useHydrated();
  const step = useSearchParams().get("step") ?? undefined;
  return hydrated ? <Builder initialStep={step} /> : null;
}
