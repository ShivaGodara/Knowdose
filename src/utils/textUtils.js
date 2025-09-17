export const formatMedicineInfo = (rawText, medicineName = '') => {
  // Clean and format the medicine information for better display
  let formatted = rawText
    .replace(/\*\*/g, '') // Remove ** markdown
    .replace(/\*/g, '') // Remove * markdown
    .replace(/#{1,6}\s*/g, '') // Remove # headers
    .replace(/^\d+\.\s*/gm, '• ') // Convert numbered lists to bullets
    .replace(/^-\s*/gm, '• ') // Convert dashes to bullets
    .replace(/\n\s*\n/g, '\n\n') // Clean up extra newlines
    .trim();
  
  // Split into sections and clean each
  const sections = formatted.split('\n\n');
  const cleanSections = sections.map(section => {
    const lines = section.split('\n');
    const cleanLines = lines.map(line => {
      // Remove redundant headings that repeat medicine name
      if (line.toLowerCase().includes('medicine name:') && 
          medicineName && 
          line.toLowerCase().includes(medicineName.toLowerCase())) {
        return null;
      }
      return line.trim();
    }).filter(line => line && line.length > 0);
    
    return cleanLines.join('\n');
  }).filter(section => section.length > 0);
  
  return cleanSections.join('\n\n');
};

export const extractMedicineName = (analysisText) => {
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
  
  return medicineName;
};

export const checkForWarnings = (analysisText) => {
  const warningKeywords = ['expired', 'dangerous', 'overdose', 'warning', 'caution'];
  return warningKeywords.some(keyword => 
    analysisText.toLowerCase().includes(keyword)
  );
};

export const isMedicineImage = (analysisText) => {
  const lowerText = analysisText.toLowerCase();
  
  // Check for medicine-related keywords
  const medicineKeywords = [
    'medicine', 'medication', 'drug', 'tablet', 'capsule', 'pill', 'syrup',
    'injection', 'dose', 'dosage', 'prescription', 'pharmaceutical', 'antibiotic',
    'painkiller', 'supplement', 'vitamin', 'treatment', 'therapy', 'mg', 'ml',
    'expiry', 'batch', 'manufacturer', 'active ingredient', 'side effect'
  ];
  
  // Check for non-medicine indicators
  const nonMedicineKeywords = [
    'food', 'drink', 'beverage', 'snack', 'candy', 'chocolate', 'fruit',
    'vegetable', 'book', 'paper', 'document', 'phone', 'computer', 'car',
    'building', 'person', 'animal', 'plant', 'flower', 'tree', 'furniture',
    'clothing', 'toy', 'game', 'music', 'movie', 'art', 'painting'
  ];
  
  const hasMedicineKeywords = medicineKeywords.some(keyword => 
    lowerText.includes(keyword)
  );
  
  const hasNonMedicineKeywords = nonMedicineKeywords.some(keyword => 
    lowerText.includes(keyword)
  );
  
  // If it has non-medicine keywords and no medicine keywords, it's not a medicine
  if (hasNonMedicineKeywords && !hasMedicineKeywords) {
    return false;
  }
  
  // If it has medicine keywords, it's likely a medicine
  if (hasMedicineKeywords) {
    return true;
  }
  
  // If analysis is very short or generic, it might not be a medicine
  if (lowerText.length < 50 || 
      lowerText.includes('cannot identify') ||
      lowerText.includes('unable to determine') ||
      lowerText.includes('not clear') ||
      lowerText.includes('blurry image')) {
    return false;
  }
  
  // Default to true if uncertain
  return true;
};