import { AntDesign } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface CustomSuccessPopupProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onButtonPress: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
  showCancelButton?: boolean;
  type?: 'success' | 'error';
}

export default function CustomSuccessPopup({
  visible,
  title,
  message,
  buttonText = 'Continue',
  onButtonPress,
  onClose,
  showCloseButton = false,
  showCancelButton = true,
  type = 'success'
}: CustomSuccessPopupProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      checkmarkAnim.setValue(0);
      fadeAnim.setValue(0);

      // Start animations sequence
      Animated.sequence([
        // Fade in background
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Scale in popup
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        // Animate checkmark
        Animated.timing(checkmarkAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleBackdropPress = () => {
    if (onClose && (showCloseButton || showCancelButton)) {
      onClose();
    }
  };

  const handleCancelPress = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View 
        style={[styles.overlay, { opacity: fadeAnim }]}
      >
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleBackdropPress}
        />
        
        <Animated.View 
          style={[
            styles.popup,
            { 
              transform: [{ scale: scaleAnim }] 
            }
          ]}
        >
          {/* Close button */}
          {showCloseButton && onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <AntDesign name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}

          {/* Cancel button (small X at top right) */}
          {showCancelButton && onClose && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPress}>
              <AntDesign name="close" size={16} color="#888" />
            </TouchableOpacity>
          )}

          {/* Icon container */}
          <View style={styles.iconContainer}>
            <View style={[
              styles.iconCircle,
              type === 'error' ? styles.errorCircle : styles.successCircle
            ]}>
              <Animated.View
                style={[
                  styles.icon,
                  {
                    transform: [
                      {
                        scale: checkmarkAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 1.2, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <AntDesign 
                  name={type === 'error' ? 'close' : 'check'} 
                  size={32} 
                  color="#fff" 
                />
              </Animated.View>
            </View>
            
            {/* Ring animation */}
            <Animated.View
              style={[
                styles.ring,
                type === 'error' ? styles.errorRing : styles.successRing,
                {
                  opacity: checkmarkAnim,
                  transform: [
                    {
                      scale: checkmarkAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.1],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>
          
          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Action button */}
          <TouchableOpacity 
            style={styles.button}
            onPress={onButtonPress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
            <AntDesign name="arrowright" size={16} color="#000" style={styles.buttonIcon} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  popup: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    shadowColor: '#00C853',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  successCircle: {
    backgroundColor: '#00C853',
    shadowColor: '#00C853',
  },
  errorCircle: {
    backgroundColor: '#F44336',
    shadowColor: '#F44336',
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    top: -10,
    left: -10,
    opacity: 0.3,
  },
  successRing: {
    borderColor: '#00C853',
  },
  errorRing: {
    borderColor: '#F44336',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  message: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    fontFamily: 'Poppins-Regular',
  },
  button: {
    backgroundColor: '#00C853',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#00C853',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  buttonIcon: {
    marginLeft: 4,
  },
});
