import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles/AppStyles';

const HomeScreen = ({ 
  settings, 
  capturedImage, 
  loading, 
  medicineName, 
  medicineInfo, 
  verificationStatus,
  favorites, 
  onScanPress,
  onGalleryPress, 
  onHistoryPress, 
  onSettingsPress, 
  onSpeakPress, 
  onResetPress, 
  onToggleFavorite,
  isSpeaking 
}) => {
  const renderVerificationBadge = () => {
    if (!verificationStatus) return null;
    
    let badgeStyle, textStyle, icon, text;
    
    if (verificationStatus.isVerified === true) {
      badgeStyle = [styles.verificationBadge, styles.verifiedBadge];
      textStyle = [styles.verificationText, styles.verifiedText];
      icon = '✅';
      text = 'FDA Verified';
    } else if (verificationStatus.isVerified === false) {
      if (verificationStatus.status === 'supplement') {
        badgeStyle = [styles.verificationBadge, styles.unverifiedBadge];
        textStyle = [styles.verificationText, styles.unverifiedText];
        icon = '🌿';
        text = 'Supplement';
      } else {
        badgeStyle = [styles.verificationBadge, styles.unverifiedBadge];
        textStyle = [styles.verificationText, styles.unverifiedText];
        icon = '⚠️';
        text = 'Not FDA Verified';
      }
    } else {
      badgeStyle = [styles.verificationBadge, styles.errorBadge];
      textStyle = [styles.verificationText, { color: '#dc2626' }];
      icon = '❓';
      text = 'Verification Error';
    }
    
    return (
      <View style={badgeStyle}>
        <Text>{icon}</Text>
        <Text style={textStyle}>{text}</Text>
      </View>
    );
  };
  
  return (
  <ScrollView 
    style={styles.homeContainer} 
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: 40 }}
  >
    {/* Modern Header */}
    <View style={styles.header}>
      <View>
        <Text style={[styles.title, { fontSize: settings.fontSize + 20 }, settings.darkMode && styles.darkText]}>
          KnowDose
        </Text>
        <Text style={[styles.subtitle, { fontSize: settings.fontSize - 2 }, settings.darkMode && styles.darkText]}>
          AI-Powered Medicine Scanner
        </Text>
      </View>
      <View style={styles.headerButtons}>
        <TouchableOpacity 
          onPress={onHistoryPress}
          style={[styles.headerIcon, { backgroundColor: settings.darkMode ? '#334155' : '#e0e7ff' }]}
        >
          <Text style={{ fontSize: 20 }}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onSettingsPress}
          style={[styles.headerIcon, { backgroundColor: settings.darkMode ? '#334155' : '#e0e7ff' }]}
        >
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
    
    {/* Captured Image with modern styling */}
    {capturedImage && (
      <View style={{ alignItems: 'center' }}>
        <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
        <Text style={[{ fontSize: settings.fontSize - 2, color: '#64748b', marginTop: 8 }]}>
          Captured Image
        </Text>
      </View>
    )}
    
    {/* Enhanced Loading State */}
    {loading && (
      <View style={[styles.loadingContainer, settings.darkMode && { backgroundColor: '#1e293b' }]}>
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginBottom: 16 }} />
        <Text style={[styles.loadingText, { fontSize: settings.fontSize + 2 }]}>
          🔍 Analyzing medicine...
        </Text>
        <Text style={[{ fontSize: settings.fontSize - 2, color: '#94a3b8', textAlign: 'center', marginTop: 8 }]}>
          Please wait while we process your image
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '75%' }]} />
        </View>
      </View>
    )}
    
    {/* Enhanced Results Card */}
    {medicineName && !loading && (
      <View style={[styles.resultContainer, settings.darkMode && styles.darkResultContainer]}>
        <View style={[styles.resultHeader, settings.darkMode && { borderBottomColor: '#334155' }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.medicineName, { fontSize: settings.fontSize + 12 }, settings.darkMode && styles.darkText]}>
              {medicineName}
            </Text>
            {renderVerificationBadge()}
            <Text style={[{ fontSize: settings.fontSize - 2, color: '#94a3b8', marginTop: 4 }]}>
              Medicine Information
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => onToggleFavorite({ name: medicineName, info: medicineInfo })}
            style={{ padding: 8 }}
          >
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
        
        {/* Enhanced Action Buttons */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.speakButton, { width: '100%', marginBottom: 12 }]} 
          onPress={onSpeakPress}
        >
          <Text style={styles.buttonText}>
            {isSpeaking ? '⏸️ Pause' : '🔊 Listen'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.resetButton]} onPress={onResetPress}>
          <Text style={styles.buttonText}>📱 Scan Another Medicine</Text>
        </TouchableOpacity>
      </View>
    )}
    
    {/* Enhanced Scan Options */}
    {!medicineName && !loading && (
      <View style={styles.scanOptionsContainer}>
        <TouchableOpacity 
          style={styles.scanButton} 
          onPress={onScanPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.scanButtonText, { fontSize: settings.fontSize + 4 }]}>
            📷 Take Photo
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.galleryButton} 
          onPress={onGalleryPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.scanButtonText, { fontSize: settings.fontSize + 4 }]}>
            🖼️ Choose from Gallery
          </Text>
        </TouchableOpacity>
        
        <Text style={[{ fontSize: settings.fontSize - 2, color: '#94a3b8', textAlign: 'center', marginTop: 20, paddingHorizontal: 40 }]}>
          Take a photo or select from your gallery to get instant AI-powered medicine information
        </Text>
      </View>
    )}
    
    {/* Enhanced Favorites Section */}
    {favorites.length > 0 && (
      <View style={styles.favoritesSection}>
        <Text style={[styles.sectionTitle, { fontSize: settings.fontSize + 4 }, settings.darkMode && styles.darkText]}>
          ❤️ Your Favorites
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
          {favorites.map((fav, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.favoriteCard, settings.darkMode && styles.darkFavoriteCard]}
              onPress={() => {
                // Handle favorite selection
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.favoriteCardName, { fontSize: settings.fontSize }, settings.darkMode && styles.darkText]}>
                {fav.name}
              </Text>
              <Text style={[{ fontSize: settings.fontSize - 4, color: '#94a3b8', textAlign: 'center', marginTop: 4 }]}>
                Tap to view
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )}
  </ScrollView>
  );
};

export default HomeScreen;