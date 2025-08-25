import { renderHook, act } from '@testing-library/react'
import { useEnvHistory } from '@/hooks/use-env-history'
import type { Change } from '@/types/env-vars'

const mockChange: Change = {
  id: '1',
  varId: 'var-1',
  name: 'TEST_VAR',
  action: 'create',
  environments: ['development'],
  values: {
    development: { after: 'test-value' }
  },
  isSecret: false,
  description: 'Test change'
}

describe('useEnvHistory', () => {
  it('should initialize with empty history', () => {
    const { result } = renderHook(() => useEnvHistory())
    
    expect(result.current.history).toEqual([])
  })

  it('should add history entry correctly', () => {
    const { result } = renderHook(() => useEnvHistory())
    
    act(() => {
      result.current.addHistoryEntry(
        'variable_created',
        'Created TEST_VAR',
        [mockChange],
        { variables: [] }
      )
    })
    
    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0]).toMatchObject({
      id: expect.any(String),
      timestamp: expect.any(String),
      action: 'variable_created',
      description: 'Created TEST_VAR',
      changes: [mockChange],
      variablesSnapshot: { variables: [] }
    })
  })

  it('should limit history to 50 entries', () => {
    const { result } = renderHook(() => useEnvHistory())
    
    // Add 52 entries
    act(() => {
      for (let i = 0; i < 52; i++) {
        result.current.addHistoryEntry(
          'variable_created',
          `Entry ${i}`,
          [mockChange]
        )
      }
    })
    
    expect(result.current.history).toHaveLength(50)
    expect(result.current.history[0].description).toBe('Entry 51') // Most recent first
    expect(result.current.history[49].description).toBe('Entry 2') // Oldest kept
  })

  it('should get commit history with simplified format', () => {
    const { result } = renderHook(() => useEnvHistory())
    
    act(() => {
      result.current.addHistoryEntry(
        'variable_created',
        'Created TEST_VAR',
        [mockChange, { ...mockChange, id: '2' }]
      )
    })
    
    const commitHistory = result.current.getCommitHistory()
    
    expect(commitHistory).toHaveLength(1)
    expect(commitHistory[0]).toMatchObject({
      id: expect.any(String),
      timestamp: expect.any(String),
      message: 'Created TEST_VAR',
      action: 'variable_created',
      changesCount: 2
    })
  })

  it('should get commit details by id', () => {
    const { result } = renderHook(() => useEnvHistory())
    
    let commitId: string
    
    act(() => {
      result.current.addHistoryEntry(
        'variable_created',
        'Created TEST_VAR',
        [mockChange]
      )
      commitId = result.current.history[0].id
    })
    
    const commitDetails = result.current.getCommitDetails(commitId)
    
    expect(commitDetails).toBeTruthy()
    expect(commitDetails!.id).toBe(commitId)
    expect(commitDetails!.description).toBe('Created TEST_VAR')
    expect(commitDetails!.changes).toEqual([mockChange])
  })

  it('should return undefined for non-existent commit id', () => {
    const { result } = renderHook(() => useEnvHistory())
    
    const commitDetails = result.current.getCommitDetails('non-existent-id')
    
    expect(commitDetails).toBeUndefined()
  })

  it('should check if time travel is possible', () => {
    const { result } = renderHook(() => useEnvHistory())
    
    let commitWithSnapshot: string
    let commitWithoutSnapshot: string
    
    act(() => {
      result.current.addHistoryEntry(
        'variable_created',
        'Entry with snapshot',
        [mockChange],
        { variables: [] }
      )
      commitWithSnapshot = result.current.history[0].id
      
      result.current.addHistoryEntry(
        'variable_created',
        'Entry without snapshot',
        [mockChange]
      )
      commitWithoutSnapshot = result.current.history[0].id
    })
    
    expect(result.current.canTimeTravel(commitWithSnapshot)).toBe(true)
    expect(result.current.canTimeTravel(commitWithoutSnapshot)).toBe(false)
    expect(result.current.canTimeTravel('non-existent')).toBe(false)
  })

  it('should clear history correctly', () => {
    const { result } = renderHook(() => useEnvHistory())
    
    // Add some history entries
    act(() => {
      result.current.addHistoryEntry('variable_created', 'Entry 1', [mockChange])
      result.current.addHistoryEntry('variable_updated', 'Entry 2', [mockChange])
    })
    
    expect(result.current.history).toHaveLength(2)
    
    // Clear history
    act(() => {
      result.current.clearHistory()
    })
    
    expect(result.current.history).toEqual([])
  })

  it('should maintain chronological order (newest first)', () => {
    const { result } = renderHook(() => useEnvHistory())
    
    act(() => {
      result.current.addHistoryEntry('variable_created', 'First entry', [mockChange])
    })
    
    // Wait a bit to ensure different timestamps
    act(() => {
      jest.advanceTimersByTime(100)
      result.current.addHistoryEntry('variable_updated', 'Second entry', [mockChange])
    })
    
    expect(result.current.history).toHaveLength(2)
    expect(result.current.history[0].description).toBe('Second entry')
    expect(result.current.history[1].description).toBe('First entry')
  })

  it('should handle different action types', () => {
    const { result } = renderHook(() => useEnvHistory())
    
    act(() => {
      result.current.addHistoryEntry('variable_created', 'Created', [mockChange])
      result.current.addHistoryEntry('variable_updated', 'Updated', [mockChange])
      result.current.addHistoryEntry('variable_deleted', 'Deleted', [mockChange])
      result.current.addHistoryEntry('bulk_operation', 'Bulk op', [mockChange])
    })
    
    expect(result.current.history).toHaveLength(4)
    expect(result.current.history.map(h => h.action)).toEqual([
      'bulk_operation',
      'variable_deleted',
      'variable_updated',
      'variable_created'
    ])
  })

  it('should persist history to localStorage', () => {
    const { result } = renderHook(() => useEnvHistory())
    
    act(() => {
      result.current.addHistoryEntry(
        'variable_created',
        'Created TEST_VAR',
        [mockChange]
      )
    })
    
    // Create a new hook instance to test persistence
    const { result: result2 } = renderHook(() => useEnvHistory())
    
    expect(result2.current.history).toHaveLength(1)
    expect(result2.current.history[0].description).toBe('Created TEST_VAR')
  })

  it('should handle empty changes array', () => {
    const { result } = renderHook(() => useEnvHistory())
    
    act(() => {
      result.current.addHistoryEntry(
        'bulk_operation',
        'No changes made',
        []
      )
    })
    
    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].changes).toEqual([])
    
    const commitHistory = result.current.getCommitHistory()
    expect(commitHistory[0].changesCount).toBe(0)
  })

  it('should generate unique IDs for each entry', () => {
    const { result } = renderHook(() => useEnvHistory())
    
    act(() => {
      result.current.addHistoryEntry('variable_created', 'Entry 1', [mockChange])
      result.current.addHistoryEntry('variable_created', 'Entry 2', [mockChange])
    })
    
    const ids = result.current.history.map(h => h.id)
    expect(ids[0]).not.toBe(ids[1])
    expect(ids[0]).toBeTruthy()
    expect(ids[1]).toBeTruthy()
  })
})
