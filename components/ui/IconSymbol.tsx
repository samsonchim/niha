import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
type IconMapping = Record<string, MaterialIconName>;

/**
 * Define mapping from SF Symbols to Material Icons here.
 */
const MAPPING = {
  'house.fill': 'home',
  'wallet.fill': 'account-balance-wallet',
  'creditcard.fill': 'credit-card', 
  'arrow.left.arrow.right': 'swap-horiz',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'line.3.horizontal': 'menu',
  'bell': 'notifications-none',
};


/**
 * Valid icon names based on keys in the mapping.
 */
type IconSymbolName = keyof typeof MAPPING;

/**
 * Cross-platform Icon component.
 * Uses SF Symbols on iOS and MaterialIcons on Android/web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight, // optional, for future SF Symbol support
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name];

  if (!iconName) {
    console.warn(`⚠️ Unknown icon symbol name: "${name}". Check your MAPPING.`);
    return null;
  }

  return <MaterialIcons name={iconName as any} size={size} color={color} style={style} />;
}
