import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function PreLoader() {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 3000, // Duration for the full animation cycle
        useNativeDriver: true,
      })
    ).start();
  }, [animation]);

  const path = animation.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -10, 10, -5, 0], // Simulates curvy slopes
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.line,
          {
            transform: [{ translateY: path }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: 80,
    height: 4,
    backgroundColor: '#00C853',
    borderRadius: 2,
  },
});