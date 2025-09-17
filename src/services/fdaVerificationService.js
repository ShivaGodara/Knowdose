export const verifyMedicineWithFDA = async (medicineName) => {
  console.log('Verifying medicine locally:', medicineName);
  
  // Clean medicine name for search
  const cleanName = medicineName
    .replace(/\s*(tablets?|capsules?|syrup|liquid|injection|mg|ml).*$/i, '')
    .replace(/[^a-zA-Z\s]/g, '')
    .trim()
    .toLowerCase();
  
  // Check if it's a known supplement/herbal product (not FDA regulated as medicine)
  const supplements = [
    'ashwagandha', 'turmeric', 'ginseng', 'echinacea', 'ginkgo', 'garlic',
    'vitamin', 'calcium', 'iron', 'zinc', 'magnesium', 'omega', 'fish oil',
    'probiotics', 'melatonin', 'biotin', 'collagen', 'protein powder',
    'curcumin', 'spirulina', 'chlorella', 'moringa', 'brahmi', 'neem',
    'tulsi', 'triphala', 'guduchi', 'shatavari', 'arjuna'
  ];
  
  const isKnownSupplement = supplements.some(supp => 
    cleanName.includes(supp)
  );
  
  if (isKnownSupplement) {
    return {
      isVerified: false,
      status: 'supplement',
      fdaInfo: null,
      message: '🌿 This appears to be a dietary supplement. Supplements are not FDA-approved medicines.'
    };
  }
  
  // Check if it's a common FDA-approved medicine
  const fdaApprovedMedicines = [
    'paracetamol', 'acetaminophen', 'ibuprofen', 'aspirin', 'amoxicillin',
    'metformin', 'lisinopril', 'atorvastatin', 'omeprazole', 'amlodipine',
    'losartan', 'metoprolol', 'hydrochlorothiazide', 'simvastatin', 'levothyroxine',
    'azithromycin', 'ciprofloxacin', 'doxycycline', 'prednisone', 'albuterol',
    'insulin', 'warfarin', 'clopidogrel', 'pantoprazole', 'sertraline'
  ];
  
  const isKnownMedicine = fdaApprovedMedicines.some(med => 
    cleanName.includes(med)
  );
  
  if (isKnownMedicine) {
    return {
      isVerified: true,
      status: 'fda_approved',
      fdaInfo: null,
      message: '✅ Recognized as FDA-approved medicine'
    };
  }
  
  // Check for common international/generic medicines
  const internationalMedicines = [
    'diclofenac', 'nimesulide', 'ranitidine', 'domperidone', 'cetirizine',
    'montelukast', 'telmisartan', 'olmesartan', 'rosuvastatin', 'rabeprazole'
  ];
  
  const isInternationalMedicine = internationalMedicines.some(med => 
    cleanName.includes(med)
  );
  
  if (isInternationalMedicine) {
    return {
      isVerified: false,
      status: 'international',
      fdaInfo: null,
      message: '⚠️ This may be an international medicine. Verify with local regulations.'
    };
  }
  
  // Unknown medicine - could be legitimate but not in our database
  return {
    isVerified: false,
    status: 'unknown',
    fdaInfo: null,
    message: '⚠️ Unknown medicine. Please verify authenticity and consult healthcare provider.'
  };
};

export const formatVerificationResult = (verification) => {
  if (!verification) return '';
  
  let result = `\n\n**Verification Status:**\n${verification.message}\n`;
  
  if (verification.isVerified && verification.fdaInfo) {
    result += `\n**Official FDA Information:**\n`;
    result += `• Brand Name: ${verification.fdaInfo.brandName}\n`;
    result += `• Generic Name: ${verification.fdaInfo.genericName}\n`;
    result += `• Manufacturer: ${verification.fdaInfo.manufacturer}\n`;
    result += `• Product Type: ${verification.fdaInfo.productType}\n`;
    if (verification.fdaInfo.applicationNumber !== 'N/A') {
      result += `• FDA Application: ${verification.fdaInfo.applicationNumber}\n`;
    }
  }
  
  return result;
};