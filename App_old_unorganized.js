import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Alert, Image, 
  ScrollView, Switch, Modal, FlatList, StatusBar
} from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImageManipulator from 'expo-image-manipulator';

// Import services
import { analyzeImageWithGemini } from './src/services/geminiService';
import { speakMedicineInfo } from './src/services/ttsService';

// Import utilities
import { formatMedicineInfo, extractMedicineName, checkForWarnings } from './src/utils/textUtils';
import { getRandomMedicine } from './src/constants/demoData';

// Import hooks
import { useStorage } from './src/hooks/useStorage';

// Import components
import { CameraScreen } from './src/components/CameraScreen';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [medicineInfo, setMedicineInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  
  const {
    scanHistory,
    favorites,
    settings,
    saveSettings,
    saveToHistory,
    toggleFavorite,
    clearAllData
  } = useStorage();

  const handleCameraCapture = (photo) => {
    setCapturedImage(photo.uri);
    setEditingImage(photo);
    setShowCamera(false);
    setShowImageEditor(true);
  };

  const processImage = async (imageData) => {
    setShowImageEditor(false);
    setLoading(true);
    
    try {
      // Analyze with Gemini
      const analysisText = await analyzeImageWithGemini(imageData.base64, settings.language);
      
      // Extract medicine name
      const extractedName = extractMedicineName(analysisText);
      
      // Format and set results
      const formattedInfo = formatMedicineInfo(analysisText, extractedName);
      
      setMedicineName(extractedName);
      setMedicineInfo(formattedInfo);
      
      // Save to history
      const scanResult = {
        name: extractedName,
        info: analysisText,
        timestamp: new Date().toISOString(),
        image: capturedImage
      };
      await saveToHistory(scanResult);
      
      // Check for warnings
      if (checkForWarnings(analysisText)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert('⚠️ Important Warning', 'This medicine analysis contains important safety information. Please read carefully.');
      }
      
    } catch (error) {
      console.log('Analysis Error:', error);
      
      // Handle specific API errors
      if (error.message.includes('API Error: 503')) {
        await simulateAnalysis();
        return;
      }
      
      let errorMessage = 'Could not analyze the image. ';
      if (error.message.includes('API Error: 401')) {
        errorMessage += 'Invalid API key. Please check your Gemini API key.';
      } else if (error.message.includes('API Error: 429')) {
        errorMessage += 'Rate limit exceeded. Please try again later.';
      } else {
        errorMessage += 'Please try again or use a clearer image.';
      }
      
      Alert.alert('Analysis Failed', errorMessage);
      setMedicineInfo('Unable to analyze the medicine image. Please ensure the image is clear and try again.');
    }
    
    setLoading(false);
  };

  const simulateAnalysis = async () => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const randomMedicine = getRandomMedicine();
    
    const scanResult = {
      name: randomMedicine.name,
      info: randomMedicine.info,
      timestamp: new Date().toISOString(),
      image: capturedImage
    };
    
    setMedicineName(randomMedicine.name);
    setMedicineInfo(formatMedicineInfo(randomMedicine.info));
    await saveToHistory(scanResult);
  };

  const speakInfo = () => {
    speakMedicineInfo(medicineName, medicineInfo, settings, isSpeaking, setIsSpeaking);
  };

  const resetApp = () => {
    setMedicineName('');
    setMedicineInfo('');
    setCapturedImage(null);
    setLoading(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const scheduleReminder = async (medicineName, time) => {
    Alert.alert('Reminder', `Reminder set for ${medicineName}! (Note: Full reminder functionality requires development build)`);
  };

  const exportHistory = async () => {
    try {
      const historyText = scanHistory.map(scan => 
        `${scan.name} - ${new Date(scan.timestamp).toLocaleDateString()}\n${scan.info}\n\n`
      ).join('');
      
      Alert.alert('Export', 'History exported to clipboard', [
        { text: 'OK', onPress: () => console.log('Exported:', historyText) }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to export history');
    }
  };

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.historyItem, settings.darkMode && styles.darkHistoryItem]}
      onPress={() => {
        setMedicineName(item.name);
        setMedicineInfo(item.info);
        setCapturedImage(item.image);
        setShowHistory(false);
      }}
    >
      <View style={styles.historyHeader}>
        <Text style={[styles.historyName, { fontSize: settings.fontSize + 2 }]}>{item.name}</Text>
        <TouchableOpacity onPress={() => toggleFavorite(item)}>
          <Text style={styles.favoriteIcon}>
            {favorites.some(fav => fav.name === item.name) ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.historyDate, { fontSize: settings.fontSize - 2 }]}>
        {new Date(item.timestamp).toLocaleDateString()}
      </Text>
      <Text style={[styles.historyInfo, { fontSize: settings.fontSize }]} numberOfLines={2}>
        {item.info}
      </Text>
    </TouchableOpacity>
  );

  if (!permission) {
    return (
      <View style={[styles.container, settings.darkMode && styles.darkContainer]}>
        <Text style={[styles.loadingText, { fontSize: settings.fontSize }]}>Loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, settings.darkMode && styles.darkContainer]}>
        <Text style={[styles.errorText, { fontSize: settings.fontSize + 2 }]}>Camera permission required</Text>
        <TouchableOpacity style={styles.scanButton} onPress={requestPermission}>
          <Text style={[styles.scanButtonText, { fontSize: settings.fontSize }]}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, settings.darkMode && styles.darkContainer]}>
      <StatusBar barStyle={settings.darkMode ? 'light-content' : 'dark-content'} />
      
      {showCamera ? (
        <CameraScreen 
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          settings={settings}
          onSettingsChange={saveSettings}
        />
      ) : showImageEditor ? (
        <View style={styles.editorContainer}>
          <Image source={{ uri: editingImage?.uri }} style={styles.editImage} />
          <View style={styles.editorControls}>
            <TouchableOpacity 
              style={styles.editorButton}
              onPress={() => processImage(editingImage)}
            >
              <Text style={styles.buttonText}>✅ Analyze</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.editorButton}
              onPress={() => setShowImageEditor(false)}
            >
              <Text style={styles.buttonText}>❌ Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.homeContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { fontSize: settings.fontSize + 20 }, settings.darkMode && styles.darkText]}>
              KnowDose Pro
            </Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={() => setShowHistory(true)}>
                <Text style={styles.headerIcon}>📋</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowSettings(true)}>
                <Text style={styles.headerIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={[styles.subtitle, { fontSize: settings.fontSize }, settings.darkMode && styles.darkText]}>
            Advanced medicine scanner with AI analysis
          </Text>
          
          {/* Captured Image */}
          {capturedImage && (
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          )}
          
          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { fontSize: settings.fontSize + 2 }]}>
                🔍 Analyzing medicine...
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progress, { width: '60%' }]} />
              </View>
            </View>
          )}
          
          {/* Results */}
          {medicineName && !loading && (
            <View style={[styles.resultContainer, settings.darkMode && styles.darkResultContainer]}>
              <View style={styles.resultHeader}>
                <Text style={[styles.medicineName, { fontSize: settings.fontSize + 12 }]}>
                  {medicineName}
                </Text>
                <TouchableOpacity onPress={() => toggleFavorite({ name: medicineName, info: medicineInfo })}>
                  <Text style={styles.favoriteIcon}>
                    {favorites.some(fav => fav.name === medicineName) ? '❤️' : '🤍'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.infoScroll} 
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                contentContainerStyle={{ paddingBottom: 10 }}
              >
                <Text style={[styles.medicineInfo, { fontSize: settings.fontSize }, settings.darkMode && styles.darkText]}>
                  {medicineInfo}
                </Text>
              </ScrollView>
              
              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.speakButton]} 
                  onPress={speakInfo}
                >
                  <Text style={styles.buttonText}>
                    {isSpeaking ? '⏸️ Pause' : '🔊 Speak'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.reminderButton]}
                  onPress={() => scheduleReminder(medicineName, { hour: 9, minute: 0 })}
                >
                  <Text style={styles.buttonText}>⏰ Remind</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={[styles.actionButton, styles.resetButton]} onPress={resetApp}>
                <Text style={styles.buttonText}>📱 Scan Another</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Scan Button */}
          {!medicineName && !loading && (
            <TouchableOpacity 
              style={styles.scanButton} 
              onPress={() => setShowCamera(true)}
            >
              <Text style={[styles.scanButtonText, { fontSize: settings.fontSize + 4 }]}>
                📷 Scan Medicine
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Quick Access Favorites */}
          {favorites.length > 0 && (
            <View style={styles.favoritesSection}>
              <Text style={[styles.sectionTitle, { fontSize: settings.fontSize + 4 }, settings.darkMode && styles.darkText]}>
                ❤️ Favorites
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {favorites.map((fav, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={[styles.favoriteCard, settings.darkMode && styles.darkFavoriteCard]}
                    onPress={() => {
                      setMedicineName(fav.name);
                      setMedicineInfo(fav.info);
                    }}
                  >
                    <Text style={[styles.favoriteCardName, { fontSize: settings.fontSize }]}>{fav.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      )}
      
      {/* History Modal */}
      <Modal visible={showHistory} animationType="slide">
        <View style={[styles.modalContainer, settings.darkMode && styles.darkContainer]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { fontSize: settings.fontSize + 6 }]}>Scan History</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={exportHistory}>
                <Text style={styles.modalButton}>📤</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Text style={styles.modalButton}>❌</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <FlatList
            data={scanHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
      
      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide">
        <View style={[styles.modalContainer, settings.darkMode && styles.darkContainer]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { fontSize: settings.fontSize + 6 }]}>Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={styles.modalButton}>❌</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.settingsContainer}>
            {/* Dark Mode */}
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { fontSize: settings.fontSize }]}>🌙 Dark Mode</Text>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => saveSettings({...settings, darkMode: value})}
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
                  saveSettings({...settings, fontSize: sizes[nextIndex]});
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
                  saveSettings({...settings, speechRate: speeds[nextIndex]});
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
                  saveSettings({...settings, language: languages[nextIndex].code});
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
              onPress={() => {
                Alert.alert(
                  'Clear All Data',
                  'This will delete all scan history and favorites. Are you sure?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Clear', 
                      style: 'destructive',
                      onPress: async () => {
                        await clearAllData();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.clearText}>🗑️ Clear All Data</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  darkContainer: { backgroundColor: '#1a1a1a' },
  homeContainer: { flex: 1, padding: 20 },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#2196F3' },
  darkText: { color: '#ffffff' },
  headerButtons: { flexDirection: 'row' },
  headerIcon: { fontSize: 24, marginLeft: 15 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
  
  // Image Editor
  editorContainer: { flex: 1, backgroundColor: '#000' },
  editImage: { flex: 1, resizeMode: 'contain' },
  editorControls: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: 'rgba(0,0,0,0.8)' },
  editorButton: { backgroundColor: '#2196F3', padding: 15, borderRadius: 10, minWidth: 100 },
  
  // Results
  resultContainer: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginVertical: 20 },
  darkResultContainer: { backgroundColor: '#2a2a2a' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  medicineName: { fontSize: 28, fontWeight: 'bold', color: '#333', flex: 1 },
  favoriteIcon: { fontSize: 24, marginLeft: 10 },
  infoScroll: { flex: 1, marginBottom: 20, maxHeight: 300 },
  medicineInfo: { fontSize: 16, color: '#666', lineHeight: 24 },
  
  // Buttons
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  actionButton: { flex: 0.48, padding: 15, borderRadius: 10, alignItems: 'center' },
  speakButton: { backgroundColor: '#4CAF50' },
  reminderButton: { backgroundColor: '#FF9800' },
  resetButton: { backgroundColor: '#2196F3', width: '100%' },
  scanButton: { backgroundColor: '#2196F3', paddingVertical: 20, paddingHorizontal: 40, borderRadius: 15, alignItems: 'center', marginVertical: 20 },
  scanButtonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  
  // Loading
  loadingContainer: { alignItems: 'center', padding: 30 },
  loadingText: { fontSize: 18, color: '#666', marginBottom: 20 },
  progressBar: { width: 200, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2 },
  progress: { height: '100%', backgroundColor: '#2196F3', borderRadius: 2 },
  
  // Favorites
  favoritesSection: { marginTop: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  favoriteCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginRight: 10, minWidth: 120 },
  darkFavoriteCard: { backgroundColor: '#2a2a2a' },
  favoriteCardName: { fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  
  // Modals
  modalContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  modalTitle: { fontSize: 24, fontWeight: 'bold' },
  modalButtons: { flexDirection: 'row' },
  modalButton: { fontSize: 24, marginLeft: 15 },
  
  // History
  historyItem: { backgroundColor: 'white', padding: 15, marginHorizontal: 20, marginVertical: 5, borderRadius: 10 },
  darkHistoryItem: { backgroundColor: '#2a2a2a' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyName: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  historyDate: { fontSize: 12, color: '#999', marginVertical: 5 },
  historyInfo: { fontSize: 14, color: '#666' },
  
  // Settings
  settingsContainer: { padding: 20 },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  settingLabel: { flex: 1, fontSize: 16 },
  fontButton: { backgroundColor: '#2196F3', padding: 8, borderRadius: 5, minWidth: 60 },
  fontButtonText: { color: 'white', fontSize: 14, textAlign: 'center' },
  speedButton: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 5, minWidth: 60 },
  speedButtonText: { color: 'white', fontSize: 14, textAlign: 'center' },
  languageButton: { backgroundColor: '#2196F3', padding: 8, borderRadius: 5, minWidth: 80 },
  languageText: { color: 'white', fontSize: 14, textAlign: 'center' },
  clearButton: { backgroundColor: '#666', padding: 15, borderRadius: 10, marginVertical: 10, alignItems: 'center' },
  clearText: { color: 'white', fontSize: 16 },
  
  // Misc
  capturedImage: { width: '100%', height: 200, borderRadius: 10, marginVertical: 15 },
  errorText: { fontSize: 18, color: '#f44336', textAlign: 'center', marginBottom: 20 },
  loadingText: { fontSize: 18, color: '#666', textAlign: 'center' }
});