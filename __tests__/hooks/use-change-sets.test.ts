import { renderHook, act } from '@testing-library/react'
import { useChangeSets } from '@/hooks/use-change-sets'
import type { Change, ChangeSet, Environment } from '@/types/env-vars'

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

// Mock the mock data import
jest.mock('@/mock/change-sets', () => ({
  mockChangeSets: []
}))

const mockChange: Omit<Change, 'id'> = {
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

describe('useChangeSets', () => {
  it('should initialize with empty change sets array', () => {
    const { result } = renderHook(() => useChangeSets())
    
    expect(result.current.changeSets).toEqual([])
  })

  it('should create a new change set correctly', () => {
    const { result } = renderHook(() => useChangeSets())
    
    let newChangeSet: ChangeSet
    act(() => {
      newChangeSet = result.current.createChangeSet('Test Change Set', 'Test description')
    })
    
    expect(result.current.changeSets).toHaveLength(1)
    expect(result.current.changeSets[0]).toMatchObject({
      name: 'Test Change Set',
      description: 'Test description',
      changes: [],
      environments: ['development'],
      status: 'draft',
      id: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    })
    expect(newChangeSet!).toBeDefined()
  })

  it('should add change to existing change set correctly', () => {
    const { result } = renderHook(() => useChangeSets())
    
    let changeSetId: string
    
    // Create change set first
    act(() => {
      const changeSet = result.current.createChangeSet('Test Change Set')
      changeSetId = changeSet.id
    })
    
    // Add change to the set
    act(() => {
      result.current.addChangeToSet(changeSetId, mockChange)
    })
    
    const changeSet = result.current.changeSets[0]
    expect(changeSet.changes).toHaveLength(1)
    expect(changeSet.changes[0]).toMatchObject({
      ...mockChange,
      id: expect.any(String)
    })
  })

  it('should remove change from change set correctly', () => {
    const { result } = renderHook(() => useChangeSets())
    
    let changeSetId: string
    let changeId: string
    
    // Create change set and add change
    act(() => {
      const changeSet = result.current.createChangeSet('Test Change Set')
      changeSetId = changeSet.id
      const change = result.current.addChangeToSet(changeSetId, mockChange)
      changeId = change.id
    })
    
    expect(result.current.changeSets[0].changes).toHaveLength(1)
    
    // Remove the change
    act(() => {
      result.current.removeChangeFromSet(changeSetId, changeId)
    })
    
    expect(result.current.changeSets[0].changes).toHaveLength(0)
  })

  it('should update change set environments correctly', () => {
    const { result } = renderHook(() => useChangeSets())
    
    let changeSetId: string
    const newEnvironments: Environment[] = ['development', 'production']
    
    // Create change set first
    act(() => {
      const changeSet = result.current.createChangeSet('Test Change Set')
      changeSetId = changeSet.id
    })
    
    // Update environments
    act(() => {
      result.current.updateChangeSetEnvironments(changeSetId, newEnvironments)
    })
    
    expect(result.current.changeSets[0].environments).toEqual(newEnvironments)
  })

  it('should apply change set correctly', () => {
    const { result } = renderHook(() => useChangeSets())
    
    let changeSetId: string
    
    // Create change set first
    act(() => {
      const changeSet = result.current.createChangeSet('Test Change Set')
      changeSetId = changeSet.id
    })
    
    // Apply the change set
    act(() => {
      result.current.applyChangeSet(changeSetId)
    })
    
    const changeSet = result.current.changeSets[0]
    expect(changeSet.status).toBe('applied')
    expect(changeSet.appliedAt).toBeTruthy()
  })

  it('should delete change set correctly', () => {
    const { result } = renderHook(() => useChangeSets())
    
    let changeSetId: string
    
    // Create change set first
    act(() => {
      const changeSet = result.current.createChangeSet('Test Change Set')
      changeSetId = changeSet.id
    })
    
    expect(result.current.changeSets).toHaveLength(1)
    
    // Delete the change set
    act(() => {
      result.current.deleteChangeSet(changeSetId)
    })
    
    expect(result.current.changeSets).toHaveLength(0)
  })

  it('should get current change set correctly', () => {
    const { result } = renderHook(() => useChangeSets())
    
    // Should return null when no draft change sets exist
    expect(result.current.getCurrentChangeSet()).toBeNull()
    
    // Create a draft change set
    act(() => {
      result.current.createChangeSet('Draft Change Set')
    })
    
    const currentChangeSet = result.current.getCurrentChangeSet()
    expect(currentChangeSet).toBeTruthy()
    expect(currentChangeSet!.status).toBe('draft')
    expect(currentChangeSet!.name).toBe('Draft Change Set')
  })

  it('should get or create current change set correctly', () => {
    const { result } = renderHook(() => useChangeSets())
    
    // Should create a new change set when none exists
    let currentChangeSet: ChangeSet
    act(() => {
      currentChangeSet = result.current.getOrCreateCurrentChangeSet()
    })
    
    expect(currentChangeSet!).toBeTruthy()
    expect(currentChangeSet!.status).toBe('draft')
    expect(result.current.changeSets).toHaveLength(1)
    
    // Should return existing draft change set
    let sameChangeSet: ChangeSet
    act(() => {
      sameChangeSet = result.current.getOrCreateCurrentChangeSet()
    })
    
    expect(sameChangeSet!.id).toBe(currentChangeSet!.id)
    expect(result.current.changeSets).toHaveLength(1) // Should not create a new one
  })

  it('should add change to current change set correctly', () => {
    const { result } = renderHook(() => useChangeSets())
    
    // Add change (should create change set automatically)
    let addedChange: Change
    act(() => {
      addedChange = result.current.addChange(mockChange)
    })
    
    expect(result.current.changeSets).toHaveLength(1)
    expect(result.current.changeSets[0].changes).toHaveLength(1)
    expect(result.current.changeSets[0].changes[0].id).toBe(addedChange!.id)
  })

  it('should clear change sets correctly', () => {
    const { result } = renderHook(() => useChangeSets())
    
    // Create some change sets
    act(() => {
      result.current.createChangeSet('Change Set 1')
      result.current.createChangeSet('Change Set 2')
    })
    
    expect(result.current.changeSets).toHaveLength(2)
    
    // Clear all change sets
    act(() => {
      result.current.clearChangeSets()
    })
    
    expect(result.current.changeSets).toHaveLength(0)
  })

  it('should handle multiple change sets with different statuses', () => {
    const { result } = renderHook(() => useChangeSets())
    
    let draftId: string
    let appliedId: string
    
    // Create multiple change sets
    act(() => {
      const draft = result.current.createChangeSet('Draft Set')
      const applied = result.current.createChangeSet('Applied Set')
      draftId = draft.id
      appliedId = applied.id
      
      // Apply one of them
      result.current.applyChangeSet(appliedId)
    })
    
    expect(result.current.changeSets).toHaveLength(2)
    
    // getCurrentChangeSet should return the draft one
    const currentChangeSet = result.current.getCurrentChangeSet()
    expect(currentChangeSet!.id).toBe(draftId)
    expect(currentChangeSet!.status).toBe('draft')
  })

  it('should preserve order when adding changes', () => {
    const { result } = renderHook(() => useChangeSets())
    
    let changeSetId: string
    
    // Create change set
    act(() => {
      const changeSet = result.current.createChangeSet('Test Set')
      changeSetId = changeSet.id
    })
    
    // Add multiple changes
    act(() => {
      result.current.addChangeToSet(changeSetId, { ...mockChange, name: 'CHANGE_1' })
      result.current.addChangeToSet(changeSetId, { ...mockChange, name: 'CHANGE_2' })
      result.current.addChangeToSet(changeSetId, { ...mockChange, name: 'CHANGE_3' })
    })
    
    const changes = result.current.changeSets[0].changes
    expect(changes).toHaveLength(3)
    expect(changes.map(c => c.name)).toEqual(['CHANGE_1', 'CHANGE_2', 'CHANGE_3'])
  })
})