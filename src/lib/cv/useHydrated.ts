import { useEffect, useSyncExternalStore } from "react";
import { useCvStore } from "./store";

const subscribe = (onChange: () => void) => useCvStore.persist.onFinishHydration(onChange);

// Loads the saved draft from localStorage and reports when it is available.
export function useHydrated() {
  const hydrated = useSyncExternalStore(subscribe, () => useCvStore.persist.hasHydrated(), () => false);

  useEffect(() => {
    if (!useCvStore.persist.hasHydrated()) void useCvStore.persist.rehydrate();
  }, []);

  return hydrated;
}
