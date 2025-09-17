export const enhanceWithOpenFDA = async (geminiInfo, drugName) => {
  try {
    console.log('Fetching OpenFDA data for:', drugName);
    
    // Clean drug name for API search
    const cleanDrugName = drugName
      .replace(/\s*(tablets?|capsules?|syrup|liquid|injection).*$/i, '')
      .replace(/[^a-zA-Z\s]/g, '')
      .trim();
    
    // Search OpenFDA drug database
    const fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${cleanDrugName}"+openfda.generic_name:"${cleanDrugName}"&limit=1`;
    
    const response = await fetch(fdaUrl);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const fdaData = data.results[0];
        console.log('FDA data found:', fdaData);
        
        // Extract FDA information
        let fdaInfo = '\n\n**FDA Database Information:**\n';
        
        // Brand and generic names
        if (fdaData.openfda?.brand_name) {
          fdaInfo += `• Brand Name: ${fdaData.openfda.brand_name[0]}\n`;
        }
        if (fdaData.openfda?.generic_name) {
          fdaInfo += `• Generic Name: ${fdaData.openfda.generic_name[0]}\n`;
        }
        
        // Manufacturer
        if (fdaData.openfda?.manufacturer_name) {
          fdaInfo += `• Manufacturer: ${fdaData.openfda.manufacturer_name[0]}\n`;
        }
        
        // Indications and usage
        if (fdaData.indications_and_usage) {
          const indications = Array.isArray(fdaData.indications_and_usage) 
            ? fdaData.indications_and_usage[0] 
            : fdaData.indications_and_usage;
          fdaInfo += `• FDA Approved Uses: ${indications.substring(0, 200)}...\n`;
        }
        
        // Contraindications
        if (fdaData.contraindications) {
          const contraindications = Array.isArray(fdaData.contraindications)
            ? fdaData.contraindications[0]
            : fdaData.contraindications;
          fdaInfo += `• FDA Contraindications: ${contraindications.substring(0, 150)}...\n`;
        }
        
        // Warnings
        if (fdaData.warnings) {
          const warnings = Array.isArray(fdaData.warnings)
            ? fdaData.warnings[0]
            : fdaData.warnings;
          fdaInfo += `• FDA Warnings: ${warnings.substring(0, 150)}...\n`;
        }
        
        // Dosage and administration
        if (fdaData.dosage_and_administration) {
          const dosage = Array.isArray(fdaData.dosage_and_administration)
            ? fdaData.dosage_and_administration[0]
            : fdaData.dosage_and_administration;
          fdaInfo += `• FDA Dosage Info: ${dosage.substring(0, 150)}...\n`;
        }
        
        return geminiInfo + fdaInfo;
      }
    }
  } catch (error) {
    console.log('OpenFDA API error:', error);
  }
  
  // Return original info if FDA data not available
  return geminiInfo;
};