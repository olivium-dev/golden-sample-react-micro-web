# Phase 2: Setup Auth Remote Application

## Prompt Template
```
Create a React TypeScript remote application for authentication using Webpack Module Federation.

Requirements:
- Use create-react-app with TypeScript template
- Configure Webpack Module Federation as remote
- Expose AuthPage component via "./AuthPage"
- Create login and registration forms
- Implement form validation
- Configure to run on port 3001
- Match shared dependencies with container

Create the following structure:
/auth-app
  /src
    /components
      - LoginForm.tsx
      - RegisterForm.tsx
      - FormInput.tsx
    /pages
      - AuthPage.tsx
    /hooks
      - useAuth.ts
    /types
      - auth.types.ts
    - App.tsx
    - index.tsx
  - webpack.config.js
  - package.json

AuthPage should include:
- Tab navigation between Login/Register
- Form validation with error messages
- Loading states for form submission
- Responsive design
- Accessibility features
```

## Validation Checklist

### After Running the Prompt
- [ ] Auth app project created with TypeScript
- [ ] webpack.config.js configured as Module Federation remote
- [ ] App starts on port 3001 without errors
- [ ] AuthPage component exports properly
- [ ] remoteEntry.js accessible at http://localhost:3001/remoteEntry.js
- [ ] Login and registration forms render correctly
- [ ] Form validation works (required fields, email format, etc.)
- [ ] Tab navigation between login/register works

### Code Quality Checks
- [ ] TypeScript interfaces for all form data and props
- [ ] Form validation provides clear error messages
- [ ] Loading states implemented during form submission
- [ ] Forms are accessible (labels, ARIA attributes, keyboard navigation)
- [ ] Responsive design works on mobile and desktop
- [ ] No console errors or warnings

### Module Federation Specific
- [ ] webpack config exposes "./AuthPage" correctly
- [ ] shared dependencies match container (React, ReactDOM as singletons)
- [ ] Module Federation name is "auth"
- [ ] filename is "remoteEntry.js"
- [ ] App can run independently on port 3001

### Testing Commands
```bash
cd auth-app
npm start  # Should start on port 3001
# Visit http://localhost:3001 - should show auth page
# Visit http://localhost:3001/remoteEntry.js - should download file
# Test forms: validation, submission, tab switching
```

## Expected File Contents

### webpack.config.js
```javascript
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  mode: "development",
  devServer: {
    port: 3001,
    historyApiFallback: true,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "auth",
      filename: "remoteEntry.js",
      exposes: {
        "./AuthPage": "./src/pages/AuthPage",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
  ],
};
```

### AuthPage.tsx Structure
```typescript
import React, { useState } from "react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

type AuthMode = "login" | "register";

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-tabs">
          <button 
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
            aria-selected={mode === "login"}
          >
            Login
          </button>
          <button 
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
            aria-selected={mode === "register"}
          >
            Register
          </button>
        </div>
        
        <div className="auth-content">
          {mode === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
```

### Form Validation Requirements
- Email: Required, valid email format
- Password: Required, minimum 8 characters
- Confirm Password (register): Must match password
- Name (register): Required, minimum 2 characters
- Real-time validation with error messages
- Submit button disabled when form invalid

## Common Issues & Solutions

### Issue: remoteEntry.js not accessible
**Solution**: Check webpack devServer configuration and ensure app is running.

### Issue: Module not found errors in container
**Solution**: Ensure auth app is running before starting container.

### Issue: React version conflicts
**Solution**: Verify shared dependencies configuration matches container exactly.

### Issue: TypeScript build errors
**Solution**: Check all imports and ensure type definitions are correct.

## Integration Test with Container

After auth app is working:
1. Start auth app: `cd auth-app && npm start`
2. Start container: `cd container && npm start`
3. Navigate to http://localhost:3000/auth
4. Verify auth page loads within container
5. Test all form functionality

## Next Steps
After validation passes, proceed to Phase 3: Setup Dashboard Remote App.
