
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
}

export interface FoodItem {
  id: string;
  name: string;
  spoilageDate: string;
}