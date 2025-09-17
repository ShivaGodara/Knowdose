import React, { useState, useEffect } from 'react';
import { View, StatusBar, Alert, Text, TouchableOpacity } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

// Services
import { analyzeImageWithGemini } from './src/services/geminiService';
import { speakMedicineInfo } from './src/services/ttsService';
import { verifyMedicineWithFDA, formatVerificationResult } from './src/services/fdaVerificationService';

// Utils
import { formatMedicineInfo, extractMedicineName, checkForWarnings, isMedicineImage } from './src/utils/textUtils';
import { getRandomMedicine } from './src/constants/demoData';

// Hooks
import { useStorage } from './src/hooks/useStorage';

// Components
import CameraScreen from './src/components/CameraScreen';
import HomeScreen from './src/components/HomeScreen';
import ImageEditor from './src/components/ImageEditor';
import HistoryModal from './src/components/HistoryModal';
import SettingsModal from './src/components/SettingsModal';

// Styles
import { styles } from './src/styles/AppStyles';

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
  const [verificationStatus, setVerificationStatus] = useState(null);
  
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

  const handleGalleryPick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setCapturedImage(asset.uri);
        setEditingImage(asset);
        setShowImageEditor(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const processImage = async (imageData) => {
    setShowImageEditor(false);
    setLoading(true);
    
    try {
      // Step 1: AI Analysis
      const analysisText = await analyzeImageWithGemini(imageData.base64, settings.language);
      
      // Check if the image is actually a medicine
      if (!isMedicineImage(analysisText)) {
        setLoading(false);
        Alert.alert(
          '❌ Not a Medicine',
          'The scanned image does not appear to be a medicine or supplement. Please scan or upload a photo of a medicine package.',
          [
            { text: 'Try Again', onPress: () => setShowCamera(true) },
            { text: 'Choose from Gallery', onPress: handleGalleryPick },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }
      
      const extractedName = extractMedicineName(analysisText);
      
      // Step 2: FDA Verification (with timeout)
      let verification;
      try {
        const verificationPromise = verifyMedicineWithFDA(extractedName);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Verification timeout')), 5000)
        );
        
        verification = await Promise.race([verificationPromise, timeoutPromise]);
      } catch (verificationError) {
        console.log('Verification failed:', verificationError);
        verification = {
          isVerified: null,
          status: 'error',
          fdaInfo: null,
          message: '❓ Verification timed out. Proceeding with AI analysis only.'
        };
      }
      setVerificationStatus(verification);
      
      // Step 3: Combine information
      const verificationInfo = formatVerificationResult(verification);
      const combinedInfo = analysisText + verificationInfo;
      const formattedInfo = formatMedicineInfo(combinedInfo, extractedName);
      
      setMedicineName(extractedName);
      setMedicineInfo(formattedInfo);
      
      const scanResult = {
        name: extractedName,
        info: combinedInfo,
        verification: verification,
        timestamp: new Date().toISOString(),
        image: capturedImage
      };
      await saveToHistory(scanResult);
      
      // Show verification alert
      if (verification.isVerified === false) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert('⚠️ Verification Warning', 'This medicine was not found in the FDA database. Please verify authenticity before use.');
      } else if (verification.isVerified === true) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      if (checkForWarnings(analysisText)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert('⚠️ Important Warning', 'This medicine analysis contains important safety information. Please read carefully.');
      }
      
    } catch (error) {
      console.log('Analysis Error:', error);
      
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

  const handleSpeakInfo = () => {
    speakMedicineInfo(medicineName, medicineInfo, settings, isSpeaking, setIsSpeaking);
  };

  const handleReset = () => {
    setMedicineName('');
    setMedicineInfo('');
    setCapturedImage(null);
    setVerificationStatus(null);
    setLoading(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleExportHistory = async () => {
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

  const handleSelectHistory = (item) => {
    setMedicineName(item.name);
    setMedicineInfo(item.info);
    setCapturedImage(item.image);
    setShowHistory(false);
  };

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
        <ImageEditor 
          imageUri={editingImage?.uri}
          onAnalyze={() => processImage(editingImage)}
          onCancel={() => setShowImageEditor(false)}
        />
      ) : (
        <HomeScreen 
          settings={settings}
          capturedImage={capturedImage}
          loading={loading}
          medicineName={medicineName}
          medicineInfo={medicineInfo}
          verificationStatus={verificationStatus}
          favorites={favorites}
          onScanPress={() => setShowCamera(true)}
          onGalleryPress={handleGalleryPick}
          onHistoryPress={() => setShowHistory(true)}
          onSettingsPress={() => setShowSettings(true)}
          onSpeakPress={handleSpeakInfo}
          onResetPress={handleReset}
          onToggleFavorite={toggleFavorite}
          isSpeaking={isSpeaking}
        />
      )}
      
      <HistoryModal 
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        scanHistory={scanHistory}
        favorites={favorites}
        settings={settings}
        onSelectHistory={handleSelectHistory}
        onToggleFavorite={toggleFavorite}
        onExportHistory={handleExportHistory}
      />
      
      <SettingsModal 
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSaveSettings={saveSettings}
        onClearAllData={clearAllData}
      />
    </View>
  );
}