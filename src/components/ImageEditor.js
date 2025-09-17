import React from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import { styles } from '../styles/AppStyles';

const ImageEditor = ({ imageUri, onAnalyze, onCancel }) => (
  <View style={styles.editorContainer}>
    <Image source={{ uri: imageUri }} style={styles.editImage} />
    <View style={styles.editorControls}>
      <TouchableOpacity 
        style={styles.editorButton}
        onPress={onAnalyze}
      >
        <Text style={styles.buttonText}>✅ Analyze</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.editorButton}
        onPress={onCancel}
      >
        <Text style={styles.buttonText}>❌ Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default ImageEditor;