import { useThemeColor } from '@/hooks/useThemeColor';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedTextInput({ style, lightColor, darkColor, ...otherProps }: ThemedTextInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const placeholderColor = useThemeColor({ light: '#9BA1A6', dark: '#9BA1A6' }, 'icon');
  const borderColor = useThemeColor({ light: '#ccc', dark: '#333' }, 'icon');
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#151718' }, 'background');

  return (
    <TextInput
      style={[
        styles.input,
        { color, borderColor, backgroundColor },
        style,
      ]}
      placeholderTextColor={placeholderColor}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});
