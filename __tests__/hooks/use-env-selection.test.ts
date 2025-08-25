import { renderHook, act } from '@testing-library/react'
import { useEnvSelection } from '@/hooks/use-env-selection'

beforeEach(() => {
  localStorage.clear()
  jest.clearAllTimers()
  jest.useFakeTimers()
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

describe('useEnvSelection', () => {
  it('should initialize with empty selection state', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    expect(result.current.selectedVarIds).toEqual([])
    expect(result.current.bulkMode).toBe(false)
    expect(result.current.revealedVars.size).toBe(0)
  })

  it('should select a single variable', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    act(() => {
      result.current.selectVariable('var-1')
    })
    
    expect(result.current.selectedVarIds).toEqual(['var-1'])
    expect(result.current.bulkMode).toBe(true)
  })

  it('should select multiple variables when multi=true', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    act(() => {
      result.current.selectVariable('var-1', true)
      result.current.selectVariable('var-2', true)
    })
    
    expect(result.current.selectedVarIds).toEqual(['var-1', 'var-2'])
    expect(result.current.bulkMode).toBe(true)
  })

  it('should toggle variable selection when multi=true', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    // Select variable
    act(() => {
      result.current.selectVariable('var-1', true)
    })
    
    expect(result.current.selectedVarIds).toEqual(['var-1'])
    
    // Deselect the same variable
    act(() => {
      result.current.selectVariable('var-1', true)
    })
    
    expect(result.current.selectedVarIds).toEqual([])
    expect(result.current.bulkMode).toBe(false)
  })

  it('should replace selection when multi=false (default)', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    // Select first variable
    act(() => {
      result.current.selectVariable('var-1')
    })
    
    expect(result.current.selectedVarIds).toEqual(['var-1'])
    
    // Select second variable (should replace first)
    act(() => {
      result.current.selectVariable('var-2')
    })
    
    expect(result.current.selectedVarIds).toEqual(['var-2'])
  })

  it('should select all variables correctly', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    const allVariableIds = ['var-1', 'var-2', 'var-3']
    
    act(() => {
      result.current.selectAll(allVariableIds)
    })
    
    expect(result.current.selectedVarIds).toEqual(allVariableIds)
    expect(result.current.bulkMode).toBe(true)
  })

  it('should handle empty array for selectAll', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    act(() => {
      result.current.selectAll([])
    })
    
    expect(result.current.selectedVarIds).toEqual([])
    expect(result.current.bulkMode).toBe(false)
  })

  it('should clear selection correctly', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    // Select some variables first
    act(() => {
      result.current.selectVariable('var-1', true)
      result.current.selectVariable('var-2', true)
    })
    
    expect(result.current.selectedVarIds).toHaveLength(2)
    expect(result.current.bulkMode).toBe(true)
    
    // Clear selection
    act(() => {
      result.current.clearSelection()
    })
    
    expect(result.current.selectedVarIds).toEqual([])
    expect(result.current.bulkMode).toBe(false)
  })

  it('should toggle bulk mode correctly', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    // Initially not in bulk mode
    expect(result.current.bulkMode).toBe(false)
    
    // Toggle on
    act(() => {
      result.current.toggleBulkMode()
    })
    
    expect(result.current.bulkMode).toBe(true)
    
    // Toggle off
    act(() => {
      result.current.toggleBulkMode()
    })
    
    expect(result.current.bulkMode).toBe(false)
  })

  it('should clear selection when toggling bulk mode off', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    // Select some variables and enable bulk mode
    act(() => {
      result.current.selectVariable('var-1', true)
      result.current.selectVariable('var-2', true)
    })
    
    expect(result.current.selectedVarIds).toHaveLength(2)
    expect(result.current.bulkMode).toBe(true)
    
    // Toggle bulk mode off
    act(() => {
      result.current.toggleBulkMode()
    })
    
    expect(result.current.selectedVarIds).toEqual([])
    expect(result.current.bulkMode).toBe(false)
  })

  it('should reveal variable correctly', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    act(() => {
      result.current.revealVariable('var-1')
    })
    
    expect(result.current.revealedVars.has('var-1')).toBe(true)
  })

  it('should hide variable correctly', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    // Reveal variable first
    act(() => {
      result.current.revealVariable('var-1')
    })
    
    expect(result.current.revealedVars.has('var-1')).toBe(true)
    
    // Hide the variable
    act(() => {
      result.current.hideVariable('var-1')
    })
    
    expect(result.current.revealedVars.has('var-1')).toBe(false)
  })

  it('should auto-hide revealed variable after 30 seconds', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    act(() => {
      result.current.revealVariable('var-1')
    })
    
    expect(result.current.revealedVars.has('var-1')).toBe(true)
    
    // Fast-forward 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000)
    })
    
    expect(result.current.revealedVars.has('var-1')).toBe(false)
  })

  it('should reset timer when revealing already revealed variable', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    // Reveal variable
    act(() => {
      result.current.revealVariable('var-1')
    })
    
    // Fast-forward 29 seconds (just before auto-hide)
    act(() => {
      jest.advanceTimersByTime(29000)
    })
    
    // Reveal again (should reset timer)
    act(() => {
      result.current.revealVariable('var-1')
    })
    
    // Fast-forward another 29 seconds (should still be revealed)
    act(() => {
      jest.advanceTimersByTime(29000)
    })
    
    expect(result.current.revealedVars.has('var-1')).toBe(true)
    
    // Fast-forward 1 more second to complete the new 30-second timer
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    
    expect(result.current.revealedVars.has('var-1')).toBe(false)
  })

  it('should hide all variables correctly', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    // Reveal multiple variables
    act(() => {
      result.current.revealVariable('var-1')
      result.current.revealVariable('var-2')
      result.current.revealVariable('var-3')
    })
    
    expect(result.current.revealedVars.size).toBe(3)
    
    // Hide all variables
    act(() => {
      result.current.hideAllVariables()
    })
    
    expect(result.current.revealedVars.size).toBe(0)
  })

  it('should clear all timers when hiding all variables', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    // Reveal multiple variables (each creates a timer)
    act(() => {
      result.current.revealVariable('var-1')
      result.current.revealVariable('var-2')
    })
    
    // Hide all variables (should clear timers)
    act(() => {
      result.current.hideAllVariables()
    })
    
    // Fast-forward 30 seconds (nothing should happen since timers were cleared)
    act(() => {
      jest.advanceTimersByTime(30000)
    })
    
    expect(result.current.revealedVars.size).toBe(0)
  })

  it('should persist selection state to localStorage', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    act(() => {
      result.current.selectVariable('var-1', true)
      result.current.selectVariable('var-2', true)
    })
    
    // Create a new hook instance to test persistence
    const { result: result2 } = renderHook(() => useEnvSelection())
    
    expect(result2.current.selectedVarIds).toEqual(['var-1', 'var-2'])
    expect(result2.current.bulkMode).toBe(true)
  })

  it('should handle reveal state not persisting (ephemeral by design)', () => {
    const { result } = renderHook(() => useEnvSelection())
    
    act(() => {
      result.current.revealVariable('var-1')
    })
    
    // Create a new hook instance - revealed state should not persist
    const { result: result2 } = renderHook(() => useEnvSelection())
    
    expect(result2.current.revealedVars.size).toBe(0)
  })
})