import { FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Alert, Platform, ToastAndroid, TouchableOpacity } from 'react-native';

interface CopyProps {
  text: string;
  iconSize?: number;
  iconColor?: string;
}

export function CopyToClipboard({ text, iconSize = 14, iconColor = '#00C853' }: CopyProps) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied', 'Copied to clipboard');
    }
  };

  return (
    <TouchableOpacity onPress={handleCopy} activeOpacity={0.7}>
      <FontAwesome name="copy" size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
}
