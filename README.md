# Environment Variables UI

A powerful, user-friendly interface for managing environment variables across Development, Preview, and Production environments with a change-sets approach for safe deployments.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/adeel-imran/v0-environment-variables-ui)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)

## 🚀 Features

### Core Functionality
- **Multi-Environment Management**: Seamlessly manage variables across Development, Preview, and Production environments
- **Change-Sets Workflow**: Review and apply changes safely using Git-like change-sets
- **Secret Management**: Secure handling of sensitive variables with masked display
- **Bulk Operations**: Import/export variables in JSON or key-value format
- **Real-time Search & Filtering**: Advanced search with environment and secret filters
- **Interactive Walkthrough**: Guided tour for new users

### User Interface
- **Modern Design**: Clean, professional interface with dark/light mode support
- **Responsive Layout**: Optimized for desktop and tablet use
- **Smooth Animations**: Subtle Framer Motion animations for enhanced UX
- **Intuitive Controls**: Drag & drop, keyboard shortcuts, and contextual menus

### Safety Features
- **Conflict Detection**: Automatically detect and resolve conflicts
- **Change Preview**: Review all modifications before applying
- **Rollback Support**: Safely revert changes if needed
- **Audit Trail**: Track all variable changes with timestamps

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth interactions
- **State Management**: Zustand for global state
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Lucide React
- **Storage**: Local storage with sync capabilities

## 📋 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/adeelibr/environment-variables-ui-concept.git
   cd environment-variables-ui-concept
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## 🎯 Usage Guide

### Managing Variables

1. **Add New Variable**
   - Click the "Add Variable" button
   - Enter variable name (e.g., `API_KEY`)
   - Set values for desired environments
   - Mark as secret if needed
   - Submit to add to change-set

2. **Edit Existing Variables**
   - Click any variable card or use the edit button
   - Modify values in the quick-edit panel
   - Changes are automatically added to the current change-set

3. **Bulk Operations**
   - Use "Bulk Import" to upload multiple variables
   - Supports JSON and key-value formats
   - Export current variables for backup or migration

### Change-Sets Workflow

1. **Create Change-Set**
   - Changes are automatically grouped into change-sets
   - Review all pending modifications in the drawer

2. **Review Changes**
   - Click "Review Changes" to see diff view
   - Resolve any conflicts highlighted in red
   - Preview the impact on each environment

3. **Apply Changes**
   - Once reviewed, click "Apply" to make changes live
   - Changes are applied atomically across all environments

### Search & Filter

- **Search**: Type in the search bar to filter variables by name
- **Environment Filter**: Toggle environments to show only relevant variables
- **Secret Filter**: Show only secret variables when needed
- **Sort Options**: Sort by name, creation date, or update time

## 🔧 Configuration

### Environment Setup

The application supports three standard environments:

- **Development**: For local development and testing
- **Preview**: For staging and pre-production testing  
- **Production**: For live production applications

### Customization

Key configuration files:
- `lib/constants.ts` - Environment definitions and labels
- `app/globals.css` - Theme colors and animations
- `types/env-vars.ts` - TypeScript type definitions

## 🎨 Theme Customization

The application supports both light and dark themes. Customize colors in:

```css
/* app/globals.css */
:root {
  --primary: /* Your primary color */
  --background: /* Background color */
  --foreground: /* Text color */
  /* ... more variables */
}
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTIONS.md](CONTRIBUTIONS.md) for detailed guidelines.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Deploy automatically on every push
3. Environment variables are managed through Vercel dashboard

### Other Platforms

The application can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify  
- Railway
- Heroku

## 📊 Browser Support

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

## 🔍 Troubleshooting

### Common Issues

**Build Errors**: 
- Ensure Node.js 18+ is installed
- Clear cache: `npm run clean` (if available)
- Reinstall dependencies: `rm -rf node_modules && npm install`

**Animation Issues**:
- Check Framer Motion compatibility
- Verify browser support for CSS animations

**State Persistence**:
- Check browser local storage limits
- Clear application data if corrupted

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

---

**Live Demo**: [https://vercel.com/adeel-imran/v0-environment-variables-ui](https://vercel.com/adeel-imran/v0-environment-variables-ui)

Built with ❤️ using [v0.app](https://v0.app) and enhanced with modern tooling.