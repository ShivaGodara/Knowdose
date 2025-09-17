import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStorage = () => {
  const [scanHistory, setScanHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [settings, setSettings] = useState({
    darkMode: false,
    fontSize: 16,
    speechRate: 0.75,
    flashEnabled: false,
    autoScan: false,
    language: 'en-US',
    voiceQuality: 'enhanced'
  });

  useEffect(() => {
    loadSettings();
    loadHistory();
    loadFavorites();
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
    } catch (error) {
      console.log('Error toggling favorite:', error);
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove(['scanHistory', 'favorites']);
      setScanHistory([]);
      setFavorites([]);
    } catch (error) {
      console.log('Error clearing data:', error);
    }
  };

  return {
    scanHistory,
    favorites,
    settings,
    saveSettings,
    saveToHistory,
    toggleFavorite,
    clearAllData
  };
};