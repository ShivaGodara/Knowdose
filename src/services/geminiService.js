export const analyzeImageWithGemini = async (base64Image, language = 'en-US') => {
  const API_KEY = 'AIzaSyBPaAAuBSzwj1-VuFa00ZH8mgIswKffCdg';
  
  const getLanguagePrompt = (language) => {
    const prompts = {
      'en-US': `Analyze this medicine image and provide comprehensive information:
            1. Medicine name
            2. What it's commonly used for (in simple terms)
            3. Common dosage form (tablet, syrup, etc.)
            4. Key precautions and warnings
            5. Common side effects
            6. Expiry date if visible
            7. Dosage instructions if visible
            
            Format your response clearly for a general audience. If you can't identify the medicine clearly, say so.`,
      'hi-IN': `इस दवा की तस्वीर का विश्लेषण करें और व्यापक जानकारी प्रदान करें:
            1. दवा का नाम
            2. यह आमतौर पर किस लिए उपयोग की जाती है (सरल भाषा में)
            3. सामान्य खुराक का रूप (गोली, सिरप, आदि)
            4. मुख्य सावधानियां और चेतावनियां
            5. सामान्य दुष्प्रभाव
            6. समाप्ति तिथि यदि दिखाई दे
            7. खुराक के निर्देश यदि दिखाई दें
            
            अपना उत्तर आम लोगों के लिए स्पष्ट रूप से प्रारूपित करें। यदि आप दवा को स्पष्ट रूप से पहचान नहीं सकते हैं, तो ऐसा कहें। हिंदी में उत्तर दें।`,
      'kn-IN': `ಈ ಔಷಧದ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ಸಮಗ್ರ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಿ:
            1. ಔಷಧದ ಹೆಸರು
            2. ಇದನ್ನು ಸಾಮಾನ್ಯವಾಗಿ ಯಾವುದಕ್ಕಾಗಿ ಬಳಸಲಾಗುತ್ತದೆ (ಸರಳ ಪದಗಳಲ್ಲಿ)
            3. ಸಾಮಾನ್ಯ ಔಷಧ ರೂಪ (ಮಾತ್ರೆ, ಸಿರಪ್, ಇತ್ಯಾದಿ)
            4. ಮುಖ್ಯ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳು
            5. ಸಾಮಾನ್ಯ ಅಡ್ಡ ಪರಿಣಾಮಗಳು
            6. ಅವಧಿ ಮುಗಿಯುವ ದಿನಾಂಕ ಕಂಡುಬಂದರೆ
            7. ಔಷಧ ಸೇವನೆಯ ಸೂಚನೆಗಳು ಕಂಡುಬಂದರೆ
            
            ಸಾಮಾನ್ಯ ಜನರಿಗಾಗಿ ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಫಾರ್ಮ್ಯಾಟ್ ಮಾಡಿ. ನೀವು ಔಷಧವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗದಿದ್ದರೆ, ಹಾಗೆ ಹೇಳಿ. ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ।`
    };
    return prompts[language] || prompts['en-US'];
  };
  
  const requestBody = {
    contents: [{
      parts: [
        { text: getLanguagePrompt(language) },
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: base64Image
          }
        }
      ]
    }]
  };
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No analysis candidates received from API');
  }
  
  const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!analysisText || analysisText.trim().length <= 10) {
    throw new Error('No analysis received');
  }
  
  return analysisText.trim();
};