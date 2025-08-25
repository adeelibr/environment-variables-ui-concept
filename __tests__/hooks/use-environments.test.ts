import { renderHook, act } from '@testing-library/react'
import { useEnvironments } from '@/hooks/use-environments'
import type { Environment } from '@/types/env-vars'

// Mock constants
jest.mock('@/lib/constants', () => ({
  ENVIRONMENTS: ['development', 'preview', 'production'],
  getAllEnvironments: () => ['development', 'preview', 'production']
}))

beforeEach(() => {
  localStorage.clear()
})

describe('useEnvironments', () => {
  it('should initialize with all environments selected', () => {
    const { result } = renderHook(() => useEnvironments())
    
    expect(result.current.selectedEnvironments).toEqual(['development', 'preview', 'production'])
    expect(result.current.hasSelectedEnvironments).toBe(true)
  })

  it('should toggle environment selection', () => {
    const { result } = renderHook(() => useEnvironments())
    
    // Remove development
    act(() => {
      result.current.toggleEnvironment('development')
    })
    
    expect(result.current.selectedEnvironments).toEqual(['preview', 'production'])
    expect(result.current.isEnvironmentSelected('development')).toBe(false)
    expect(result.current.isEnvironmentSelected('preview')).toBe(true)
    
    // Add development back
    act(() => {
      result.current.toggleEnvironment('development')
    })
    
    expect(result.current.selectedEnvironments).toContain('development')
    expect(result.current.isEnvironmentSelected('development')).toBe(true)
  })

  it('should set environments directly', () => {
    const { result } = renderHook(() => useEnvironments())
    
    const newSelection: Environment[] = ['development', 'production']
    
    act(() => {
      result.current.setSelectedEnvironments(newSelection)
    })
    
    expect(result.current.selectedEnvironments).toEqual(newSelection)
    expect(result.current.isEnvironmentSelected('development')).toBe(true)
    expect(result.current.isEnvironmentSelected('preview')).toBe(false)
    expect(result.current.isEnvironmentSelected('production')).toBe(true)
  })

  it('should select all environments', () => {
    const { result } = renderHook(() => useEnvironments())
    
    // Clear first
    act(() => {
      result.current.clearEnvironments()
    })
    
    expect(result.current.selectedEnvironments).toEqual([])
    
    // Select all
    act(() => {
      result.current.selectAllEnvironments()
    })
    
    expect(result.current.selectedEnvironments).toEqual(['development', 'preview', 'production'])
    expect(result.current.hasSelectedEnvironments).toBe(true)
  })

  it('should clear all environments', () => {
    const { result } = renderHook(() => useEnvironments())
    
    // Initially should have environments selected
    expect(result.current.selectedEnvironments.length).toBeGreaterThan(0)
    
    act(() => {
      result.current.clearEnvironments()
    })
    
    expect(result.current.selectedEnvironments).toEqual([])
    expect(result.current.hasSelectedEnvironments).toBe(false)
  })

  it('should check if environment is selected correctly', () => {
    const { result } = renderHook(() => useEnvironments())
    
    // All should be selected initially
    expect(result.current.isEnvironmentSelected('development')).toBe(true)
    expect(result.current.isEnvironmentSelected('preview')).toBe(true)
    expect(result.current.isEnvironmentSelected('production')).toBe(true)
    
    // Remove one environment
    act(() => {
      result.current.toggleEnvironment('preview')
    })
    
    expect(result.current.isEnvironmentSelected('development')).toBe(true)
    expect(result.current.isEnvironmentSelected('preview')).toBe(false)
    expect(result.current.isEnvironmentSelected('production')).toBe(true)
  })

  it('should handle hasSelectedEnvironments correctly', () => {
    const { result } = renderHook(() => useEnvironments())
    
    // Initially should have environments
    expect(result.current.hasSelectedEnvironments).toBe(true)
    
    // Clear all
    act(() => {
      result.current.clearEnvironments()
    })
    
    expect(result.current.hasSelectedEnvironments).toBe(false)
    
    // Add one back
    act(() => {
      result.current.toggleEnvironment('development')
    })
    
    expect(result.current.hasSelectedEnvironments).toBe(true)
  })

  it('should preserve order when toggling', () => {
    const { result } = renderHook(() => useEnvironments())
    
    // Remove and add back in different order
    act(() => {
      result.current.toggleEnvironment('development')
      result.current.toggleEnvironment('production')
      result.current.toggleEnvironment('development')
      result.current.toggleEnvironment('production')
    })
    
    // Order should be maintained as added
    expect(result.current.selectedEnvironments).toEqual(['preview', 'development', 'production'])
  })

  it('should handle duplicate toggle attempts gracefully', () => {
    const { result } = renderHook(() => useEnvironments())
    
    const initialLength = result.current.selectedEnvironments.length
    
    // Remove environment twice
    act(() => {
      result.current.toggleEnvironment('development')
      result.current.toggleEnvironment('development')
    })
    
    // Should be back to original state
    expect(result.current.selectedEnvironments.length).toBe(initialLength)
    expect(result.current.isEnvironmentSelected('development')).toBe(true)
  })

  it('should persist state to localStorage', () => {
    const { result } = renderHook(() => useEnvironments())
    
    act(() => {
      result.current.setSelectedEnvironments(['development', 'production'])
    })
    
    // Create a new hook instance to test persistence
    const { result: result2 } = renderHook(() => useEnvironments())
    
    expect(result2.current.selectedEnvironments).toEqual(['development', 'production'])
  })

  it('should handle empty array selection', () => {
    const { result } = renderHook(() => useEnvironments())
    
    act(() => {
      result.current.setSelectedEnvironments([])
    })
    
    expect(result.current.selectedEnvironments).toEqual([])
    expect(result.current.hasSelectedEnvironments).toBe(false)
    expect(result.current.isEnvironmentSelected('development')).toBe(false)
    expect(result.current.isEnvironmentSelected('preview')).toBe(false)
    expect(result.current.isEnvironmentSelected('production')).toBe(false)
  })

  it('should handle single environment selection', () => {
    const { result } = renderHook(() => useEnvironments())
    
    act(() => {
      result.current.setSelectedEnvironments(['production'])
    })
    
    expect(result.current.selectedEnvironments).toEqual(['production'])
    expect(result.current.hasSelectedEnvironments).toBe(true)
    expect(result.current.isEnvironmentSelected('development')).toBe(false)
    expect(result.current.isEnvironmentSelected('preview')).toBe(false)
    expect(result.current.isEnvironmentSelected('production')).toBe(true)
  })

  it('should maintain referential stability of functions', () => {
    const { result, rerender } = renderHook(() => useEnvironments())
    
    const initialFunctions = {
      toggleEnvironment: result.current.toggleEnvironment,
      selectAllEnvironments: result.current.selectAllEnvironments,
      clearEnvironments: result.current.clearEnvironments,
      isEnvironmentSelected: result.current.isEnvironmentSelected,
    }
    
    // Trigger a state change
    act(() => {
      result.current.toggleEnvironment('development')
    })
    
    rerender()
    
    // Functions should be the same references (using useCallback)
    expect(result.current.toggleEnvironment).toBe(initialFunctions.toggleEnvironment)
    expect(result.current.selectAllEnvironments).toBe(initialFunctions.selectAllEnvironments)
    expect(result.current.clearEnvironments).toBe(initialFunctions.clearEnvironments)
    expect(result.current.isEnvironmentSelected).toBe(initialFunctions.isEnvironmentSelected)
  })
})