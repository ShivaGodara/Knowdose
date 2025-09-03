import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Alert, Image, 
  ScrollView, Switch, Modal, FlatList, Dimensions, StatusBar,
  TextInput
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import * as ImageManipulator from 'expo-image-manipulator';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [medicineInfo, setMedicineInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    darkMode: false,
    fontSize: 16,
    speechRate: 0.75,
    flashEnabled: false,
    autoScan: false,
    language: 'en-US',
    voiceQuality: 'enhanced'
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechProgress, setSpeechProgress] = useState(0);
  const [zoom, setZoom] = useState(0);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  
  const cameraRef = useRef(null);

  useEffect(() => {
    loadSettings();
    loadHistory();
    loadFavorites();
    setupNotifications();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('settings');
      if (saved) setSettings(JSON.parse(saved));
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('scanHistory');
      if (saved) setScanHistory(JSON.parse(saved));
    } catch (error) {
      console.log('Error loading history:', error);
    }
  };

  const saveToHistory = async (scan) => {
    try {
      const newHistory = [scan, ...scanHistory.slice(0, 49)]; // Keep last 50
      setScanHistory(newHistory);
      await AsyncStorage.setItem('scanHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.log('Error saving to history:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const saved = await AsyncStorage.getItem('favorites');
      if (saved) setFavorites(JSON.parse(saved));
    } catch (error) {
      console.log('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (medicine) => {
    try {
      const isFavorite = favorites.some(fav => fav.name === medicine.name);
      let newFavorites;
      
      if (isFavorite) {
        newFavorites = favorites.filter(fav => fav.name !== medicine.name);
      } else {
        newFavorites = [...favorites, medicine];
      }
      
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Error toggling favorite:', error);
    }
  };

  const setupNotifications = async () => {
    // Notifications not supported in Expo Go SDK 53
    console.log('Notifications setup skipped - use development build for full support');
  };

  const scheduleReminder = async (medicineName, time) => {
    Alert.alert('Reminder', `Reminder set for ${medicineName}! (Note: Full reminder functionality requires development build)`);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true
        });
        
        setCapturedImage(photo.uri);
        setEditingImage(photo);
        setShowCamera(false);
        setShowImageEditor(true);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const processImage = async (imageData) => {
    setShowImageEditor(false);
    await analyzeImageWithGemini(imageData.base64);
  };

  const cropImage = async (cropData) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        editingImage.uri,
        [{ crop: cropData }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      
      setEditingImage(manipResult);
    } catch (error) {
      console.log('Crop error:', error);
    }
  };

  const analyzeImageWithGemini = async (base64Image) => {
    setLoading(true);
    
    try {
      const API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // Replace with your actual API key
      
      const getLanguagePrompt = (language) => {
        const prompts = {
          'en-US': `Analyze this medicine image and provide comprehensive information:
                1. Medicine name
                2. What it's commonly used for (in simple terms)
                3. Common dosage form (tablet, syrup, etc.)
                4. Key precautions and warnings
                5. Common side effects
                6. Expiry date if visible
                7. Dosage instructions if visible
                
                Format your response clearly for a general audience. If you can't identify the medicine clearly, say so.`,
          'hi-IN': `इस दवा की तस्वीर का विश्लेषण करें और व्यापक जानकारी प्रदान करें:
                1. दवा का नाम
                2. यह आमतौर पर किस लिए उपयोग की जाती है (सरल भाषा में)
                3. सामान्य खुराक का रूप (गोली, सिरप, आदि)
                4. मुख्य सावधानियां और चेतावनियां
                5. सामान्य दुष्प्रभाव
                6. समाप्ति तिथि यदि दिखाई दे
                7. खुराक के निर्देश यदि दिखाई दें
                
                अपना उत्तर आम लोगों के लिए स्पष्ट रूप से प्रारूपित करें। यदि आप दवा को स्पष्ट रूप से पहचान नहीं सकते हैं, तो ऐसा कहें। हिंदी में उत्तर दें।`,
          'kn-IN': `ಈ ಔಷಧದ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ಸಮಗ್ರ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಿ:
                1. ಔಷಧದ ಹೆಸರು
                2. ಇದನ್ನು ಸಾಮಾನ್ಯವಾಗಿ ಯಾವುದಕ್ಕಾಗಿ ಬಳಸಲಾಗುತ್ತದೆ (ಸರಳ ಪದಗಳಲ್ಲಿ)
                3. ಸಾಮಾನ್ಯ ಔಷಧ ರೂಪ (ಮಾತ್ರೆ, ಸಿರಪ್, ಇತ್ಯಾದಿ)
                4. ಮುಖ್ಯ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳು
                5. ಸಾಮಾನ್ಯ ಅಡ್ಡ ಪರಿಣಾಮಗಳು
                6. ಅವಧಿ ಮುಗಿಯುವ ದಿನಾಂಕ ಕಂಡುಬಂದರೆ
                7. ಔಷಧ ಸೇವನೆಯ ಸೂಚನೆಗಳು ಕಂಡುಬಂದರೆ
                
                ಸಾಮಾನ್ಯ ಜನರಿಗಾಗಿ ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಫಾರ್ಮ್ಯಾಟ್ ಮಾಡಿ. ನೀವು ಔಷಧವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗದಿದ್ದರೆ, ಹಾಗೆ ಹೇಳಿ. ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ।`
        };
        return prompts[language] || prompts['en-US'];
      };
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: getLanguagePrompt(settings.language)
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (analysisText) {
          const lines = analysisText.split('\n');
          const firstLine = lines[0] || analysisText;
          
          let medicineName = 'Medicine';
          const namePatterns = [
            /(?:Medicine name|Name|This is):\s*([^.,\n]+)/i,
            /^([A-Za-z]+(?:\s+[A-Za-z]+)?)/,
            /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/
          ];
          
          for (const pattern of namePatterns) {
            const match = analysisText.match(pattern);
            if (match && match[1]) {
              medicineName = match[1].trim();
              break;
            }
          }
          
          const scanResult = {
            name: medicineName,
            info: analysisText.trim(),
            timestamp: new Date().toISOString(),
            image: capturedImage
          };
          
          setMedicineName(medicineName);
          setMedicineInfo(analysisText.trim());
          await saveToHistory(scanResult);
          
          // Check for warnings
          checkForWarnings(analysisText);
          
        } else {
          throw new Error('No analysis received');
        }
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.log('Analysis Error:', error);
      Alert.alert('Analysis Failed', 'Could not analyze the image. Please try again.');
      setMedicineInfo('Unable to analyze the medicine image. Please ensure the image is clear and try again.');
    }
    
    setLoading(false);
  };

  const checkForWarnings = (analysisText) => {
    const warningKeywords = ['expired', 'dangerous', 'overdose', 'warning', 'caution'];
    const hasWarning = warningKeywords.some(keyword => 
      analysisText.toLowerCase().includes(keyword)
    );
    
    if (hasWarning) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('⚠️ Important Warning', 'This medicine analysis contains important safety information. Please read carefully.');
    }
  };

  const translateToLanguage = (text, targetLang) => {
    // Basic translations for common medicine terms
    const translations = {
      'hi-IN': {
        'Medicine': 'दवा',
        'Use': 'उपयोग',
        'Form': 'रूप',
        'Precaution': 'सावधानी',
        'tablet': 'गोली',
        'syrup': 'सिरप',
        'pain relief': 'दर्द निवारण',
        'fever': 'बुखार',
        'headache': 'सिरदर्द'
      },
      'kn-IN': {
        'Medicine': 'ಔಷಧ',
        'Use': 'ಬಳಕೆ',
        'Form': 'ರೂಪ',
        'Precaution': 'ಎಚ್ಚರಿಕೆ',
        'tablet': 'ಮಾತ್ರೆ',
        'syrup': 'ಸಿರಪ್',
        'pain relief': 'ನೋವು ನಿವಾರಣೆ',
        'fever': 'ಜ್ವರ',
        'headache': 'ತಲೆನೋವು'
      }
    };
    
    if (targetLang === 'en-US') return text;
    
    let translatedText = text;
    const langTranslations = translations[targetLang];
    
    if (langTranslations) {
      Object.keys(langTranslations).forEach(english => {
        const regex = new RegExp(english, 'gi');
        translatedText = translatedText.replace(regex, langTranslations[english]);
      });
    }
    
    return translatedText;
  };

  const cleanTextForSpeech = (text) => {
    return text
      .replace(/\*\*/g, '') // Remove ** markdown
      .replace(/\*/g, '') // Remove * markdown
      .replace(/\#/g, '') // Remove # headers
      .replace(/\d+\./g, '') // Remove numbered lists
      .replace(/\-/g, '') // Remove bullet points
      .replace(/\n\s*\n/g, '. ') // Replace double newlines with period
      .replace(/\n/g, '. ') // Replace single newlines with period
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\.\.+/g, '.') // Replace multiple periods with single
      .trim();
  };

  const extractKeyInfo = (text, medicineName) => {
    // Extract essential information for TTS
    const cleanText = cleanTextForSpeech(text);
    const sentences = cleanText.split(/[.!?]/).filter(s => s.trim().length > 15);
    
    let keyInfo = [];
    keyInfo.push(`Medicine: ${medicineName}`);
    
    // Always include the first 2-3 sentences which usually contain general use
    if (sentences.length > 0) {
      keyInfo.push(sentences[0]); // Usually contains general use
    }
    if (sentences.length > 1) {
      keyInfo.push(sentences[1]); // Usually contains more details
    }
    
    // Look for specific important information
    for (let sentence of sentences.slice(2)) {
      const lowerSentence = sentence.toLowerCase();
      
      // Include precautions and warnings
      if (lowerSentence.includes('precaution') ||
          lowerSentence.includes('warning') ||
          lowerSentence.includes('avoid') ||
          lowerSentence.includes('do not') ||
          lowerSentence.includes('side effect')) {
        keyInfo.push(sentence);
        break; // Only add one warning to keep it concise
      }
    }
    
    return keyInfo.join('. ');
  };

  const speakInfo = () => {
    if (medicineName && medicineInfo && !isSpeaking) {
      // Extract specific information for TTS
      const cleanInfo = medicineInfo.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\#/g, '');
      const lines = cleanInfo.split('\n').filter(line => line.trim());
      
      let speechParts = [];
      
      // Language-specific labels
      const labels = {
        'en-US': { name: 'Medicine name:', use: 'Common use:', expiry: 'Expiry:', precaution: 'Precaution:' },
        'hi-IN': { name: 'दवा का नाम:', use: 'सामान्य उपयोग:', expiry: 'समाप्ति तिथि:', precaution: 'सावधानी:' },
        'kn-IN': { name: 'ಔಷಧದ ಹೆಸರು:', use: 'ಸಾಮಾನ್ಯ ಬಳಕೆ:', expiry: 'ಅವಧಿ ಮುಗಿಯುವ ದಿನಾಂಕ:', precaution: 'ಎಚ್ಚರಿಕೆ:' }
      };
      
      const currentLabels = labels[settings.language] || labels['en-US'];
      speechParts.push(`${currentLabels.name} ${medicineName}`);
      
      // Find common use (multi-language keywords)
      for (let line of lines) {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('used for') || lowerLine.includes('treats') || 
            lowerLine.includes('commonly used') || lowerLine.includes('use:') ||
            lowerLine.includes('उपयोग') || lowerLine.includes('इलाज') ||
            lowerLine.includes('ಬಳಕೆ') || lowerLine.includes('ಚಿಕಿತ್ಸೆ')) {
          speechParts.push(`${currentLabels.use} ${line.replace(/\d+\./g, '').trim()}`);
          break;
        }
      }
      
      // Find expiry date (multi-language keywords)
      for (let line of lines) {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('expiry') || lowerLine.includes('expires') || 
            lowerLine.includes('exp date') || lowerLine.includes('valid until') ||
            lowerLine.includes('समाप्ति') || lowerLine.includes('एक्सपायरी') ||
            lowerLine.includes('ಅವಧಿ') || lowerLine.includes('ಮುಗಿಯುವ')) {
          speechParts.push(`${currentLabels.expiry} ${line.replace(/\d+\./g, '').trim()}`);
          break;
        }
      }
      
      // Find key precautions (multi-language keywords)
      for (let line of lines) {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('precaution') || lowerLine.includes('warning') || 
            lowerLine.includes('avoid') || lowerLine.includes('do not') ||
            lowerLine.includes('सावधानी') || lowerLine.includes('चेतावनी') ||
            lowerLine.includes('ಎಚ್ಚರಿಕೆ') || lowerLine.includes('ಎಚ್ಚರಿಕೆ')) {
          speechParts.push(`${currentLabels.precaution} ${line.replace(/\d+\./g, '').trim()}`);
          break;
        }
      }
      
      const textToSpeak = speechParts.join('. ');
      setIsSpeaking(true);
      
      Speech.speak(textToSpeak, {
        language: settings.language,
        pitch: 1.0,
        rate: settings.speechRate,
        onStart: () => {
          console.log('Speaking:', textToSpeak);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        onDone: () => {
          setIsSpeaking(false);
        },
        onError: (error) => {
          console.log('Speech error:', error);
          setIsSpeaking(false);
        }
      });
    } else if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    }
  };

  const getPreferredVoice = (language) => {
    // Preferred voice identifiers for natural sounding speech
    const voicePreferences = {
      'en-US': 'com.apple.ttsbundle.Samantha-compact', // iOS natural voice
      'hi-IN': 'hi-in-x-hie-local', // Google Hindi voice
      'kn-IN': 'kn-in-x-knf-local'  // Google Kannada voice
    };
    return voicePreferences[language];
  };

  const resetApp = () => {
    setMedicineName('');
    setMedicineInfo('');
    setCapturedImage(null);
    setLoading(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const exportHistory = async () => {
    try {
      const historyText = scanHistory.map(scan => 
        `${scan.name} - ${new Date(scan.timestamp).toLocaleDateString()}\n${scan.info}\n\n`
      ).join('');
      
      // In a real app, you'd use expo-sharing or similar
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
        <View style={styles.cameraContainer}>
          <CameraView 
            style={styles.camera} 
            ref={cameraRef}
            facing="back"
            zoom={zoom}
            enableTorch={settings.flashEnabled}
          />
          
          {/* Camera Controls */}
          <View style={styles.cameraOverlay}>
            <View style={styles.topControls}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={() => saveSettings({...settings, flashEnabled: !settings.flashEnabled})}
              >
                <Text style={styles.controlIcon}>{settings.flashEnabled ? '🔦' : '💡'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.controlIcon}>❌</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.zoomContainer}>
              <TouchableOpacity 
                style={styles.zoomButton}
                onPress={() => setZoom(zoom < 1 ? zoom + 0.2 : 0)}
              >
                <Text style={styles.zoomText}>🔍 {Math.round(zoom * 100)}%</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.bottomControls}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <Text style={styles.captureButtonText}>📷</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
              
              <ScrollView style={styles.infoScroll} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.settingValue}>{settings.fontSize}</Text>
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
              <Text style={styles.settingValue}>{settings.speechRate.toFixed(1)}x</Text>
            </View>
            
            {/* Auto Scan */}
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { fontSize: settings.fontSize }]}>🤖 Auto Scan</Text>
              <Switch
                value={settings.autoScan}
                onValueChange={(value) => saveSettings({...settings, autoScan: value})}
              />
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
            
            {/* Voice Quality */}
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { fontSize: settings.fontSize }]}>🎤 Voice Quality</Text>
              <TouchableOpacity 
                style={styles.qualityButton}
                onPress={() => {
                  const qualities = ['standard', 'enhanced', 'premium'];
                  const currentIndex = qualities.indexOf(settings.voiceQuality);
                  const nextIndex = (currentIndex + 1) % qualities.length;
                  saveSettings({...settings, voiceQuality: qualities[nextIndex]});
                }}
              >
                <Text style={styles.qualityText}>{settings.voiceQuality}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Emergency Contacts */}
            <TouchableOpacity style={styles.emergencyButton}>
              <Text style={styles.emergencyText}>🚨 Emergency Contacts</Text>
            </TouchableOpacity>
            
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
                        await AsyncStorage.multiRemove(['scanHistory', 'favorites']);
                        setScanHistory([]);
                        setFavorites([]);
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
  
  // Camera
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  topControls: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  controlButton: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 25 },
  controlIcon: { fontSize: 20, color: 'white' },
  zoomContainer: { position: 'absolute', right: 20, top: 120, bottom: 120, width: 40, justifyContent: 'center' },

  bottomControls: { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' },
  captureButton: { backgroundColor: '#fff', width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  captureButtonText: { fontSize: 35 },
  
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
  infoScroll: { maxHeight: 200, marginBottom: 20 },
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
  zoomButton: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 20 },
  zoomText: { color: 'white', fontSize: 12 },
  settingValue: { fontSize: 14, color: '#666', minWidth: 40, textAlign: 'center' },
  languageButton: { backgroundColor: '#2196F3', padding: 8, borderRadius: 5, minWidth: 80 },
  languageText: { color: 'white', fontSize: 14, textAlign: 'center' },
  qualityButton: { backgroundColor: '#9C27B0', padding: 8, borderRadius: 5, minWidth: 80 },
  qualityText: { color: 'white', fontSize: 14, textAlign: 'center' },
  emergencyButton: { backgroundColor: '#f44336', padding: 15, borderRadius: 10, marginVertical: 10, alignItems: 'center' },
  emergencyText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  clearButton: { backgroundColor: '#666', padding: 15, borderRadius: 10, marginVertical: 10, alignItems: 'center' },
  clearText: { color: 'white', fontSize: 16 },
  
  // Misc
  capturedImage: { width: '100%', height: 200, borderRadius: 10, marginVertical: 15 },
  errorText: { fontSize: 18, color: '#f44336', textAlign: 'center', marginBottom: 20 },

});