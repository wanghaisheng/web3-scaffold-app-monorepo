# Start UI Native + Godot Integration

This document explains how to use the Godot integration in Start UI Native.

## Overview

Start UI Native now includes integration with `react-native-godot`, allowing you to embed Godot games into your React Native Expo application.

## Setup

### 1. Dependencies

The following dependency has been added to `package.json`:

```json
"react-native-godot": "1.0.1"
```

### 2. Godot Game Files

Place your Godot game files in the `assets/godot/` directory:

**For iOS**:
- Place your exported Godot game file at: `assets/godot/main.pck`

**For Android**:
- Place your exported Godot game files as a folder structure at: `assets/godot/godot-files/main/`

### 3. Custom Expo Plugin

A custom Expo plugin is already implemented at `plugins/godot/` to handle Godot file copying during prebuild:

**iOS Plugin** (`plugins/godot/src/withPckFile.ts`):
- Automatically copies `main.pck` from `assets/godot/` to the iOS project root
- Adds the file to Xcode project resources
- Ensures proper build configuration for iOS

**Android Plugin** (`plugins/godot/src/withGodotFiles.ts`):
- Automatically copies Godot files from `assets/godot/godot-files/main/` to `android/app/src/main/assets/main/`
- Recursively copies all files and subdirectories
- Ensures the assets directory exists before copying
- Runs during the `expo prebuild` process

The plugin is already configured in `app.config.ts`:

```typescript
plugins: [
  './plugins/godot',
  [
    'expo-build-properties',
    {
      android: {
        minSdkVersion: 29,
        extraMavenRepos: [
          '../../node_modules/react-native-godot/android/libs/libgodot-android/4.5.1.migeran.2'
        ]
      }
    }
  ]
]
```

### 4. Android Patch

A patch has been applied to fix Android crashes when using Expo with the new React Native architecture (Arc).

**Patch File**: `patches/react-native-godot.patch`

**Purpose**: The patch ensures proper JNI initialization by setting the JavaVM pointer in LibGodot before initialization, which is critical for Android thread creation.

**Application**: The patch is automatically applied during `pnpm install` via `patch-package`.

**Configuration** in `package.json`:

```json
{
  "pnpm": {
    "patchedDependencies": {
      "react-native-godot@1.0.1": "patches/react-native-godot.patch"
    }
  }
}
```

If you encounter crashes on Android, ensure the patch is applied by running:
```bash
pnpm install
```

## Usage

### Game Screen

A game screen has been created at `src/app/(logged)/game/index.tsx`.

To access it, navigate to `/game` in your app.

### Example Code

```typescript
import { useEffect, useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RTNGodotView, runOnGodotThread } from 'react-native-godot';

export default function GameScreen() {
  const [godotReady, setGodotReady] = useState(false);

  useEffect(() => {
    const initGodot = async () => {
      try {
        await RTNGodot.init({
          // iOS uses --main-pack
          // Android uses --path
          ...(Platform.OS === 'ios'
            ? { '--main-pack': 'assets/godot/main.pck' }
            : { '--path': '/godot/main' }
          ),
        });
        setGodotReady(true);
      } catch (error) {
        console.error('Failed to initialize Godot:', error);
      }
    };

    initGodot();

    return () => {
      RTNGodot.destroyInstance();
    };
  }, []);

  const pressAction = (action: string) => {
    runOnGodotThread(() => {
      'worklet';
      const Godot = RTNGodot.API();
      const Input = Godot.Input;
      Input.action_press(action);
    });
  };

  return (
    <View style={styles.container}>
      <RTNGodotView style={styles.gameView} />
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => pressAction('ui_left')}>
          <Text>←</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

## Godot Export Instructions

### Exporting for iOS

1. Open your Godot project
2. Go to **Project → Export**
3. Select **iOS** template
4. Export as a **.pck** file
5. Place the file at `assets/godot/main.pck`

### Exporting for Android

1. Open your Godot project
2. Go to **Project → Export**
3. Select **Android** template
4. Export as a folder structure
5. Place the folder at `assets/godot/godot-files/main/`

## Platform Differences

### iOS
- Uses `.pck` file format
- File accessed via bundle directory
- Better performance with pack files

### Android
- Uses folder structure
- Files accessed via assets directory
- Better performance with individual files

## Controls

The example game screen includes basic touch controls:
- **Left Arrow**: Move left (`ui_left` action)
- **Jump Button**: Jump (`ui_accept` action)
- **Right Arrow**: Move right (`ui_right` action)

These controls use Godot's Input API through worklets for thread-safe communication.

## Godot Side

In your Godot game, handle the input actions:

```gdscript
extends CharacterBody2D

const SPEED = 200.0
const JUMP_FORCE = -400.0

var velocity = Vector2.ZERO

func _physics_process(delta):
    velocity.x = 0
    velocity.y += gravity * delta
    
    if Input.is_action_pressed("ui_left"):
        velocity.x = -SPEED
    elif Input.is_action_pressed("ui_right"):
        velocity.x = SPEED
    
    if Input.is_action_pressed("ui_accept"):
        if is_on_floor():
            velocity.y = JUMP_FORCE
    
    velocity = move_and_slide()
```

## Running the App

### Development

```bash
pnpm dev
```

### Local Builds

```bash
# iOS
pnpm dev:build:ios

# Android
pnpm dev:build:android
```

## Troubleshooting

### Godot Not Initializing

- Ensure Godot game files are in the correct location
- Check that the file paths in the code match your actual file locations
- Verify that `react-native-godot` is properly installed

### Controls Not Working

- Ensure Godot Input actions are properly configured in your Godot project
- Check that the action names match between React Native and Godot
- Verify that worklets are properly executed

### Performance Issues

- For iOS, ensure you're using `.pck` file format
- For Android, ensure you're using folder structure
- Consider optimizing your Godot game assets

## Resources

- [React Native Godot Documentation](https://github.com/borndotcom/react-native-godot)
- [Godot Documentation](https://docs.godotengine.org/)
- [Start UI Native Documentation](https://github.com/bearstudio/start-ui-native)

## Notes

- This integration uses `react-native-godot` version 1.0.1
- The game screen is accessible at `/game` route
- Godot runs on a separate thread for performance
- All Godot API calls must be made through `runOnGodotThread`
