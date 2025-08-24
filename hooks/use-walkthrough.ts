"use client"

import { useLocalStorage } from "./use-local-storage"

const STORAGE_KEY = "app-walkthrough-completed"

export function useWalkthrough() {
  const [hasCompletedWalkthrough, setHasCompletedWalkthrough] = useLocalStorage<boolean>(STORAGE_KEY, false)

  const markWalkthroughComplete = () => {
    setHasCompletedWalkthrough(true)
  }

  const resetWalkthrough = () => {
    setHasCompletedWalkthrough(false)
  }

  return {
    hasCompletedWalkthrough,
    markWalkthroughComplete,
    resetWalkthrough,
  }
}
