# Getting Started

This guide will help you set up and run the React Native + Supabase template.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Supabase account
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd react-native-supabase-template
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install Expo CLI globally**
   ```bash
   npm install -g @expo/cli
   ```

## Environment Setup

1. **Copy environment file**

   ```bash
   cp env.example .env
   ```

2. **Configure environment variables**
   Edit `.env` file with your actual values:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_APP_NAME=YourAppName
   EXPO_PUBLIC_APP_VERSION=1.0.0
   EXPO_PUBLIC_ENVIRONMENT=development
   ```

## Supabase Setup

1. **Create a new Supabase project**

   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Choose your organization and enter project details

2. **Get your project credentials**

   - Go to Settings > API
   - Copy your Project URL and anon public key

3. **Set up the database**

   - Go to SQL Editor in your Supabase dashboard
   - Run the SQL scripts from `database/` folder in order:
     - `schema.sql` - Main database schema
     - `add-user-profiles.sql` - User profiles table
     - `create-profiles.sql` - Create profiles for existing users

4. **Configure Authentication**
   - Go to Authentication > Settings
   - Configure your auth providers
   - Set up email templates if needed

## Running the App

1. **Start the development server**

   ```bash
   npm start
   # or
   yarn start
   ```

2. **Run on iOS**

   ```bash
   npm run ios
   # or
   yarn ios
   ```

3. **Run on Android**

   ```bash
   npm run android
   # or
   yarn android
   ```

4. **Run on web**
   ```bash
   npm run web
   # or
   yarn web
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Button, Input, etc.)
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   ├── main/          # Main app screens
│   └── shared/        # Shared screens
├── navigation/         # Navigation configuration
├── services/          # API and external services
├── store/             # State management
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
├── hooks/             # Custom React hooks
├── config/            # App configuration
└── assets/            # Images, fonts, etc.
```

## Key Features

### Authentication

- Email/password authentication
- Secure session management
- Automatic token refresh
- Logout functionality

### Posts System

- Personal posts (private diary)
- Public feed (shared posts)
- Like and comment system
- Tag system
- Mood tracking

### Navigation

- Stack navigation for auth flow
- Tab navigation for main app
- Type-safe navigation with TypeScript
- Deep linking support

### State Management

- Custom middleware pattern
- Centralized state management
- Real-time updates
- Offline support

## Development

### Code Style

- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Consistent naming conventions

### Testing

```bash
npm test
# or
yarn test
```

### Building for Production

1. **Configure EAS Build**

   ```bash
   npx eas build:configure
   ```

2. **Build for iOS**

   ```bash
   npx eas build --platform ios
   ```

3. **Build for Android**
   ```bash
   npx eas build --platform android
   ```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**

   ```bash
   npx expo start --clear
   ```

2. **iOS simulator not starting**

   ```bash
   npx expo run:ios --device
   ```

3. **Android build issues**

   ```bash
   cd android && ./gradlew clean && cd ..
   ```

4. **Supabase connection issues**
   - Check your environment variables
   - Verify your Supabase project is active
   - Check your network connection

### Debug Mode

Enable debug mode in your `.env` file:

```env
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=debug
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.
