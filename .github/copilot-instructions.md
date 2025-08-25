# GitHub Copilot Instructions

This document provides context and guidelines for GitHub Copilot when working with the Environment Variables UI project.

## Project Overview

This is a Next.js 15 React application for managing environment variables across Development, Preview, and Production environments using a change-sets workflow. The application emphasizes safety, user experience, and professional developer tools.

## Architecture & Technology Stack

### Frontend Framework
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Radix UI** primitives for base components

### State Management
- **Zustand** for global state management
- **Local Storage** for data persistence
- **React hooks** for component state

### Package Management
- **PNPM** is the required package manager for this project
- Always use `pnpm install` instead of `npm install` or `yarn`
- When adding dependencies, update pnpm-lock.yaml with `pnpm install --no-frozen-lockfile`
- CI/CD uses frozen lockfile, so ensure pnpm-lock.yaml is always up to date

### Code Style & Patterns
- **TypeScript** - All code is strongly typed
- **Functional Components** - Use function declarations with proper typing
- **Custom Hooks** - Extract reusable logic into hooks
- **Common Utilities** - Use shared functions from `lib/` directory

## Key Concepts & Domain Logic

### Environment Management
- Three standard environments: `development`, `preview`, `production`
- Variables can exist in any combination of environments
- Secret variables are masked in UI but stored as plain text
- Use `ENVIRONMENT_CONFIG` from `lib/constants.ts` for consistent environment handling

### Change-Sets Workflow
- All modifications go through change-sets (like Git commits)
- Changes must be reviewed before applying
- Conflict detection prevents overlapping modifications
- Atomic application across all environments

