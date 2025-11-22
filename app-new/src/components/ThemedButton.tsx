import { useThemeColor } from '@/hooks/useThemeColor';
import { ActivityIndicator, StyleSheet, TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { ThemedText } from './ThemedText';

export type ThemedButtonProps = TouchableOpacityProps & {
  title: string;
  loading?: boolean;
  lightColor?: string;
  darkColor?: string;
};

export function ThemedButton({ style, title, loading, lightColor, darkColor, ...otherProps }: ThemedButtonProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'tint');

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, opacity: loading || otherProps.disabled ? 0.7 : 1 },
        style,
      ]}
      disabled={loading || otherProps.disabled}
      {...otherProps}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <ThemedText style={styles.text}>{title}</ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});
