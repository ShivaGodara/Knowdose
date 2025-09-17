import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

export const createTTSSummary = (info, name, language = 'en-US') => {
  console.log('TTS Input info:', info);
  const lines = info.split('\n').filter(line => line.trim());
  
  let uses = [];
  let dosageForm = '';
  let precautions = [];
  let sideEffects = [];
  let currentSection = '';
  
  // Parse sections from the medicine info
  for (let line of lines) {
    const cleanLine = line.replace(/^•\s*/, '').trim();
    const lowerLine = line.toLowerCase();
    
    // Identify sections
    if (lowerLine.includes('common use') || lowerLine.includes('uses:')) {
      currentSection = 'uses';
      if (lowerLine.includes('common use:')) {
        const useText = cleanLine.replace(/common use:/i, '').trim();
        if (useText.length > 3) uses.push(useText);
      }
      continue;
    } else if (lowerLine.includes('dosage form') || lowerLine.includes('form:')) {
      currentSection = 'form';
      if (lowerLine.includes('dosage form:')) {
        const formText = cleanLine.replace(/common dosage form:/i, '').trim();
        if (formText.length > 3) dosageForm = formText;
      }
      continue;
    } else if (lowerLine.includes('precautions') || lowerLine.includes('precaution:') || lowerLine.includes('warnings')) {
      currentSection = 'precautions';
      continue;
    } else if (lowerLine.includes('side effects') || lowerLine.includes('effects:')) {
      currentSection = 'sideEffects';
      continue;
    }
    
    // Skip irrelevant content
    if (cleanLine.length < 3 || 
        lowerLine.includes('medicine name') || 
        lowerLine.includes('expiry date') ||
        lowerLine.includes('dosage instructions') ||
        lowerLine.includes('disclaimer') ||
        lowerLine.includes('based on the image')) {
      continue;
    }
    
    // Categorize content
    if (currentSection === 'uses' && cleanLine.length > 3) {
      uses.push(cleanLine);
    } else if (currentSection === 'form' && cleanLine.length > 3) {
      dosageForm = cleanLine;
    } else if (currentSection === 'precautions' && cleanLine.length > 3) {
      precautions.push(cleanLine);
    } else if (currentSection === 'sideEffects' && cleanLine.length > 3) {
      sideEffects.push(cleanLine);
    }
  }
  
  // Language-specific labels for TTS
  const ttsLabels = {
    'en-US': {
      medicineName: 'Medicine name:',
      commonUses: 'Common uses:',
      dosageForm: 'Common dosage form:',
      keyPrecautions: 'Key precautions:',
      sideEffects: 'Common side effects:'
    },
    'hi-IN': {
      medicineName: 'दवा का नाम:',
      commonUses: 'सामान्य उपयोग:',
      dosageForm: 'सामान्य खुराक का रूप:',
      keyPrecautions: 'मुख्य सावधानियां:',
      sideEffects: 'सामान्य दुष्प्रभाव:'
    },
    'kn-IN': {
      medicineName: 'ಔಷಧದ ಹೆಸರು:',
      commonUses: 'ಸಾಮಾನ್ಯ ಬಳಕೆಗಳು:',
      dosageForm: 'ಸಾಮಾನ್ಯ ಔಷಧ ರೂಪ:',
      keyPrecautions: 'ಮುಖ್ಯ ಎಚ್ಚರಿಕೆಗಳು:',
      sideEffects: 'ಸಾಮಾನ್ಯ ಅಡ್ಡ ಪರಿಣಾಮಗಳು:'
    }
  };
  
  const currentLabels = ttsLabels[language] || ttsLabels['en-US'];
  
  // Build structured TTS summary
  let summary = [];
  
  const cleanName = name.replace(/\*\*/g, '').trim();
  summary.push(`${currentLabels.medicineName} ${cleanName}.`);
  
  if (uses.length > 0) {
    summary.push(`${currentLabels.commonUses} ${uses.slice(0, 3).join(', ')}.`);
  }
  
  if (dosageForm) {
    summary.push(`${currentLabels.dosageForm} ${dosageForm}.`);
  }
  
  if (precautions.length > 0) {
    summary.push(`${currentLabels.keyPrecautions} ${precautions.slice(0, 2).join(', ')}.`);
  }
  
  if (sideEffects.length > 0) {
    summary.push(`${currentLabels.sideEffects} ${sideEffects.slice(0, 2).join(', ')}.`);
  }
  
  return summary.join(' ');
};

export const speakMedicineInfo = (medicineName, medicineInfo, settings, isSpeaking, setIsSpeaking) => {
  if (medicineName && medicineInfo && !isSpeaking) {
    const summary = createTTSSummary(medicineInfo, medicineName, settings.language);
    
    setIsSpeaking(true);
    
    Speech.speak(summary, {
      language: settings.language,
      pitch: 1.0,
      rate: settings.speechRate,
      onStart: () => {
        console.log('Speaking:', summary);
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