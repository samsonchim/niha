import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedProps,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, G, LinearGradient, Polygon, Rect, Stop } from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

export default function LetterInEnvelope({ size = 120 }) {
  // Animation values
  const letterY = useSharedValue(10);
  const letterOpacity = useSharedValue(0);
  const flapAngle = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.15);

  useEffect(() => {
    // Sequence: fade in letter, slide down, close flap, fade shadow
    letterOpacity.value = withTiming(1, { duration: 400 });
    letterY.value = withDelay(
      200,
      withTiming(50, { duration: 1000, easing: Easing.out(Easing.cubic) }, () => {
        flapAngle.value = withTiming(-35, { duration: 600, easing: Easing.inOut(Easing.cubic) });
        shadowOpacity.value = withTiming(0.3, { duration: 600 });
      })
    );
  }, []);

  // Letter animation
  const animatedLetterProps = useAnimatedProps(() => ({
    y: letterY.value,
    opacity: letterOpacity.value,
  }));

  // Flap animation (rotation)
  const animatedFlapProps = useAnimatedProps(() => {
    // SVG rotates around (60,60)
    return {
      transform: [
        {
          rotate: `${flapAngle.value}deg`,
        },
      ],
      opacity: 1,
    };
  });

  // Shadow animation
  const animatedShadowProps = useAnimatedProps(() => ({
    opacity: shadowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          {/* Envelope gradient */}
          <LinearGradient id="envelopeGradient" x1="0" y1="60" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#FF4EDB" stopOpacity="1" />
            <Stop offset="1" stopColor="#C13CB0" stopOpacity="1" />
          </LinearGradient>
          {/* Letter shadow */}
          <LinearGradient id="shadowGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000" stopOpacity="0.18" />
            <Stop offset="1" stopColor="#000" stopOpacity="0.01" />
          </LinearGradient>
        </Defs>
        <AnimatedEllipse
          cx="60"
          cy="108"
          rx="32"
          ry="8"
          fill="url(#shadowGradient)"
          animatedProps={animatedShadowProps}
        />
        {/* Envelope base */}
        <Rect
          x="20"
          y="60"
          width="80"
          height="40"
          rx="10"
          fill="url(#envelopeGradient)"
          stroke="#fff"
          strokeWidth="2"
        />
        {/* Animated letter */}
        <AnimatedRect
          x="32"
          width="56"
          height="36"
          rx="5"
          fill="#fff"
          stroke="#FF4EDB"
          strokeWidth="2"
          animatedProps={animatedLetterProps}
          opacity={letterOpacity.value}
        />
        {/* Flap (animated) */}
        <G origin="60,60">
          <AnimatedPolygon
            points="20,60 60,30 100,60"
            fill="url(#envelopeGradient)"
            stroke="#fff"
            strokeWidth="2"
            animatedProps={animatedFlapProps}
          />
        </G>
        {/* Letter lines for detail */}
        <Rect
          x="40"
          y={letterY.value + 10}
          width="40"
          height="3"
          rx="1.5"
          fill="#FF4EDB"
          opacity="0.18"
        />
        <Rect
          x="40"
          y={letterY.value + 18}
          width="28"
          height="3"
          rx="1.5"
          fill="#FF4EDB"
          opacity="0.12"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});