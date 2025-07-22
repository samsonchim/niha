import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenLayoutProps {
  title?: string;
  showBack?: boolean;
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  actions?: React.ReactNode; // right side icons
}

export const ScreenLayout = ({
  title,
  showBack = false,
  children,
  scroll = false,
  style,
  actions,
}: ScreenLayoutProps) => {
  const router = useRouter();

  const ContentWrapper = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconWrapper}>
            <FontAwesome name="arrow-left" size={20} color="#00FF47" />
          </TouchableOpacity>
        ) : <View style={styles.iconWrapper} />}

        <Text style={styles.title}>{title}</Text>

        <View style={styles.iconWrapper}>
          {actions}
        </View>
      </View>

      {/* Content */}
      <ContentWrapper contentContainerStyle={[styles.content, style]}>
        {children}
      </ContentWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 32,
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
