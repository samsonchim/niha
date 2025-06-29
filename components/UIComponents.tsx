import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, Spacing } from './GlobalStyles';

export const Header = ({ title, onBackPress, onActionPress }: any) => (
  <View style={styles.header}>
    {onBackPress && (
      <TouchableOpacity onPress={onBackPress}>
        <Text style={styles.icon}>←</Text>
      </TouchableOpacity>
    )}
    <Text style={styles.title}>{title}</Text>
    {onActionPress && (
      <TouchableOpacity onPress={onActionPress}>
        <Text style={styles.icon}>⚙</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const Button = ({ text, onPress, disabled }: any) => (
  <TouchableOpacity
    style={[styles.button, disabled && styles.buttonDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>{text}</Text>
  </TouchableOpacity>
);

export const ThemedText = ({ type, style, children }: any) => {
  const textStyle =
    type === 'title'
      ? styles.title
      : type === 'subtitle'
      ? styles.subtitle
      : styles.text;
  return <Text style={[textStyle, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.medium,
    paddingTop: Spacing.large,
    marginBottom: Spacing.medium,
  },
  title: {
    color: Colors.white,
    fontSize: 22,
    fontFamily: Fonts.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.lightGray,
    fontSize: 16,
    fontFamily: Fonts.regular,
    textAlign: 'center',
  },
  text: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  button: {
    backgroundColor: Colors.darkGray,
    borderRadius: Spacing.small,
    paddingVertical: Spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
  },
  buttonDisabled: {
    backgroundColor: Colors.gray,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  icon: {
    color: Colors.white,
    fontSize: 22,
  },
});
