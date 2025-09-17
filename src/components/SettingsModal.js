import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Switch, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { styles } from '../styles/AppStyles';

const SettingsModal = ({ 
  visible, 
  onClose, 
  settings, 
  onSaveSettings, 
  onClearAllData 
}) => {
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all scan history and favorites. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await onClearAllData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.modalContainer, settings.darkMode && styles.darkContainer]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { fontSize: settings.fontSize + 6 }]}>Settings</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalButton}>❌</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.settingsContainer}>
          {/* Dark Mode */}
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { fontSize: settings.fontSize }]}>🌙 Dark Mode</Text>
            <Switch
              value={settings.darkMode}
              onValueChange={(value) => onSaveSettings({...settings, darkMode: value})}
            />
          </View>
          
          {/* Font Size */}
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { fontSize: settings.fontSize }]}>📝 Font Size</Text>
            <TouchableOpacity 
              style={styles.fontButton}
              onPress={() => {
                const sizes = [12, 14, 16, 18, 20, 22, 24];
                const currentIndex = sizes.indexOf(settings.fontSize);
                const nextIndex = (currentIndex + 1) % sizes.length;
                onSaveSettings({...settings, fontSize: sizes[nextIndex]});
              }}
            >
              <Text style={styles.fontButtonText}>{settings.fontSize}px</Text>
            </TouchableOpacity>
          </View>
          
          {/* Speech Rate */}
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { fontSize: settings.fontSize }]}>🔊 Speech Speed</Text>
            <TouchableOpacity 
              style={styles.speedButton}
              onPress={() => {
                const speeds = [0.3, 0.5, 0.75, 1.0, 1.25, 1.5];
                const currentIndex = speeds.findIndex(s => Math.abs(s - settings.speechRate) < 0.01);
                const nextIndex = (currentIndex + 1) % speeds.length;
                onSaveSettings({...settings, speechRate: speeds[nextIndex]});
              }}
            >
              <Text style={styles.speedButtonText}>{settings.speechRate.toFixed(1)}x</Text>
            </TouchableOpacity>
          </View>
          
          {/* Language Selection */}
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { fontSize: settings.fontSize }]}>🌍 TTS Language</Text>
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={() => {
                const languages = [
                  { code: 'en-US', name: 'English' },
                  { code: 'hi-IN', name: 'हिंदी' },
                  { code: 'kn-IN', name: 'ಕನ್ನಡ' }
                ];
                const currentIndex = languages.findIndex(lang => lang.code === settings.language);
                const nextIndex = (currentIndex + 1) % languages.length;
                onSaveSettings({...settings, language: languages[nextIndex].code});
              }}
            >
              <Text style={styles.languageText}>
                {settings.language === 'en-US' ? 'English' : 
                 settings.language === 'hi-IN' ? 'हिंदी' : 'ಕನ್ನಡ'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Clear Data */}
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearData}
          >
            <Text style={styles.clearText}>🗑️ Clear All Data</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default SettingsModal;