import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Base containers
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  darkContainer: { 
    backgroundColor: '#0f172a' 
  },
  homeContainer: { 
    flex: 1, 
    paddingHorizontal: 20,
    paddingTop: 60
  },
  
  // Header with gradient-like effect
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#1e40af',
    letterSpacing: -0.5
  },
  darkText: { 
    color: '#f1f5f9' 
  },
  headerButtons: { 
    flexDirection: 'row',
    gap: 15
  },
  headerIcon: { 
    fontSize: 24,
    backgroundColor: '#e0e7ff',
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden'
  },
  subtitle: { 
    fontSize: 16, 
    color: '#64748b', 
    marginBottom: 40, 
    textAlign: 'center',
    fontWeight: '500'
  },
  
  // Modern scan button with shadow
  scanButton: { 
    backgroundColor: '#3b82f6',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 15,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8
  },
  galleryButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 15,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6
  },
  scanOptionsContainer: {
    alignItems: 'center',
    marginVertical: 40
  },
  scanButtonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: '700',
    letterSpacing: 0.5
  },
  
  // Card-based results with modern styling
  resultContainer: { 
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 24,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  darkResultContainer: { 
    backgroundColor: '#1e293b',
    borderColor: '#334155'
  },
  resultHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  medicineName: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#1e293b', 
    flex: 1,
    letterSpacing: -0.3
  },
  favoriteIcon: { 
    fontSize: 28,
    padding: 8
  },
  
  // Improved info display
  infoScroll: { 
    maxHeight: 280,
    marginBottom: 24
  },
  medicineInfo: { 
    fontSize: 16, 
    color: '#475569', 
    lineHeight: 26,
    fontWeight: '400'
  },
  
  // Modern button design
  actionButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20,
    gap: 12
  },
  actionButton: { 
    flex: 0.48, 
    paddingVertical: 16, 
    paddingHorizontal: 20,
    borderRadius: 16, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  speakButton: { 
    backgroundColor: '#10b981',
    shadowColor: '#10b981'
  },
  reminderButton: { 
    backgroundColor: '#f59e0b',
    shadowColor: '#f59e0b'
  },
  resetButton: { 
    backgroundColor: '#3b82f6', 
    width: '100%',
    shadowColor: '#3b82f6'
  },
  buttonText: { 
    color: 'white', 
    fontSize: 15, 
    fontWeight: '600',
    letterSpacing: 0.3
  },
  
  // Enhanced loading state
  loadingContainer: { 
    alignItems: 'center', 
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
  loadingText: { 
    fontSize: 18, 
    color: '#475569', 
    marginBottom: 24,
    fontWeight: '600'
  },
  progressBar: { 
    width: 240, 
    height: 6, 
    backgroundColor: '#e2e8f0', 
    borderRadius: 3,
    overflow: 'hidden'
  },
  progress: { 
    height: '100%', 
    backgroundColor: '#3b82f6', 
    borderRadius: 3
  },
  
  // Modern favorites section
  favoritesSection: { 
    marginTop: 40,
    marginBottom: 20
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 16,
    color: '#1e293b',
    letterSpacing: -0.3
  },
  favoriteCard: { 
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  darkFavoriteCard: { 
    backgroundColor: '#1e293b',
    borderColor: '#334155'
  },
  favoriteCardName: { 
    fontSize: 14, 
    fontWeight: '600', 
    textAlign: 'center',
    color: '#374151'
  },
  
  // Enhanced modals
  modalContainer: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 24, 
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.3
  },
  modalButtons: { 
    flexDirection: 'row',
    gap: 16
  },
  modalButton: { 
    fontSize: 24,
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden'
  },
  
  // Modern history items
  historyItem: { 
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  darkHistoryItem: { 
    backgroundColor: '#1e293b',
    borderColor: '#334155'
  },
  historyHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 8
  },
  historyName: { 
    fontSize: 18, 
    fontWeight: '600', 
    flex: 1,
    color: '#1e293b',
    letterSpacing: -0.2
  },
  historyDate: { 
    fontSize: 12, 
    color: '#94a3b8', 
    marginVertical: 6,
    fontWeight: '500'
  },
  historyInfo: { 
    fontSize: 14, 
    color: '#64748b',
    lineHeight: 20
  },
  
  // Enhanced settings
  settingsContainer: { 
    padding: 20 
  },
  settingItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginVertical: 4,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  settingLabel: { 
    flex: 1, 
    fontSize: 16,
    fontWeight: '500',
    color: '#374151'
  },
  
  // Modern control buttons
  fontButton: { 
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 70,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  fontButtonText: { 
    color: 'white', 
    fontSize: 14, 
    textAlign: 'center',
    fontWeight: '600'
  },
  speedButton: { 
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 70,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  speedButtonText: { 
    color: 'white', 
    fontSize: 14, 
    textAlign: 'center',
    fontWeight: '600'
  },
  languageButton: { 
    backgroundColor: '#8b5cf6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 90,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  languageText: { 
    color: 'white', 
    fontSize: 14, 
    textAlign: 'center',
    fontWeight: '600'
  },
  clearButton: { 
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginVertical: 20,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  clearText: { 
    color: 'white', 
    fontSize: 16,
    fontWeight: '600'
  },
  
  // Enhanced image display
  capturedImage: { 
    width: '100%', 
    height: 220, 
    borderRadius: 20, 
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
  
  // Camera and editor improvements
  editorContainer: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  editImage: { 
    flex: 1, 
    resizeMode: 'contain' 
  },
  editorControls: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.9)',
    gap: 16
  },
  editorButton: { 
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6
  },
  
  // Verification badge
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#16a34a'
  },
  unverifiedBadge: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#d97706'
  },
  errorBadge: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#dc2626'
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4
  },
  verifiedText: {
    color: '#16a34a'
  },
  unverifiedText: {
    color: '#d97706'
  },
  // Error states
  errorText: { 
    fontSize: 18, 
    color: '#ef4444', 
    textAlign: 'center', 
    marginBottom: 24,
    fontWeight: '600',
    paddingHorizontal: 20
  },
  loadingText: { 
    fontSize: 18, 
    color: '#64748b', 
    textAlign: 'center',
    fontWeight: '500'
  }
});