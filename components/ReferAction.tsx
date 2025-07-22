import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function ReferAction() {
  const handleReferPress = () => {
    console.log('Refer action pressed');
   

  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleReferPress} activeOpacity={0.8}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Refer and Earn</Text>
          <Text style={styles.subtitle}>Earn a $5 reward on every successful reward</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={require('@/assets/images/refer.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    lineHeight: 16,
  },
  imageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
  },
});