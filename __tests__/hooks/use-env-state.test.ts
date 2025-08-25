import { renderHook, act } from '@testing-library/react'
import { useEnvState } from '@/hooks/use-env-state'
import type { EnvironmentVariable } from '@/types/env-vars'

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

// Mock the mock data import
jest.mock('@/mock/env-variables', () => ({
  mockEnvVariables: []
}))

beforeEach(() => {
  localStorage.clear()
})

const mockVariable: Omit<EnvironmentVariable, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'TEST_VAR',
  values: {
    development: 'dev-value',
    preview: 'preview-value'
  },
  isSecret: false,
  description: 'Test variable'
}

describe('useEnvState', () => {
  it('should initialize with empty variables array', () => {
    const { result } = renderHook(() => useEnvState())
    
    expect(result.current.variables).toEqual([])
  })

  it('should add a variable correctly', () => {
    const { result } = renderHook(() => useEnvState())
    
    let newVariable: EnvironmentVariable
    act(() => {
      newVariable = result.current.addVariable(mockVariable)
    })
    
    expect(result.current.variables).toHaveLength(1)
    expect(result.current.variables[0]).toMatchObject({
      ...mockVariable,
      id: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    })
    expect(newVariable!).toBeDefined()
    expect(newVariable!.id).toBeTruthy()
  })

  it('should update a variable correctly', () => {
    const { result } = renderHook(() => useEnvState())
    
    let variableId: string
    
    // Add a variable first
    act(() => {
      const newVar = result.current.addVariable(mockVariable)
      variableId = newVar.id
    })
    
    // Update the variable
    act(() => {
      result.current.updateVariable(variableId, {
        name: 'UPDATED_VAR',
        description: 'Updated description'
      })
    })
    
    expect(result.current.variables[0].name).toBe('UPDATED_VAR')
    expect(result.current.variables[0].description).toBe('Updated description')
    expect(result.current.variables[0].updatedAt).toBeTruthy()
  })

  it('should delete a variable correctly', () => {
    const { result } = renderHook(() => useEnvState())
    
    let variableId: string
    
    // Add a variable first
    act(() => {
      const newVar = result.current.addVariable(mockVariable)
      variableId = newVar.id
    })
    
    expect(result.current.variables).toHaveLength(1)
    
    // Delete the variable
    act(() => {
      result.current.deleteVariable(variableId)
    })
    
    expect(result.current.variables).toHaveLength(0)
  })

  it('should delete multiple variables correctly', () => {
    const { result } = renderHook(() => useEnvState())
    
    let variableIds: string[]
    
    // Add multiple variables
    act(() => {
      const var1 = result.current.addVariable({ ...mockVariable, name: 'VAR1' })
      const var2 = result.current.addVariable({ ...mockVariable, name: 'VAR2' })
      const var3 = result.current.addVariable({ ...mockVariable, name: 'VAR3' })
      variableIds = [var1.id, var2.id]
    })
    
    expect(result.current.variables).toHaveLength(3)
    
    // Delete multiple variables
    act(() => {
      result.current.deleteVariables(variableIds)
    })
    
    expect(result.current.variables).toHaveLength(1)
    expect(result.current.variables[0].name).toBe('VAR3')
  })

  it('should get variables by environment correctly', () => {
    const { result } = renderHook(() => useEnvState())
    
    // Add variables with different environment configurations
    act(() => {
      result.current.addVariable({
        name: 'DEV_ONLY',
        values: { development: 'dev-value' },
        isSecret: false
      })
      result.current.addVariable({
        name: 'PROD_ONLY',
        values: { production: 'prod-value' },
        isSecret: false
      })
      result.current.addVariable({
        name: 'DEV_AND_PROD',
        values: { development: 'dev-value', production: 'prod-value' },
        isSecret: false
      })
    })
    
    const devVars = result.current.getVariablesByEnvironment('development')
    const prodVars = result.current.getVariablesByEnvironment('production')
    const previewVars = result.current.getVariablesByEnvironment('preview')
    
    expect(devVars).toHaveLength(2)
    expect(devVars.map(v => v.name)).toEqual(['DEV_ONLY', 'DEV_AND_PROD'])
    
    expect(prodVars).toHaveLength(2)
    expect(prodVars.map(v => v.name)).toEqual(['PROD_ONLY', 'DEV_AND_PROD'])
    
    expect(previewVars).toHaveLength(0)
  })

  it('should perform bulk updates correctly', () => {
    const { result } = renderHook(() => useEnvState())
    
    let variableIds: string[]
    
    // Add multiple variables
    act(() => {
      const var1 = result.current.addVariable({ ...mockVariable, name: 'VAR1' })
      const var2 = result.current.addVariable({ ...mockVariable, name: 'VAR2' })
      variableIds = [var1.id, var2.id]
    })
    
    // Perform bulk update
    act(() => {
      result.current.bulkUpdate([
        { id: variableIds[0], updates: { description: 'Bulk updated 1' } },
        { id: variableIds[1], updates: { description: 'Bulk updated 2', isSecret: true } }
      ])
    })
    
    expect(result.current.variables[0].description).toBe('Bulk updated 1')
    expect(result.current.variables[1].description).toBe('Bulk updated 2')
    expect(result.current.variables[1].isSecret).toBe(true)
  })

  it('should clear all variables correctly', () => {
    const { result } = renderHook(() => useEnvState())
    
    // Add some variables
    act(() => {
      result.current.addVariable({ ...mockVariable, name: 'VAR1' })
      result.current.addVariable({ ...mockVariable, name: 'VAR2' })
    })
    
    expect(result.current.variables).toHaveLength(2)
    
    // Clear all variables
    act(() => {
      result.current.clearVariables()
    })
    
    expect(result.current.variables).toHaveLength(0)
  })

  it('should persist state to localStorage', () => {
    const { result } = renderHook(() => useEnvState())
    
    act(() => {
      result.current.addVariable(mockVariable)
    })
    
    // Create a new hook instance to test persistence
    const { result: result2 } = renderHook(() => useEnvState())
    
    expect(result2.current.variables).toHaveLength(1)
    expect(result2.current.variables[0].name).toBe('TEST_VAR')
  })

  it('should handle non-existent variable updates gracefully', () => {
    const { result } = renderHook(() => useEnvState())
    
    act(() => {
      result.current.updateVariable('non-existent-id', { name: 'UPDATED' })
    })
    
    // Should not crash and variables should remain empty
    expect(result.current.variables).toHaveLength(0)
  })

  it('should handle non-existent variable deletion gracefully', () => {
    const { result } = renderHook(() => useEnvState())
    
    act(() => {
      result.current.deleteVariable('non-existent-id')
    })
    
    // Should not crash and variables should remain empty
    expect(result.current.variables).toHaveLength(0)
  })
})