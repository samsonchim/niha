export const options = {
  headerShown: false,
  tabBarStyle: { display: 'none' },
};

import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.centered}>
        <Image
          source={require('@/assets/images/welcome.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Crypto-Based Online Banking</Text>
        <Text style={styles.subtitle}>
          Its, fast, secure and support near about a hundred crypto currencies
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/enter-email')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <FontAwesome name="arrow-right" size={18} color="#fff" style={styles.arrow} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  centered: {
    alignItems: 'center',
    marginTop: 20,
  },
  icon: {
    width: 280,
    height: 350,
  },
  nihaPay: {
    color: '#FF4EDB',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  content: {
    marginTop: 30,
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 20,
    textAlign: 'left',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4EDB',
    borderRadius: 10,
    paddingVertical: 14,
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
  },
  arrow: {
    marginLeft: -20,
    marginRight: 10,
  },
});
