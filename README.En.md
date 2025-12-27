# Himate
![Himate Logo](src/assets/images/logo.png)

## Project Introduction

Himate is a lightweight chat and music mobile application developed based on React Native 0.75.5.

### Project Screenshots

![Screenshot 1](public/screenshot/screenshot_1.jpg)  ![Screenshot 2](public/screenshot/screenshot_2.jpg)  ![Screenshot 3](public/screenshot/screenshot_3.jpg)  ![Screenshot 4](public/screenshot/screenshot_4.jpg)

![Screenshot 5](public/screenshot/screenshot_5.jpg)  ![Screenshot 6](public/screenshot/screenshot_6.jpg)  ![Screenshot 7](public/screenshot/screenshot_7.jpg)  ![Screenshot 8](public/screenshot/screenshot_8.jpg)


## Features

### 📱 Chat Features
- Real-time message communication
- Support for multiple message types: text, images, audio, video, etc.
- Conversation management and history
- Group chat functionality
- Message search and management

### 🎵 Music Features
- Local music playback
- Music favorites and categorization
- Lyrics display and control
- Recently played history
- Floating lyrics functionality
- Music search

### 🌍 Internationalization
- Support for Chinese and English language switching
- Auto-adaptive to system language

### 🎨 User Experience
- Smooth animation effects
- Responsive design
- Intuitive user interface
- Real-time notifications

## Technology Stack

### Core Frameworks
- **React Native**: 0.75.5
- **React**: 18.3.1

### Navigation and Routing
- **React Navigation**: 6.x
  - Stack Navigator
  - Tab Navigator
  - Drawer Navigator

### State Management
- **Zustand**: 5.x

### Database
- **Realm**: 12.x

### Internationalization
- **i18next**: 25.x
- **react-i18next**: 16.x

### Chat Functionality
- **react-native-gifted-chat**: 2.6.5
- **socket.io-client**: 4.7.5

### Music Functionality
- **react-native-audio-recorder-player**: 3.6.12
- **react-native-music-control**: 1.4.1

### UI Components
- **react-native-ui-lib**: 7.x
- **react-native-vector-icons**: 10.x

### Network and API
- **axios**: 1.6.x
- **react-native-sse**: 1.x

### Utility Libraries
- **dayjs**: 1.11.x
- **pinyin-pro**: 3.x
- **@react-native-async-storage/async-storage**: 2.x

## Installation and Setup

### Environment Requirements
- Node.js: >= 18.x
- npm/yarn: Latest version
- React Native CLI: Latest version
- Android Studio/Xcode: For native development
- Java Development Kit (JDK): >= 11.x

### Installation Steps

1. **Install Dependencies**
   ```bash
   yarn
   ```

2. **Configure Environment Variables**
   - File: `.env`
   - Modify environment variables as needed

3. **Run Script to Replace Packages** (if needed)
   - react-native-audio-recorder-player: Optimize extreme UI lag when loading music during network congestion.
   - react-native-music-control: Add Flyme status bar lyrics, improve support for Android 14.
   ```bash
   node scripts/replace-packages.js
   ```

## Running the Application

### Android
```bash
# Or use yarn
yarn android
```

### iOS
```bash
# Or use yarn
yarn ios
```

### Start Metro Server
```bash
# Default start
npm start

# Start with cache cleared
npm run start:clean

# Start development environment
npm run start:dev

# Start production environment
npm run start:prod
```

## Building the Application

### Android
```bash
# Generate Release APK
cd android
./gradlew assembleRelease

# Generate Debug APK
./gradlew assembleDebug
```

### iOS
Use Xcode to open the project, configure the signing certificates, and click "Product" -> "Archive" in the Xcode menu. Xcode will automatically build and archive the application.

## Project Structure

```
himate/
├── __tests__/           # Test files
├── android/             # Android native code
├── ios/                 # iOS native code
├── packages/            # Custom packages
├── public/              # Static resources
│   └── screenshot/      # Project screenshots
├── scripts/             # Script files
├── src/                 # Source code
│   ├── api/             # API requests
│   ├── assets/          # Resource files
│   ├── components/      # Components
│   ├── config/          # Configuration
│   ├── constants/       # Constants
│   ├── i18n/            # Internationalization
│   ├── pages/           # Pages
│   ├── router/          # Routing
│   ├── stores/          # State management
│   └── utils/           # Utility functions
├── App.jsx              # Application entry
├── index.js             # Project entry
├── package.json         # Project configuration
└── README.md            # Project documentation
```

## Core Module Description

### Chat Module
- **Chat Page**: `src/pages/message/msg_pages/chat.jsx`
- **Message Storage**: Uses Realm database to store chat records
- **Real-time Communication**: Implements real-time messaging through Socket.io, uses Server-Sent Events (SSE) for message push

### Music Module
- **Music Controller**: `src/components/music/MusicController.jsx`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

### Related Projects
- **Backend**: [Himate NestJS Server](https://gitee.com/zyz1720/himate_server_nest)
- **Backend Management**: [Himate React Backend](https://gitee.com/zyz1720/himate_backend_react)