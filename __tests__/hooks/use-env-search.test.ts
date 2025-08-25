import { renderHook, act } from '@testing-library/react'
import { useEnvSearch } from '@/hooks/use-env-search'
import type { EnvironmentVariable } from '@/types/env-vars'

// Mock constants
jest.mock('@/lib/constants', () => ({
  ENVIRONMENTS: ['development', 'preview', 'production']
}))

const mockVariables: EnvironmentVariable[] = [
  {
    id: '1',
    name: 'DATABASE_URL',
    values: {
      development: 'postgresql://localhost:5432/dev',
      preview: 'postgresql://preview.db:5432/preview',
      production: 'postgresql://prod.db:5432/prod'
    },
    isSecret: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
    description: 'Database connection URL'
  },
  {
    id: '2',
    name: 'API_KEY',
    values: {
      development: 'dev-api-key',
      production: 'prod-api-key'
    },
    isSecret: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
    description: 'API key for external service'
  },
  {
    id: '3',
    name: 'DEBUG_MODE',
    values: {
      development: 'true',
      preview: 'false',
      production: 'false'
    },
    isSecret: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T12:00:00Z',
    description: 'Enable debug mode'
  },
  {
    id: '4',
    name: 'PORT',
    values: {
      development: '3000',
      production: '8080'
    },
    isSecret: false,
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z'
  }
]

describe('useEnvSearch', () => {
  it('should initialize with all variables and default filters', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    expect(result.current.filteredVariables).toHaveLength(4)
    expect(result.current.searchQuery).toBe('')
    expect(result.current.selectedEnvironments).toEqual(['development', 'preview', 'production'])
    expect(result.current.showSecretsOnly).toBe(false)
    expect(result.current.sortBy).toBe('name')
    expect(result.current.sortOrder).toBe('asc')
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('should filter variables by search query', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    act(() => {
      result.current.setSearchQuery('DATABASE')
    })
    
    expect(result.current.filteredVariables).toHaveLength(1)
    expect(result.current.filteredVariables[0].name).toBe('DATABASE_URL')
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('should filter variables by description', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    act(() => {
      result.current.setSearchQuery('debug mode')
    })
    
    expect(result.current.filteredVariables).toHaveLength(1)
    expect(result.current.filteredVariables[0].name).toBe('DEBUG_MODE')
  })

  it('should filter variables by value content', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    act(() => {
      result.current.setSearchQuery('postgresql')
    })
    
    expect(result.current.filteredVariables).toHaveLength(1)
    expect(result.current.filteredVariables[0].name).toBe('DATABASE_URL')
  })

  it('should filter by selected environments', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    act(() => {
      result.current.setSelectedEnvironments(['preview'])
    })
    
    // Should only show variables that have values in preview environment
    expect(result.current.filteredVariables).toHaveLength(2)
    const names = result.current.filteredVariables.map(v => v.name)
    expect(names).toContain('DATABASE_URL')
    expect(names).toContain('DEBUG_MODE')
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('should toggle environment selection correctly', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    // Remove development environment
    act(() => {
      result.current.toggleEnvironment('development')
    })
    
    expect(result.current.selectedEnvironments).toEqual(['preview', 'production'])
    expect(result.current.hasActiveFilters).toBe(true)
    
    // Add development back
    act(() => {
      result.current.toggleEnvironment('development')
    })
    
    expect(result.current.selectedEnvironments).toEqual(['preview', 'production', 'development'])
  })

  it('should filter by secrets only', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    act(() => {
      result.current.setShowSecretsOnly(true)
    })
    
    expect(result.current.filteredVariables).toHaveLength(2)
    const names = result.current.filteredVariables.map(v => v.name)
    expect(names).toContain('DATABASE_URL')
    expect(names).toContain('API_KEY')
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('should sort variables by name ascending', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    const names = result.current.filteredVariables.map(v => v.name)
    expect(names).toEqual(['API_KEY', 'DATABASE_URL', 'DEBUG_MODE', 'PORT'])
  })

  it('should sort variables by name descending', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    act(() => {
      result.current.setSortOrder('desc')
    })
    
    const names = result.current.filteredVariables.map(v => v.name)
    expect(names).toEqual(['PORT', 'DEBUG_MODE', 'DATABASE_URL', 'API_KEY'])
  })

  it('should sort variables by created date', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    act(() => {
      result.current.setSortBy('created')
    })
    
    // Should be sorted by createdAt ascending
    const createdDates = result.current.filteredVariables.map(v => v.createdAt)
    expect(createdDates).toEqual([
      '2023-01-01T00:00:00Z',
      '2023-01-01T00:00:00Z', 
      '2023-01-01T00:00:00Z',
      '2023-01-02T00:00:00Z'
    ])
  })

  it('should sort variables by updated date', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    act(() => {
      result.current.setSortBy('updated')
      result.current.setSortOrder('desc')
    })
    
    // Should be sorted by updatedAt descending
    const names = result.current.filteredVariables.map(v => v.name)
    expect(names[0]).toBe('API_KEY') // Most recently updated
  })

  it('should clear all filters correctly', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    // Apply various filters
    act(() => {
      result.current.setSearchQuery('test')
      result.current.setSelectedEnvironments(['development'])
      result.current.setShowSecretsOnly(true)
      result.current.setSortBy('updated')
      result.current.setSortOrder('desc')
    })
    
    expect(result.current.hasActiveFilters).toBe(true)
    
    // Clear all filters
    act(() => {
      result.current.clearFilters()
    })
    
    expect(result.current.searchQuery).toBe('')
    expect(result.current.selectedEnvironments).toEqual(['development', 'preview', 'production'])
    expect(result.current.showSecretsOnly).toBe(false)
    expect(result.current.sortBy).toBe('name')
    expect(result.current.sortOrder).toBe('asc')
    expect(result.current.hasActiveFilters).toBe(false)
    expect(result.current.filteredVariables).toHaveLength(4)
  })

  it('should combine multiple filters correctly', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    act(() => {
      result.current.setSelectedEnvironments(['development', 'production'])
      result.current.setShowSecretsOnly(true)
      result.current.setSearchQuery('API')
    })
    
    expect(result.current.filteredVariables).toHaveLength(1)
    expect(result.current.filteredVariables[0].name).toBe('API_KEY')
  })

  it('should handle empty search results', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    act(() => {
      result.current.setSearchQuery('NONEXISTENT')
    })
    
    expect(result.current.filteredVariables).toHaveLength(0)
  })

  it('should be case insensitive for search', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    act(() => {
      result.current.setSearchQuery('database')
    })
    
    expect(result.current.filteredVariables).toHaveLength(1)
    expect(result.current.filteredVariables[0].name).toBe('DATABASE_URL')
  })

  it('should filter by environment with no values correctly', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    // Set environments to only preview
    act(() => {
      result.current.setSelectedEnvironments(['preview'])
    })
    
    // Should not include API_KEY or PORT as they don't have preview values
    const names = result.current.filteredVariables.map(v => v.name)
    expect(names).not.toContain('API_KEY')
    expect(names).not.toContain('PORT')
  })

  it('should persist filters to localStorage', () => {
    const { result } = renderHook(() => useEnvSearch(mockVariables))
    
    act(() => {
      result.current.setSearchQuery('test query')
      result.current.setShowSecretsOnly(true)
    })
    
    // Create a new hook instance to test persistence
    const { result: result2 } = renderHook(() => useEnvSearch(mockVariables))
    
    expect(result2.current.searchQuery).toBe('test query')
    expect(result2.current.showSecretsOnly).toBe(true)
  })
})
