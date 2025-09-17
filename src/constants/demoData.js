export const DEMO_MEDICINES = [
  {
    name: 'Paracetamol',
    info: `Medicine Name: Paracetamol (Acetaminophen)

Common Uses:
• Pain relief (headaches, muscle aches)
• Fever reduction
• Cold and flu symptoms

Dosage Form: Tablets, Syrup, Capsules

Precautions:
• Do not exceed 4000mg per day
• Avoid alcohol while taking
• Consult doctor if pregnant

Common Side Effects:
• Rare when used as directed
• Possible liver damage with overdose`
  },
  {
    name: 'Ibuprofen',
    info: `Medicine Name: Ibuprofen

Common Uses:
• Anti-inflammatory
• Pain relief
• Fever reduction
• Arthritis symptoms

Dosage Form: Tablets, Capsules, Liquid

Precautions:
• Take with food
• Avoid if allergic to NSAIDs
• Not recommended during pregnancy

Common Side Effects:
• Stomach upset
• Dizziness
• Headache`
  },
  {
    name: 'Aspirin',
    info: `Medicine Name: Aspirin

Common Uses:
• Pain relief
• Anti-inflammatory
• Blood thinner
• Heart attack prevention

Dosage Form: Tablets, Chewable tablets

Precautions:
• Not for children under 16
• Avoid if allergic to salicylates
• Take with food

Common Side Effects:
• Stomach irritation
• Increased bleeding risk
• Ringing in ears`
  }
];

export const getRandomMedicine = () => {
  return DEMO_MEDICINES[Math.floor(Math.random() * DEMO_MEDICINES.length)];
};