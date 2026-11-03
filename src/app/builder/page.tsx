import type { Metadata } from "next";
import { Suspense } from "react";
import { BuilderScreen } from "@/components/BuilderScreen";

export const metadata: Metadata = {
  title: "Editor CV | CV Builder",
  robots: { index: false },
};

export default function BuilderPage() {
  return (
    <Suspense>
      <BuilderScreen />
    </Suspense>
  );
}
