# 🎯 Cursor AI Assistant Guide for Micro-Frontend Golden Sample

This directory contains comprehensive guidance files to help you build the micro-frontend golden sample using Cursor AI assistant effectively.

## 📁 File Structure

```
.cursor/
├── README.md                    # This file - overview and usage guide
├── prompts/                     # Step-by-step implementation prompts
│   ├── 01-setup-container.md    # Container app setup instructions
│   ├── 02-setup-auth-remote.md  # Auth remote app setup
│   ├── 03-setup-dashboard-remote.md # Dashboard remote app setup
│   ├── 04-setup-profile-remote.md   # Profile remote app setup
│   └── 05-integration-testing.md    # Integration and testing phase
├── templates/                   # Code templates and boilerplate
│   ├── webpack.config.template.js   # Webpack Module Federation config
│   ├── ErrorBoundary.template.tsx   # Error boundary component
│   ├── RemoteComponent.template.tsx # Remote component wrapper
│   ├── package.json.template        # Package.json template
│   └── types.template.ts            # TypeScript definitions
├── validation-checklist.md     # Comprehensive validation guide
└── .cursorrules                 # Project-specific AI assistant rules
```

## 🚀 How to Use This Guide

### Step 1: Read the Rules
Start by reviewing `.cursorrules` to understand the project standards and best practices.

### Step 2: Follow the Prompts
Use the prompts in the `prompts/` directory in order:

1. **Phase 1**: Setup Container (`01-setup-container.md`)
2. **Phase 2**: Setup Auth Remote (`02-setup-auth-remote.md`)
3. **Phase 3**: Setup Dashboard Remote (`03-setup-dashboard-remote.md`)
4. **Phase 4**: Setup Profile Remote (`04-setup-profile-remote.md`)
5. **Phase 5**: Integration Testing (`05-integration-testing.md`)

### Step 3: Use Templates
Reference the templates in `templates/` directory for consistent code structure:

- Copy and customize `webpack.config.template.js` for each app
- Use `ErrorBoundary.template.tsx` for robust error handling
- Implement `RemoteComponent.template.tsx` for remote loading
- Follow `types.template.ts` for TypeScript definitions

### Step 4: Validate Your Work
Use `validation-checklist.md` to ensure each phase is completed correctly before moving to the next.

## 🎯 Prompting Best Practices

### Effective Prompts
```
✅ GOOD: "Create a React TypeScript container application for micro-frontend architecture using the template in .cursor/templates/webpack.config.template.js. Follow the requirements in .cursor/prompts/01-setup-container.md"

❌ BAD: "Make a React app"
```

### Include Context
Always reference the relevant files:
- Mention the phase you're working on
- Reference the specific template files
- Include validation requirements
- Specify the exact ports and configurations

### Example Prompt Structure
```
I'm working on Phase 2 of the micro-frontend golden sample. 

Please create the Auth remote application following the requirements in .cursor/prompts/02-setup-auth-remote.md.

Use the templates from .cursor/templates/ and ensure:
- Webpack config matches the template
- Error boundaries are implemented
- TypeScript types are properly defined
- All validation checklist items can be completed

Configure for port 3001 and expose AuthPage component.
```

## 🔍 Validation Workflow

After each phase, use this validation process:

1. **Run the App**: Ensure the app starts without errors
2. **Check Functionality**: Test all features work as expected
3. **Validate Integration**: Test with other apps if applicable
4. **Review Checklist**: Go through the phase-specific checklist
5. **Fix Issues**: Address any problems before proceeding

## 🛠️ Troubleshooting

### Common Issues

**Remote not loading**
- Check if remote app is running
- Verify remoteEntry.js is accessible
- Check webpack configuration

**TypeScript errors**
- Use type definitions from `types.template.ts`
- Add proper module declarations
- Check import/export statements

**Build failures**
- Verify all dependencies are installed
- Check webpack configuration syntax
- Ensure shared dependencies match

### Getting Help

When asking for help, include:
- Which phase you're working on
- The specific error message
- What you've already tried
- Relevant code snippets

Example:
```
I'm on Phase 2 (Auth Remote) and getting this error: [error message]

I've checked:
- Auth app is running on port 3001
- remoteEntry.js is accessible
- Webpack config matches template

Here's my current webpack.config.js: [code]

Please help me resolve this following the validation checklist in .cursor/validation-checklist.md
```

## 📊 Success Metrics

Your implementation is successful when:

- [ ] All apps start without errors
- [ ] Navigation between routes works smoothly
- [ ] Remote apps load within the container
- [ ] Error boundaries handle failures gracefully
- [ ] All validation checklists pass
- [ ] Performance metrics meet targets
- [ ] TypeScript compilation succeeds
- [ ] Tests pass (unit, integration, E2E)

## 🎓 Learning Objectives

By following this guide, you'll learn:

1. **Micro-Frontend Architecture**: Understanding the concepts and benefits
2. **Webpack Module Federation**: Configuring and using Module Federation
3. **React Integration**: Building React apps that work together
4. **Error Handling**: Implementing robust error boundaries
5. **Performance Optimization**: Optimizing bundle sizes and loading
6. **Testing Strategies**: Unit, integration, and E2E testing
7. **Development Workflow**: Managing multiple applications
8. **Production Deployment**: Preparing for production deployment

## 🔄 Iterative Development

This guide supports iterative development:

1. **Start Simple**: Begin with basic functionality
2. **Add Features**: Gradually add more complex features
3. **Optimize**: Improve performance and user experience
4. **Scale**: Add more micro-frontends as needed

## 📝 Documentation Standards

When working on this project:

- Document all configuration decisions
- Add comments to complex webpack configurations
- Create README files for each application
- Document API contracts between apps
- Keep validation checklists updated

## 🤝 Contributing

If you find issues with this guide:

1. Document the problem clearly
2. Suggest improvements
3. Test your changes thoroughly
4. Update relevant checklists and templates

---

**Happy coding! 🚀**

This guide will help you build a production-ready micro-frontend architecture that's scalable, maintainable, and follows industry best practices.
