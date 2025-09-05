
import { useState, useEffect, useCallback } from 'react';
import type { FoodItem } from '../types';

const STORAGE_KEY = 'foodItems';

export const useNotifications = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => {
    try {
      const items = window.localStorage.getItem(STORAGE_KEY);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(foodItems));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [foodItems]);

  const addFoodItem = useCallback((name: string, spoilageDate: string) => {
    const newItem: FoodItem = { id: new Date().toISOString(), name, spoilageDate };
    setFoodItems(prevItems => [...prevItems, newItem]);
  }, []);

  const removeFoodItem = useCallback((id: string) => {
    setFoodItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const getNotifications = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    return foodItems.filter(item => {
      const spoilDate = new Date(item.spoilageDate);
      return spoilDate >= today && spoilDate <= threeDaysFromNow;
    });
  }, [foodItems]);

  return { foodItems, addFoodItem, removeFoodItem, getNotifications };
};
