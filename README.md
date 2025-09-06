# React Native + Supabase Template

A professional, production-ready React Native template with Supabase backend, TypeScript, and modern development practices.
 
<img src="https://github.com/user-attachments/assets/d1747c5e-da1b-4118-9ae4-1e0b952e0d6a" width="150" />
<img src="https://github.com/user-attachments/assets/6ed5b4f9-7abb-4d16-89b6-b9ffe120706b" width="150" />
<img src="https://github.com/user-attachments/assets/b0549796-54cc-41f2-916c-28ee288f0616" width="150" />
<img src="https://github.com/user-attachments/assets/22215693-69e9-4bc5-bbc1-c77e43a0a43f" width="150" />
<img src="https://github.com/user-attachments/assets/eff43354-fe5b-4c4a-bbf6-0bc2cb3968d7" width="150" />
<img src="https://github.com/user-attachments/assets/5b1bc62a-7acd-4149-884b-fd031e94732a" width="150" />
<img src="https://github.com/user-attachments/assets/607c2038-631e-4350-83c8-c7552eecd52f" width="150" />
<img src="https://github.com/user-attachments/assets/b5eca834-e55d-419f-a53d-c90164cb6ed5" width="150" />

## 🚀 Features

- **🔐 Authentication**: Complete auth flow with Supabase
- **📱 Navigation**: React Navigation with TypeScript
- **🎨 UI/UX**: Modern, responsive design with SafeAreaView
- **📝 Posts System**: Personal posts and public feed
- **💾 Database**: PostgreSQL with Supabase
- **🔒 Security**: Row Level Security (RLS) policies
- **📊 State Management**: Custom middleware pattern
- **🛡️ Type Safety**: Full TypeScript coverage
- **🔧 Development**: Hot reload, debugging, and build tools

## 🛠️ Tech Stack

- **Frontend**: React Native, TypeScript, Expo
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Navigation**: React Navigation v6
- **State Management**: Custom middleware pattern
- **Styling**: StyleSheet with design system
- **Development**: ESLint, Prettier, TypeScript

## 📁 Project Structure

```
src/
├── types/             # TypeScript type definitions
├── utils/             # Utility functions (logger, error handling, performance)
├── config/            # App configuration
├── components/        # Reusable UI components
├── screens/           # Screen components
├── navigation/        # Navigation setup
└── hooks/             # Custom React hooks

database/
└── schema.sql         # Complete database schema

lib/
├── middleware/        # Custom middleware pattern
└── supabase.ts        # Supabase client configuration
```

## 🚀 Quick Start

1. **Clone the template**

   ```bash
   git clone <repository-url>
   cd react-native-supabase-template
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment**

   ```bash
   cp env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Setup Supabase**

   - Create a new Supabase project
   - Run `database/schema.sql` in Supabase SQL Editor
   - Configure authentication settings

5. **Start development**
   ```bash
   npm start
   ```

## 📚 Documentation

- [Getting Started](./docs/development/getting-started.md)
- [Database Setup](./docs/database/setup.md)

## 🗄️ Database

The template includes a complete PostgreSQL schema with:

- **User Profiles**: User information and settings
- **Personal Posts**: Private diary entries
- **Shared Posts**: Public feed posts
- **Post Likes**: Like system for shared posts
- **Post Comments**: Comment system for shared posts
- **RLS Policies**: Row Level Security for data protection
- **Triggers**: Automatic profile creation and timestamp updates

## 🔧 Development

### Code Quality

- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Custom error handling and logging

### Performance

- Performance monitoring utilities
- Memory management
- Debounce and throttle utilities
- Caching system

### Security

- Input sanitization
- Password validation
- Rate limiting
- Secure environment configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
