import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Path, Polyline, Rect, Svg } from 'react-native-svg';

const MailToSuccess = () => {
  const checkX = useRef(new Animated.Value(-220)).current;
  const checkScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate the check icon in
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(checkX, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(checkScale, {
          toValue: 1.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const boxColor = '#2E2E2E';
  const green = '#00C853';

  return (
    <View style={styles.container}>
      <View style={styles.animationRow}>
        {/* Static Box (like icon in image) */}
        <Svg width={50} height={40} viewBox="0 0 24 24" fill="none">
          <Rect
            x="2"
            y="4"
            width="20"
            height="16"
            stroke={boxColor}
            strokeWidth="2"
            rx="1"
          />
          <Rect
            x="16"
            y="6"
            width="3"
            height="3"
            fill={boxColor}
          />
          <Path
            d="M6 12h6M6 15h6"
            stroke={boxColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>

        {/* Dashed Line */}
        <View style={styles.line}>
          <Svg height="2" width="200">
            <Path
              d="M0 1 H200"
              stroke={green}
              strokeWidth="2"
              strokeDasharray="10,6"
            />
          </Svg>
        </View>

        {/* Checkmark Animation */}
        <Animated.View
          style={{
            transform: [{ translateX: checkX }, { scale: checkScale }],
          }}
        >
          <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
            <Path
              d="M2 4h20v16H2z"
              stroke={green}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <Polyline
              points="5,12 9,17 18,8"
              fill="none"
              stroke={green}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginTop: 100,
  },
  animationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    marginHorizontal: 10,
  },
 
});

export default MailToSuccess;
