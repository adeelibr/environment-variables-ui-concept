import { renderHook, act } from '@testing-library/react'
import { useWalkthrough } from '@/hooks/use-walkthrough'

describe('useWalkthrough', () => {
  it('should initialize with walkthrough not completed', () => {
    const { result } = renderHook(() => useWalkthrough())
    
    expect(result.current.hasCompletedWalkthrough).toBe(false)
  })

  it('should mark walkthrough as complete', () => {
    const { result } = renderHook(() => useWalkthrough())
    
    act(() => {
      result.current.markWalkthroughComplete()
    })
    
    expect(result.current.hasCompletedWalkthrough).toBe(true)
  })

  it('should reset walkthrough', () => {
    const { result } = renderHook(() => useWalkthrough())
    
    // Mark as complete first
    act(() => {
      result.current.markWalkthroughComplete()
    })
    
    expect(result.current.hasCompletedWalkthrough).toBe(true)
    
    // Reset walkthrough
    act(() => {
      result.current.resetWalkthrough()
    })
    
    expect(result.current.hasCompletedWalkthrough).toBe(false)
  })

  it('should persist walkthrough state to localStorage', () => {
    const { result } = renderHook(() => useWalkthrough())
    
    act(() => {
      result.current.markWalkthroughComplete()
    })
    
    // Create a new hook instance to test persistence
    const { result: result2 } = renderHook(() => useWalkthrough())
    
    expect(result2.current.hasCompletedWalkthrough).toBe(true)
  })

  it('should handle multiple complete calls idempotently', () => {
    const { result } = renderHook(() => useWalkthrough())
    
    act(() => {
      result.current.markWalkthroughComplete()
      result.current.markWalkthroughComplete()
      result.current.markWalkthroughComplete()
    })
    
    expect(result.current.hasCompletedWalkthrough).toBe(true)
  })

  it('should handle multiple reset calls idempotently', () => {
    const { result } = renderHook(() => useWalkthrough())
    
    act(() => {
      result.current.resetWalkthrough()
      result.current.resetWalkthrough()
      result.current.resetWalkthrough()
    })
    
    expect(result.current.hasCompletedWalkthrough).toBe(false)
  })

  it('should handle alternating complete/reset operations', () => {
    const { result } = renderHook(() => useWalkthrough())
    
    // Complete
    act(() => {
      result.current.markWalkthroughComplete()
    })
    expect(result.current.hasCompletedWalkthrough).toBe(true)
    
    // Reset
    act(() => {
      result.current.resetWalkthrough()
    })
    expect(result.current.hasCompletedWalkthrough).toBe(false)
    
    // Complete again
    act(() => {
      result.current.markWalkthroughComplete()
    })
    expect(result.current.hasCompletedWalkthrough).toBe(true)
  })

  it('should maintain referential stability of functions', () => {
    const { result, rerender } = renderHook(() => useWalkthrough())
    
    const initialFunctions = {
      markWalkthroughComplete: result.current.markWalkthroughComplete,
      resetWalkthrough: result.current.resetWalkthrough,
    }
    
    // Trigger a state change
    act(() => {
      result.current.markWalkthroughComplete()
    })
    
    rerender()
    
    // Functions should be the same references (implicitly using useCallback via useLocalStorage)
    expect(result.current.markWalkthroughComplete).toBe(initialFunctions.markWalkthroughComplete)
    expect(result.current.resetWalkthrough).toBe(initialFunctions.resetWalkthrough)
  })

  it('should work correctly with initial true value', () => {
    // Pre-populate localStorage with completed walkthrough
    localStorage.setItem('app-walkthrough-completed', JSON.stringify(true))
    
    const { result } = renderHook(() => useWalkthrough())
    
    expect(result.current.hasCompletedWalkthrough).toBe(true)
    
    act(() => {
      result.current.resetWalkthrough()
    })
    
    expect(result.current.hasCompletedWalkthrough).toBe(false)
  })
})
