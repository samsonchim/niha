import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Notification {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  icon: string;
  iconColor: string;
  iconBackground: string;
}

interface NotificationOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const notificationData: Notification[] = [
  {
    id: '1',
    title: 'App Update Reminder',
    message: 'We just want to remind you that you should please just update your app, please',
    timeAgo: '9 mins Ago',
    icon: 'warning',
    iconColor: '#fff',
    iconBackground: '#00C853',
  },
  {
    id: '2',
    title: 'App Update Reminder',
    message: 'We just want to remind you that you should please just update your app, please',
    timeAgo: '18 mins Ago',
    icon: 'warning',
    iconColor: '#fff',
    iconBackground: '#00C853',
  },
  {
    id: '3',
    title: 'App Update Reminder',
    message: 'We just want to remind you that you should please just update your app, please',
    timeAgo: '25 mins Ago',
    icon: 'warning',
    iconColor: '#fff',
    iconBackground: '#00C853',
  },
  {
    id: '4',
    title: 'App Update Reminder',
    message: 'We just want to remind you that you should please just update your app, please',
    timeAgo: '35 mins Ago',
    icon: 'warning',
    iconColor: '#fff',
    iconBackground: '#00C853',
  },
];

export function NotificationOverlay({ visible, onClose }: NotificationOverlayProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.backdropTouchable} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <View style={styles.notificationContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <FontAwesome name="times" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Notification List */}
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {notificationData.map((notification) => (
              <View key={notification.id} style={styles.notificationItem}>
                {/* Icon */}
                <View style={[styles.iconContainer, { backgroundColor: notification.iconBackground }]}>
                  <FontAwesome 
                    name={notification.icon} 
                    size={16} 
                    color={notification.iconColor} 
                  />
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                  <View style={styles.textContainer}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                  </View>
                  
                  {/* Time */}
                  <Text style={styles.timeAgo}>{notification.timeAgo}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  notificationContainer: {
    height: '50%',
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  notificationTitle: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginBottom: 4,
  },
  notificationMessage: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    lineHeight: 16,
  },
  timeAgo: {
    color: '#888',
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
});