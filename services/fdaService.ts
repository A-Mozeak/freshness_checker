import type { FdaRecall } from '../types';

const API_URL = 'https://api.fda.gov/food/enforcement.json';

export const fetchRecalls = async (foodName: string): Promise<FdaRecall[]> => {
  if (!foodName) return [];

  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  const fromDate = oneYearAgo.toISOString().split('T')[0].replace(/-/g, '');
  const toDate = today.toISOString().split('T')[0].replace(/-/g, '');

  const searchTerm = foodName.split(' ')[0]; // Use first word for broader search

  const url = `${API_URL}?search=report_date:[${fromDate}+TO+${toDate}]+AND+product_description:"${searchTerm}"&sort=recall_initiation_date:desc&limit=5`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('FDA API request failed:', response.statusText);
      return [];
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching FDA recalls:', error);
    return [];
  }
};