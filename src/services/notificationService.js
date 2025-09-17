import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return false;
    }
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medicine-reminders', {
        name: 'Medicine Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    return true;
  } catch (error) {
    console.log('Permission error:', error);
    return false;
  }
};

export const scheduleReminder = async (medicineName, time, frequency = 'daily') => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      throw new Error('Notification permission denied');
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    
    const trigger = {
      hour: hours,
      minute: minutes,
      repeats: frequency === 'daily',
    };
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 Medicine Reminder',
        body: `Time to take your ${medicineName}`,
        data: { medicineName, type: 'medicine-reminder' },
        sound: true,
      },
      trigger,
    });
    
    return notificationId;
  } catch (error) {
    console.log('Schedule error:', error);
    throw error;
  }
};

export const cancelReminder = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return true;
  } catch (error) {
    console.log('Cancel error:', error);
    return false;
  }
};

export const getAllScheduledReminders = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications.filter(n => n.content.data?.type === 'medicine-reminder');
  } catch (error) {
    console.log('Get reminders error:', error);
    return [];
  }
};