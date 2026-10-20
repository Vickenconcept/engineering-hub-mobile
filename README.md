# BuildTrust Mobile App

React Native mobile application for the BuildTrust Engineering Hub platform, built with Expo and TypeScript.

## Features

- **Authentication**: Login and registration with secure token storage
- **Dashboard**: Overview of consultations, projects, and statistics
- **Consultations**: View and manage consultations
- **Projects**: Track construction projects and milestones
- **Transactions**: View transaction history
- **Notifications**: Real-time notifications
- **Settings**: User profile and account settings
- **Mobile Navigation**: Sidebar drawer + bottom tab navigation

## Tech Stack

- **Expo**: ~54.0.31
- **React Native**: 0.81.5
- **React Navigation**: Native stack, drawer, and bottom tabs
- **TypeScript**: Type-safe development
- **Axios**: HTTP client for API calls
- **AsyncStorage**: Local storage for tokens and user data
- **React Native Toast Message**: Toast notifications

## Project Structure

```
mobile/
├── src/
│   ├── components/       # Reusable UI components
│   ├── lib/             # Utilities (API client, storage)
│   ├── navigation/       # Navigation configuration
│   ├── pages/           # Screen components
│   ├── services/        # API service layer
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Helper utilities
├── App.tsx              # Root component
└── package.json
```

## Setup

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the mobile directory:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api
   ```
   For production, update this to your production API URL.

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on device/simulator:**
   - **iOS**: `npm run ios` (requires macOS)
   - **Android**: `npm run android`
   - **Web**: `npm run web`

## API Integration

The mobile app uses the same API structure as the frontend web application:

- **Base URL**: Configured via `EXPO_PUBLIC_API_BASE_URL`
- **Authentication**: Bearer token stored in AsyncStorage
- **Response Format**: Standard `{ success, message, data, errors, meta }` format
- **Error Handling**: Automatic token refresh and error toasts

## Code Standards

- **TypeScript**: All code is typed for better maintainability
- **Consistent Formatting**: Follows the same patterns as the frontend
- **Service Layer**: All API calls go through service files
- **Component Reusability**: Shared components for common UI elements
- **Clean Architecture**: Separation of concerns (services, components, pages)

## Navigation Structure

- **Auth Stack**: Login and Register screens
- **Main Stack**: Contains drawer and detail screens
- **Drawer Navigator**: Sidebar menu with user info and navigation
- **Bottom Tabs**: Main navigation (Dashboard, Consultations, Projects, Transactions, Notifications)

## Key Components

- **Card**: Reusable card component for content containers
- **Button**: Styled button with variants (primary, secondary, outline, danger)
- **Input**: Form input with label and error handling
- **StatusBadge**: Status indicator with color coding
- **CustomDrawerContent**: Custom drawer sidebar

## Services

All services follow the same pattern as the frontend:

- `auth.service.ts`: Authentication (login, register, logout)
- `consultation.service.ts`: Consultation management
- `project.service.ts`: Project management
- `transaction.service.ts`: Transaction history
- `notification.service.ts`: Notifications

## Development Notes

- Uses Expo managed workflow
- Compatible with iOS, Android, and Web
- Follows React Native best practices
- Consistent with frontend codebase structure and patterns

## Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## Troubleshooting

- **API Connection Issues**: Check `EXPO_PUBLIC_API_BASE_URL` in `.env`
- **Navigation Errors**: Ensure all screens are properly registered in navigators
- **Token Issues**: Clear AsyncStorage if experiencing auth problems
