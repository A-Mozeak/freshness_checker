
export interface AnalysisResult {
  foodName: string;
  isSpoiled: 'Fresh' | 'Spoiled' | 'Unsure' | 'N/A';
  explanation: string;
  sensoryChecks: string;
}

export interface FdaRecall {
  product_description: string;
  reason_for_recall: string;
  recall_initiation_date: string;
  recalling_firm: string;
  city: string;
  state: string;
  country: string;
  recall_number: string;
}

export interface FoodItem {
  id: string;
  name: string;
  spoilageDate: string;
}

export interface StorageAdvice {
  isOptimal: boolean;
  optimalMethod: string;
  shelfLifeExtension: string;
}
