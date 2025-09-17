import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { styles } from '../styles/AppStyles';

const HistoryModal = ({ 
  visible, 
  onClose, 
  scanHistory, 
  favorites, 
  settings, 
  onSelectHistory, 
  onToggleFavorite, 
  onExportHistory 
}) => {
  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.historyItem, settings.darkMode && styles.darkHistoryItem]}
      onPress={() => onSelectHistory(item)}
    >
      <View style={styles.historyHeader}>
        <Text style={[styles.historyName, { fontSize: settings.fontSize + 2 }]}>{item.name}</Text>
        <TouchableOpacity onPress={() => onToggleFavorite(item)}>
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

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.modalContainer, settings.darkMode && styles.darkContainer]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { fontSize: settings.fontSize + 6 }]}>Scan History</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onExportHistory}>
              <Text style={styles.modalButton}>📤</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
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
  );
};

export default HistoryModal;