### Component Architecture
\`\`\`
components/
├── ui/           # Base Radix UI components with custom styling
├── common/       # Reusable business logic components
├── env-vars/     # Environment variable specific features
└── change-sets/  # Change-set workflow components
\`\`\`

## Coding Guidelines

### Component Patterns

1. **Always use TypeScript interfaces for props**
\`\`\`tsx
interface MyComponentProps {
  title: string
  isVisible?: boolean
  onAction: (data: SomeType) => void
}

export function MyComponent({ title, isVisible = true, onAction }: MyComponentProps) {
  // Component logic
}
\`\`\`

2. **Use Framer Motion for animations**
\`\`\`tsx
import { motion, AnimatePresence } from "framer-motion"

// For modal/drawer entries
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
>

// For slide-in panels  
<motion.div
  initial={{ x: "100%" }}
  animate={{ x: 0 }}
  exit={{ x: "100%" }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
>
\`\`\`

3. **Use common utilities and constants**
\`\`\`tsx
import { ENVIRONMENT_CONFIG } from "@/lib/constants"
import { validators, copyToClipboard } from "@/lib/common-utils"

// Instead of hardcoding environments
const environments = ENVIRONMENT_CONFIG.map(env => env.key)

// Use shared validation
const nameValidation = validators.variableName(name)
if (!nameValidation.isValid) {
  setErrors([nameValidation.error])
}
\`\`\`

### State Management Patterns

1. **Use custom hooks for complex logic**
\`\`\`tsx
// hooks/use-environment-form.ts
export function useEnvironmentForm(initialData: EnvVar) {
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState<string[]>([])
  
  const handleSubmit = useCallback(() => {
    // Validation and submission logic
  }, [formData])
  
  return { formData, setFormData, errors, handleSubmit }
}
\`\`\`

2. **Leverage existing stores**
\`\`\`tsx
import { useChangeSets } from "@/hooks/use-change-sets"
import { useEnvVariables } from "@/hooks/use-env-variables"

const { addChange, getCurrentChangeSet } = useChangeSets()
const { variables, updateVariable } = useEnvVariables()
\`\`\`

### Form Handling

1. **Use the common EnvironmentInputs component**
\`\`\`tsx
import { EnvironmentInputs } from "@/components/common/environment-inputs"

<EnvironmentInputs
  values={formData.values}
  onChange={handleValueChange}
  isSecret={formData.isSecret}
  showLabels={true}
/>
\`\`\`

2. **Implement proper validation**
\`\`\`tsx
const [errors, setErrors] = useState<string[]>([])

const handleSubmit = () => {
  const newErrors: string[] = []
  
  const nameValidation = validators.variableName(formData.name)
  if (!nameValidation.isValid) {
    newErrors.push(nameValidation.error!)
  }
  
  if (newErrors.length > 0) {
    setErrors(newErrors)
    return
  }
  
  // Process form
}

// Display errors in UI
{errors.length > 0 && (
  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
    <ul className="list-disc list-inside text-sm text-destructive space-y-1">
      {errors.map((error, index) => (
        <li key={index}>{error}</li>
      ))}
    </ul>
  </div>
)}
\`\`\`

## File Organization & Imports

### Import Order
1. React and Next.js imports
2. Third-party libraries (Framer Motion, Radix, etc.)
3. UI components
4. Custom components
5. Hooks
6. Utilities and constants
7. Types

### Path Aliases
- `@/components/*` - Components
- `@/hooks/*` - Custom hooks  
- `@/lib/*` - Utilities and constants
- `@/types/*` - Type definitions
- `@/app/*` - App router pages

## UI/UX Patterns

### Design System
- Use CSS variables defined in `app/globals.css`
- Leverage Tailwind utility classes consistently
- Follow spacing patterns: `space-y-4`, `gap-3`, `p-6`, etc.
- Use semantic color names: `text-foreground`, `bg-card`, `border-border`

### Interactive Elements
- All buttons should have appropriate `variant` and `size` props
- Use loading states for async operations
- Provide immediate feedback for user actions
- Include keyboard accessibility (proper focus management)

### Data Display
- Secret values should be masked by default with reveal option
- Use consistent card layouts for variable display
- Show environment badges to indicate where variables exist
- Implement proper empty states with helpful messaging

## Common Patterns to Follow

### Modal/Drawer Components
\`\`\`tsx
import { AnimatePresence, motion } from "framer-motion"

export function MyModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Modal content */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
\`\`\`

### Form Components
\`\`\`tsx
import { useState } from "react"
import { EnvironmentInputs } from "@/components/common/environment-inputs"
import { validators } from "@/lib/common-utils"

export function MyForm({ onSubmit }: FormProps) {
  const [formData, setFormData] = useState(initialState)
  const [errors, setErrors] = useState<string[]>([])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate using common utilities
    const validation = validators.variableName(formData.name)
    if (!validation.isValid) {
      setErrors([validation.error!])
      return
    }
    
    onSubmit(formData)
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields */}
      <EnvironmentInputs
        values={formData.values}
        onChange={(env, value) => setFormData(prev => ({
          ...prev,
          values: { ...prev.values, [env]: value }
        }))}
        isSecret={formData.isSecret}
      />
    </form>
  )
}
\`\`\`

## Testing Considerations

While the project doesn't have automated tests, when implementing features:

1. **Manual Testing Checklist**
   - Test all user interaction paths
   - Verify form validation edge cases  
   - Check responsive behavior
   - Test keyboard navigation
   - Verify accessibility with screen readers (when possible)

2. **Error Handling**
   - Always handle async operation failures
   - Provide meaningful error messages to users
   - Log errors to console for debugging
   - Implement proper loading states

## Performance Guidelines

1. **React Optimization**
   - Use `useCallback` for event handlers passed as props
   - Implement `useMemo` for expensive calculations
   - Avoid unnecessary re-renders with proper dependency arrays

2. **Animation Performance**
   - Use `transform` and `opacity` for animations
   - Avoid animating layout properties when possible
   - Use `will-change` CSS property sparingly

## Common Pitfalls to Avoid

1. **Environment Hardcoding** - Always use `ENVIRONMENT_CONFIG` instead of hardcoding `["development", "preview", "production"]`

2. **Missing Type Safety** - Don't use `any` types; define proper interfaces

3. **Inconsistent Animation** - Use the established animation patterns with consistent timing

4. **State Management** - Don't duplicate state; leverage existing hooks and stores

5. **Accessibility** - Don't forget ARIA labels, keyboard navigation, and semantic HTML

## Getting Help

When implementing new features:

1. Check existing components for similar patterns
2. Use established utilities from `lib/` directory  
3. Follow the component architecture in `components/`
4. Refer to existing hooks in `hooks/` for state patterns
5. Check the type definitions in `types/` for data structures

This codebase emphasizes consistency, type safety, and user experience. Always prioritize these principles when suggesting or implementing code changes.
