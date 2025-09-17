import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { CameraView } from 'expo-camera';
import * as Haptics from 'expo-haptics';

const CameraScreen = ({ onCapture, onClose, settings, onSettingsChange }) => {
  const cameraRef = useRef(null);
  const [zoom, setZoom] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Animate capture button
        Animated.sequence([
          Animated.timing(scaleAnim, { duration: 100, toValue: 0.9, useNativeDriver: true }),
          Animated.timing(scaleAnim, { duration: 100, toValue: 1, useNativeDriver: true })
        ]).start();
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true
        });
        
        onCapture(photo);
      } catch (error) {
        console.log('Camera error:', error);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        ref={cameraRef}
        facing="back"
        zoom={zoom}
        enableTorch={settings.flashEnabled}
      />
      
      {/* Modern Camera Overlay */}
      <View style={styles.overlay}>
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity 
            style={styles.modernControlButton}
            onPress={() => onSettingsChange({...settings, flashEnabled: !settings.flashEnabled})}
          >
            <Text style={styles.controlIcon}>{settings.flashEnabled ? '🔦' : '💡'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.modernControlButton} onPress={onClose}>
            <Text style={styles.controlIcon}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {/* Center Focus Area */}
        <View style={styles.focusArea}>
          <View style={styles.focusFrame} />
          <Text style={styles.focusText}>Position medicine package within frame</Text>
        </View>
        
        {/* Zoom Control */}
        <View style={styles.zoomContainer}>
          <TouchableOpacity 
            style={styles.zoomButton}
            onPress={() => setZoom(zoom < 1 ? zoom + 0.2 : 0)}
          >
            <Text style={styles.zoomText}>🔍</Text>
            <Text style={styles.zoomValue}>{Math.round(zoom * 100)}%</Text>
          </TouchableOpacity>
        </View>
        
        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.captureArea}>
            <Animated.View style={[styles.captureButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
              <TouchableOpacity 
                style={[styles.captureButton, isCapturing && styles.capturingButton]} 
                onPress={takePicture}
                disabled={isCapturing}
              >
                <View style={styles.captureButtonInner}>
                  <Text style={styles.captureButtonText}>
                    {isCapturing ? '⏳' : '📷'}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
            <Text style={styles.captureHint}>Tap to capture</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  
  topControls: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 20, 
    paddingTop: 60 
  },
  modernControlButton: { 
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 20,
    backdropFilter: 'blur(10px)'
  },
  controlIcon: { 
    fontSize: 20, 
    color: 'white',
    textAlign: 'center'
  },
  
  focusArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  focusFrame: {
    width: 280,
    height: 200,
    borderWidth: 3,
    borderColor: '#3b82f6',
    borderRadius: 20,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(59, 130, 246, 0.1)'
  },
  focusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  
  zoomContainer: { 
    position: 'absolute', 
    right: 20, 
    top: '50%',
    transform: [{ translateY: -40 }]
  },
  zoomButton: { 
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 60
  },
  zoomText: { 
    color: 'white', 
    fontSize: 16,
    marginBottom: 4
  },
  zoomValue: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  
  bottomControls: { 
    paddingBottom: 50,
    alignItems: 'center'
  },
  captureArea: {
    alignItems: 'center'
  },
  captureButtonContainer: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10
  },
  captureButton: { 
    backgroundColor: '#3b82f6',
    width: 80, 
    height: 80, 
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white'
  },
  capturingButton: {
    backgroundColor: '#10b981'
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  captureButtonText: { 
    fontSize: 28,
    color: 'white'
  },
  captureHint: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12
  }
});

export default CameraScreen;