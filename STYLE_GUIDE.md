# NIHA Mobile App – Style Guide

This document summarizes the current visual design tokens and conventions extracted from the codebase.

Sources reviewed:
- `constants/Colors.ts`
- `components/GlobalStyles.ts`
- `components/ThemedText.tsx`
- `components/ThemedView.tsx`
- `hooks/useThemeColor.ts`
- `app/_layout.tsx`
- `components/WalletSecurity.tsx`
- `components/WalletSetupScreen.tsx`
- `assets/fonts/`

---

## Color System

### Theme tokens (`constants/Colors.ts`)
- Light theme
  - `text`: `#11181C`
  - `background`: `#FFFFFF`
  - `tint` (brand accent): `#00C853`
  - `icon`: `#687076`
  - `tabIconDefault`: `#2E2E2E`
  - `tabIconSelected`: `#00C853`
- Dark theme
  - `text`: `#ECEDEE`
  - `background`: `#151718`
  - `tint` (brand accent): `#00C853`
  - `icon`: `#9BA1A6`
  - `tabIconDefault`: `#2E2E2E`
  - `tabIconSelected`: `#00C853`

Notes
- `useThemeColor` reads these tokens for `ThemedText` (`text`) and `ThemedView` (`background`).
- The brand/primary accent is a green: `#00C853`.

### Global colors (`components/GlobalStyles.ts`)
- `primary`: `#000000` (used as a primary background in some screens)
- `white`: `#FFFFFF`
- `green`: `#00C853` (brand/primary accent)
- `red`: `#FF1744` (semantic: error/danger)
- `gray`: `#BBBBBB`
- `darkGray`: `#2E2E2E`
- `lightGray`: `#CCCCCC`

### Component-level hardcoded colors
- `components/ThemedText.tsx`
  - `link`: `#0A7EA4`
- `components/WalletSecurity.tsx`
  - Gradients: `['#000000', '#1A1A1A']`
  - Loader accent: `#00C853`
- `components/WalletSetupScreen.tsx`
  - Background: `#1A1A2E`
  - Error text: `#FF6B6B`
  - Secondary text: `#CCCCCC`

### Quick palette (swatches)
- Brand/Accent: `#00C853`
- Primary bg (some screens): `#000000`
- Light bg: `#FFFFFF`  |  Dark bg: `#151718`
- Text (light): `#11181C`  |  Text (dark): `#ECEDEE`
- Icon (light): `#687076`  |  Icon (dark): `#9BA1A6`
- Neutrals: `#2E2E2E`, `#BBBBBB`, `#CCCCCC`, `#1A1A1A`, `#1A1A2E`
- Status: `#FF1744` (danger), `#FF6B6B` (error)
- Link: `#0A7EA4`

---

## Typography

### Font family
- Primary: Poppins
  - Files present: `Poppins-Regular.ttf`, `Poppins-Bold.ttf`, `Poppins-SemiBold.ttf`
  - Loaded in `app/_layout.tsx`: `Poppins-Regular`, `Poppins-Bold`
  - Global default (via `react-native-global-props`): `Poppins-Regular`
- Additional asset: `SpaceMono-Regular.ttf` (not referenced in current reviewed sources)

Recommendation
- `Poppins-SemiBold` is referenced in `ThemedText` but not yet loaded in `_layout.tsx`. Consider adding it:

```tsx
const [loaded] = useFonts({
  'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
  'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
});
```

### Text styles (`components/ThemedText.tsx`)
- `default`: 16/24, `Poppins-Regular` (color from theme `text`)
- `defaultSemiBold`: 16/24, `Poppins-SemiBold` (color from theme `text`)
- `title`: 32/32, `Poppins-Bold` (color from theme `text`)
- `subtitle`: 20, `Poppins-Bold` (color from theme `text`)
- `link`: 16/30, `Poppins-Regular`, color `#0A7EA4`

### Global text styles (`components/GlobalStyles.ts`)
- `title`: 22, `Poppins-Bold`, color `#FFFFFF`
- `subtitle`: 16, `Poppins-Regular`, color `#CCCCCC`
- `buttonText`: 18, `Poppins-Bold`, color `#FFFFFF`

---

## Spacing & Layout

### Spacing scale (`components/GlobalStyles.ts`)
- `small`: 8
- `medium`: 16
- `large`: 24

### Common containers/buttons (`components/GlobalStyles.ts`)
- `container`
  - `flex: 1`
  - `backgroundColor: #000000`
  - `paddingHorizontal: 16`
- `header`
  - Row layout, spaced-between, centered vertically
  - Horizontal padding: 16, top padding: 24, bottom margin: 16
- `button`
  - `backgroundColor: #2E2E2E`
  - `borderRadius: 8`
  - `paddingVertical: 16`
  - `alignItems: 'center'`, `justifyContent: 'center'`
  - `width: '85%'`

---

## Theming Mechanism

- `useThemeColor(props, token)` returns the resolved color from `constants/Colors.ts` based on the OS color scheme (light/dark), unless overridden via props.
- `ThemedText` uses the `text` token; `ThemedView` uses the `background` token.
- Navigation theming uses `ThemeProvider` from `@react-navigation/native` with `DefaultTheme`/`DarkTheme` in `app/_layout.tsx`.
- The status bar is set to `auto`.

---

## Usage Examples

### Use themed text backgrounds
```tsx
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export function Example() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Title</ThemedText>
      <ThemedText type="subtitle">Subtitle</ThemedText>
      <ThemedText>Body text</ThemedText>
      <ThemedText type="link">Tap here</ThemedText>
    </ThemedView>
  );
}
```

### Use global button style
```tsx
import { GlobalStyles } from '@/components/GlobalStyles';
import { Text, TouchableOpacity, View } from 'react-native';

export function CTA() {
  return (
    <View style={GlobalStyles.container}>
      <TouchableOpacity style={GlobalStyles.button}>
        <Text style={GlobalStyles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## Implementation Notes & Consistency
- Prefer theme tokens via `ThemedText`/`ThemedView` over hardcoded hex values for consistency and easy dark-mode support.
- If you need additional semantic colors (success/warning/info), extend `constants/Colors.ts` for both light and dark themes.
- Ensure all text weights used in components are loaded in `_layout.tsx` to avoid platform fallbacks.
- Consider consolidating component-specific colors (e.g., `#1A1A2E`, `#FF6B6B`) into a semantic layer for reusability.
