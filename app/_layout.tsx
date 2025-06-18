import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';

const ICON_SIZE = 28;
const PINK = '#FF4EDB';
const GRAY = '#888';

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Icon mapping
          let icon = null;
          if (index === 0)
            icon = <FontAwesome name="home" size={ICON_SIZE} color={isFocused ? PINK : GRAY} />;
          else if (index === 1)
            icon = <FontAwesome5 name="chart-pie" size={ICON_SIZE} color={isFocused ? PINK : GRAY} />;
          else if (index === 2)
            icon = (
              <View style={styles.centerIconWrapper}>
                <FontAwesome name="exchange" size={ICON_SIZE} color="#222" />
              </View>
            );
          else if (index === 3)
            icon = <FontAwesome5 name="chart-bar" size={ICON_SIZE} color={isFocused ? PINK : GRAY} />;
          else if (index === 4)
            icon = <FontAwesome name="cog" size={ICON_SIZE} color={isFocused ? PINK : GRAY} />;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={index === 2 ? styles.centerTab : styles.tab}
              activeOpacity={0.8}
            >
              {icon}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <Tabs
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30,30,32,0.98)',
    borderRadius: 40,
    marginHorizontal: 12,
    marginBottom: 0,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '96%',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  centerIconWrapper: {
    backgroundColor: PINK,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    borderWidth: 4,
    borderColor: 'rgba(30,30,32,0.98)',
    shadowColor: '#FF4EDB',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
});
