import { useEffect, useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RTNGodotView, runOnGodotThread } from 'react-native-godot';

export default function GameScreen() {
  const [godotReady, setGodotReady] = useState(false);

  useEffect(() => {
    const initGodot = async () => {
      try {
        // Initialize Godot instance
        await RTNGodot.init({
          // iOS uses --main-pack
          // Android uses --path
          ...(Platform.OS === 'ios'
            ? { '--main-pack': 'assets/godot/main.pck' }
            : { '--path': '/godot/main' }
          ),
        });
        console.log('Godot initialized successfully');
        setGodotReady(true);
      } catch (error) {
        console.error('Failed to initialize Godot:', error);
      }
    };

    initGodot();

    return () => {
      // Cleanup Godot instance on unmount
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

  const releaseAction = (action: string) => {
    runOnGodotThread(() => {
      'worklet';
      const Godot = RTNGodot.API();
      const Input = Godot.Input;
      Input.action_release(action);
    });
  };

  if (!godotReady) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading Godot Game...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RTNGodotView style={styles.gameView} />
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => pressAction('ui_left')}
          onPressOut={() => releaseAction('ui_left')}
        >
          <Text style={styles.buttonText}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPressIn={() => pressAction('ui_accept')}
          onPressOut={() => releaseAction('ui_accept')}
        >
          <Text style={styles.buttonText}>跳</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPressIn={() => pressAction('ui_right')}
          onPressOut={() => releaseAction('ui_right')}
        >
          <Text style={styles.buttonText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gameView: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
});
