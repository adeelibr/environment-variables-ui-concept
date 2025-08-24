# Contributing to Environment Variables UI

Thank you for your interest in contributing to the Environment Variables UI! This document provides guidelines and information for contributors.

## 🤝 Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn package manager
- Git knowledge
- TypeScript familiarity
- React/Next.js experience

### Development Setup

1. **Fork the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/environment-variables-ui-concept.git
   cd environment-variables-ui-concept
   ```

2. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build and Test**
   ```bash
   npm run build
   npm run lint
   ```

## 📋 Contribution Guidelines

### Code Style

- **TypeScript**: All new code must be written in TypeScript
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Code formatting will be handled automatically
- **Naming Conventions**:
  - Components: PascalCase (`MyComponent`)
  - Files: kebab-case (`my-component.tsx`)
  - Functions: camelCase (`myFunction`)
  - Constants: UPPER_SNAKE_CASE (`MY_CONSTANT`)

### Project Structure

```
├── app/                    # Next.js app router
├── components/
│   ├── ui/                # Base UI components
│   ├── common/            # Shared business components
│   ├── env-vars/          # Environment variable specific components
│   └── change-sets/       # Change-set related components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and constants
├── types/                 # TypeScript type definitions
└── mock/                  # Mock data for development
```

### Component Guidelines

1. **File Organization**
   - One component per file
   - Use meaningful file and component names
   - Include TypeScript interfaces for props

2. **Component Structure**
   ```tsx
   "use client"
   
   import { useState } from "react"
   import { motion } from "framer-motion"
   // ... other imports
   
   interface MyComponentProps {
     // Define props with clear types
     title: string
     isVisible?: boolean
     onClose: () => void
   }
   
   export function MyComponent({ title, isVisible = true, onClose }: MyComponentProps) {
     // Component logic
   }
   ```

3. **Animation Guidelines**
   - Use Framer Motion for animations
   - Keep animations subtle and purposeful
   - Use consistent timing values (damping: 25, stiffness: 300)
   - Provide `AnimatePresence` for enter/exit animations

### State Management

- **Local State**: Use `useState` for component-specific state
- **Global State**: Use Zustand stores for shared application state
- **Server State**: Use appropriate data fetching patterns
- **Form State**: Use controlled components with clear validation

### Common Utilities

When adding new functionality, check if common utilities exist:

- `lib/constants.ts` - Environment definitions and configurations  
- `lib/common-utils.ts` - Shared validation and transformation functions
- `lib/utils.ts` - General utility functions (className merging, etc.)

## 🎯 Types of Contributions

### 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear Description**: What happened vs. what you expected
2. **Steps to Reproduce**: Detailed steps to recreate the issue
3. **Environment Information**: 
   - Browser version
   - Operating system
   - Node.js version
4. **Screenshots**: If applicable
5. **Error Messages**: Console logs or error traces

**Bug Report Template:**
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to...
2. Click on...
3. Scroll down to...
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- Browser: Chrome 120.0
- OS: macOS 14.0
- Node.js: 18.17.0
```

### ✨ Feature Requests

For new features, please provide:

1. **Use Case**: Why is this feature needed?
2. **Proposed Solution**: How should it work?
3. **Alternative Solutions**: Other approaches you considered
4. **Additional Context**: Screenshots, mockups, or examples

### 🔧 Code Contributions

#### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, documented code
   - Follow existing patterns and conventions
   - Add TypeScript types for all new code

3. **Test Changes**
   ```bash
   npm run build
   npm run lint
   ```

4. **Commit Changes**
   ```bash
   git commit -m "feat: add new environment validation feature"
   ```

   Use conventional commit messages:
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `style:` - Code style changes
   - `refactor:` - Code refactoring
   - `test:` - Test additions
   - `chore:` - Build process or auxiliary tool changes

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

#### Pull Request Guidelines

- **Title**: Use descriptive titles following conventional commit format
- **Description**: Explain what changes were made and why
- **Testing**: Describe how the changes were tested
- **Screenshots**: Include before/after screenshots for UI changes
- **Breaking Changes**: Clearly mark any breaking changes

**PR Template:**
```markdown
## What Changed
Brief description of changes

## Why
Explanation of motivation and context

## How to Test
Step-by-step testing instructions

## Screenshots
Before/after images (if applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Changes tested locally
- [ ] Documentation updated (if needed)
```

## 🎨 Design Guidelines

### Visual Design

- **Colors**: Use CSS variables defined in `app/globals.css`
- **Typography**: Follow existing font sizes and weights
- **Spacing**: Use Tailwind spacing utilities consistently
- **Components**: Leverage existing UI components from `components/ui/`

### User Experience

- **Accessibility**: Ensure components are accessible (keyboard navigation, ARIA labels)
- **Responsiveness**: Test on different screen sizes
- **Performance**: Minimize re-renders and optimize animations
- **Feedback**: Provide clear feedback for user actions

### Animation Principles

- **Subtle**: Animations should enhance, not distract
- **Consistent**: Use similar timing and easing throughout
- **Purposeful**: Every animation should serve a UX purpose
- **Performance**: Use transform and opacity when possible

## 🧪 Testing

Currently, the project doesn't have a test suite, but we encourage:

1. **Manual Testing**: Thoroughly test your changes
2. **Edge Cases**: Consider error states and boundary conditions  
3. **Cross-browser**: Test in different browsers when possible
4. **Responsive**: Verify mobile and tablet layouts

## 📖 Documentation

### Code Documentation

- **Complex Logic**: Add comments explaining the "why"
- **Interfaces**: Document TypeScript interfaces with JSDoc
- **Functions**: Provide clear parameter and return descriptions

```tsx
/**
 * Validates environment variable name format
 * @param name - Variable name to validate
 * @returns Object with validation result and error message
 */
export function validateVariableName(name: string): ValidationResult {
  // Implementation
}
```

### README Updates

When adding new features, update:
- Feature list in README.md
- Usage instructions
- Configuration options
- Troubleshooting section (if applicable)

## 🚀 Release Process

### Version Management

The project follows semantic versioning:
- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backwards compatible  
- **Patch** (0.0.1): Bug fixes

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped appropriately
- [ ] Breaking changes documented

## ❓ Questions and Support

### Getting Help

- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Code Review**: Tag maintainers for complex changes

### Communication

- Be respectful and constructive
- Provide context for your questions
- Share relevant code snippets or screenshots
- Be patient with response times

## 📜 License

By contributing to this project, you agree that your contributions will be licensed under the same MIT License that covers the project.

## 🙏 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Special mention for first-time contributors

---

Thank you for contributing to Environment Variables UI! Every contribution, no matter how small, helps make this project better for everyone. 🎉