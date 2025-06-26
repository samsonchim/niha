import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00C853',
        tabBarInactiveTintColor: '#2E2E2E',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '90%',
                borderRadius: 20,
                overflow: 'hidden',
              }}
            />
          ) : (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '90%',
                borderRadius: 20,
                backgroundColor: 'rgba(0,0,0,0.8)',
                overflow: 'hidden',
              }}
            />
          ),
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          marginHorizontal: 5,
          elevation: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 70,
          borderRadius: 20,
          paddingBottom: 12,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Regular',
          fontSize: 12,
          marginTop: 4,
          marginBottom: 6,
        },
        tabBarItemStyle: {
          marginHorizontal: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 40 }}>
              <IconSymbol size={24} name="house.fill" color={color} />
            </View>
            ),
          }}
          />
          <Tabs.Screen
          name="wallets"
          options={{
            title: 'Wallets',
            tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 40 }}>
              <IconSymbol size={24} name="creditcard.fill" color={color} />
            </View>
            ),
          }}
          />
          <Tabs.Screen
          name="transfer"
          options={{
            title: 'Transfer',
            tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 40 }}>
              <IconSymbol size={24} name="arrow.left.arrow.right" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="rates"
        options={{
          title: 'Rates',
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 40 }}>
              <IconSymbol size={24} name="chart.line.uptrend.xyaxis" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 40 }}>
              <IconSymbol size={24} name="line.3.horizontal" color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
