# Phase 4: Setup Profile Remote Application

## Prompt Template
```
Create a React TypeScript remote application for user profile using Webpack Module Federation.

Requirements:
- Use create-react-app with TypeScript template
- Configure Webpack Module Federation as remote
- Expose ProfilePage component via "./ProfilePage"
- Create user profile form with image upload
- Include profile settings and preferences
- Configure to run on port 3003
- Match shared dependencies with container

Create the following structure:
/profile-app
  /src
    /components
      - ProfileForm.tsx
      - ImageUpload.tsx
      - SettingsPanel.tsx
      - PreferencesForm.tsx
    /pages
      - ProfilePage.tsx
    /hooks
      - useProfile.ts
      - useImageUpload.ts
    /types
      - profile.types.ts
    /utils
      - imageHelpers.ts
      - validation.ts
    - App.tsx
    - index.tsx
  - webpack.config.js
  - package.json

ProfilePage should include:
- Profile information form (name, email, bio, etc.)
- Profile image upload with preview
- Account settings (notifications, privacy)
- Form validation and error handling
- Save/cancel functionality
- Responsive design
- Accessibility features
```

## Validation Checklist

### After Running the Prompt
- [ ] Profile app project created with TypeScript
- [ ] webpack.config.js configured as Module Federation remote
- [ ] App starts on port 3003 without errors
- [ ] ProfilePage component exports properly
- [ ] remoteEntry.js accessible at http://localhost:3003/remoteEntry.js
- [ ] Profile form renders with all fields
- [ ] Image upload component works with preview
- [ ] Settings panel displays correctly

### Code Quality Checks
- [ ] TypeScript interfaces for all profile data and props
- [ ] Form validation provides clear error messages
- [ ] Image upload handles file size/type validation
- [ ] Forms are accessible (labels, ARIA attributes, keyboard navigation)
- [ ] Responsive design works on mobile and desktop
- [ ] Loading states implemented for save operations
- [ ] No console errors or warnings

### Module Federation Specific
- [ ] webpack config exposes "./ProfilePage" correctly
- [ ] shared dependencies match container (React, ReactDOM as singletons)
- [ ] Module Federation name is "profile"
- [ ] filename is "remoteEntry.js"
- [ ] App can run independently on port 3003

### Testing Commands
```bash
cd profile-app
npm start  # Should start on port 3003
# Visit http://localhost:3003 - should show profile page
# Visit http://localhost:3003/remoteEntry.js - should download file
# Test form validation and submission
# Test image upload functionality
# Verify responsive layout
```

## Expected File Contents

### webpack.config.js
```javascript
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  mode: "development",
  devServer: {
    port: 3003,
    historyApiFallback: true,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "profile",
      filename: "remoteEntry.js",
      exposes: {
        "./ProfilePage": "./src/pages/ProfilePage",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
  ],
};
```

### ProfilePage.tsx Structure
```typescript
import React, { useState, useEffect } from "react";
import ProfileForm from "../components/ProfileForm";
import ImageUpload from "../components/ImageUpload";
import SettingsPanel from "../components/SettingsPanel";
import { ProfileData } from "../types/profile.types";
import { useProfile } from "../hooks/useProfile";

const ProfilePage: React.FC = () => {
  const { profile, loading, error, updateProfile } = useProfile();
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-error">Error loading profile</div>;
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account information and preferences</p>
      </header>

      <div className="profile-tabs">
        <button 
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
          aria-selected={activeTab === "profile"}
        >
          Profile Information
        </button>
        <button 
          className={activeTab === "settings" ? "active" : ""}
          onClick={() => setActiveTab("settings")}
          aria-selected={activeTab === "settings"}
        >
          Settings
        </button>
      </div>

      <div className="profile-content">
        {activeTab === "profile" ? (
          <div className="profile-info">
            <ImageUpload 
              currentImage={profile?.avatar}
              onImageChange={(image) => updateProfile({ avatar: image })}
            />
            <ProfileForm 
              profile={profile}
              onSave={updateProfile}
            />
          </div>
        ) : (
          <SettingsPanel 
            settings={profile?.settings}
            onSave={(settings) => updateProfile({ settings })}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
```

### Required Form Fields
**Profile Information:**
- First Name (required)
- Last Name (required)
- Email (required, email validation)
- Phone Number (optional, phone format validation)
- Bio/Description (optional, character limit)
- Location (optional)

**Settings:**
- Email Notifications (toggle)
- Push Notifications (toggle)
- Privacy Settings (public/private profile)
- Language Preference (dropdown)
- Theme Preference (light/dark/auto)

### Image Upload Requirements
- [ ] File type validation (jpg, png, gif)
- [ ] File size limit (e.g., 5MB max)
- [ ] Image preview before upload
- [ ] Crop/resize functionality (optional)
- [ ] Error handling for invalid files
- [ ] Loading state during upload

## Common Issues & Solutions

### Issue: Image upload not working
**Solution**: Implement proper file handling with FileReader API and validation

### Issue: Form validation not triggering
**Solution**: Use proper form libraries like react-hook-form or implement custom validation

### Issue: Tab navigation accessibility issues
**Solution**: Implement proper ARIA attributes and keyboard navigation

### Issue: Responsive layout breaking on mobile
**Solution**: Use proper CSS Grid/Flexbox with mobile-first approach

## Integration Test with Container

After profile app is working:
1. Start profile app: `cd profile-app && npm start`
2. Start container: `cd container && npm start`
3. Navigate to http://localhost:3000/profile
4. Verify profile page loads within container
5. Test all form functionality
6. Test image upload
7. Test tab navigation
8. Verify responsive behavior

## Accessibility Requirements
- [ ] All form fields have proper labels
- [ ] Tab navigation works with keyboard
- [ ] Screen reader announcements for form errors
- [ ] Color contrast meets WCAG guidelines
- [ ] Focus indicators are visible
- [ ] Image upload has alt text support

## Security Considerations
- [ ] Client-side file validation (type, size)
- [ ] Sanitize user input before display
- [ ] Implement CSRF protection for form submissions
- [ ] Validate image files on server side
- [ ] Implement rate limiting for uploads

## Next Steps
After validation passes, proceed to Phase 5: Integration Testing & Optimization.
