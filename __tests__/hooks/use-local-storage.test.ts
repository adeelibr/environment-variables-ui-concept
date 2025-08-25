import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@/hooks/use-local-storage'

// Mock console.error to prevent test output noise
const originalConsoleError = console.error
beforeEach(() => {
  console.error = jest.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

describe('useLocalStorage', () => {
  it('should initialize with default value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'))
    
    expect(result.current[0]).toBe('default-value')
  })

  it('should initialize with value from localStorage if it exists', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'))
    
    expect(result.current[0]).toBe('stored-value')
  })

  it('should update state and localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    act(() => {
      result.current[1]('updated-value')
    })
    
    expect(result.current[0]).toBe('updated-value')
    expect(JSON.parse(localStorage.getItem('test-key') || '')).toBe('updated-value')
  })

  it('should handle function updates correctly', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 10))
    
    act(() => {
      result.current[1]((prev) => prev + 5)
    })
    
    expect(result.current[0]).toBe(15)
    expect(JSON.parse(localStorage.getItem('test-key') || '')).toBe(15)
  })

  it('should clear value and localStorage when clearValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    // Set a value first
    act(() => {
      result.current[1]('some-value')
    })
    
    // Clear the value
    act(() => {
      result.current[2]()
    })
    
    expect(result.current[0]).toBe('initial')
    expect(localStorage.getItem('test-key')).toBeNull()
  })

  it('should handle complex objects correctly', () => {
    const complexObject = { name: 'test', items: [1, 2, 3], nested: { value: true } }
    
    const { result } = renderHook(() => useLocalStorage('complex-key', {}))
    
    act(() => {
      result.current[1](complexObject)
    })
    
    expect(result.current[0]).toEqual(complexObject)
    expect(JSON.parse(localStorage.getItem('complex-key') || '{}')).toEqual(complexObject)
  })

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw an error
    const originalSetItem = localStorage.setItem
    localStorage.setItem = jest.fn(() => {
      throw new Error('LocalStorage error')
    })
    
    const { result } = renderHook(() => useLocalStorage('error-key', 'default'))
    
    act(() => {
      result.current[1]('new-value')
    })
    
    // Should still update the state even if localStorage fails
    expect(result.current[0]).toBe('new-value')
    expect(console.error).toHaveBeenCalled()
    
    // Restore original method
    localStorage.setItem = originalSetItem
  })

  it('should handle malformed JSON in localStorage gracefully', () => {
    // Set malformed JSON directly
    localStorage.setItem('malformed-key', 'invalid-json{')
    
    const { result } = renderHook(() => useLocalStorage('malformed-key', 'fallback'))
    
    expect(result.current[0]).toBe('fallback')
    expect(console.error).toHaveBeenCalled()
  })

  it('should work with arrays', () => {
    const testArray = ['item1', 'item2', 'item3']
    
    const { result } = renderHook(() => useLocalStorage('array-key', []))
    
    act(() => {
      result.current[1](testArray)
    })
    
    expect(result.current[0]).toEqual(testArray)
    expect(JSON.parse(localStorage.getItem('array-key') || '[]')).toEqual(testArray)
  })
})
