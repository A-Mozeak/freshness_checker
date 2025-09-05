
import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import Loader from './components/Loader';
import NotificationBanner from './components/NotificationBanner';
import { analyzeImage, generateSpoiledImages } from './services/geminiService';
import { fetchRecalls } from './services/fdaService';
import { useNotifications } from './hooks/useNotifications';
import type { AnalysisResult, FdaRecall, FoodItem } from './types';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [spoiledImages, setSpoiledImages] = useState<string[]>([]);
  const [recallInfo, setRecallInfo] = useState<FdaRecall[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  const { addFoodItem, removeFoodItem, getNotifications } = useNotifications();
  const [notifications, setNotifications] = useState<FoodItem[]>([]);

  useEffect(() => {
    setNotifications(getNotifications());
  }, [getNotifications]);


  const handleImageSelect = async (base64Image: string, mimeType: string) => {
    setLoading(true);
    setError(null);
    setShowResults(false);
    
    try {
      setLoadingMessage('Analyzing image for freshness...');
      const analysis = await analyzeImage(base64Image, mimeType);
      setAnalysisResult(analysis);
      
      if (analysis && analysis.foodName) {
        setLoadingMessage(`Generating images & checking recalls for ${analysis.foodName}...`);
        
        const [images, recalls] = await Promise.all([
          generateSpoiledImages(analysis.foodName),
          fetchRecalls(analysis.foodName)
        ]);
        
        setSpoiledImages(images);
        setRecallInfo(recalls);
      }
      
      setShowResults(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const resetState = () => {
      setAnalysisResult(null);
      setSpoiledImages([]);
      setRecallInfo([]);
      setShowResults(false);
      setError(null);
      setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-4 sm:p-8">
      <main className="container mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">
              Freshness Checker AI
            </span>
          </h1>
          <p className="mt-2 text-lg text-slate-400">Is your food safe to eat? Let's find out.</p>
        </header>

        <NotificationBanner notifications={notifications} onDismiss={removeFoodItem} />

        {!showResults && !loading && <ImageUploader onImageSelect={handleImageSelect} disabled={loading} />}
        
        {loading && <Loader message={loadingMessage} />}
        
        {error && (
            <div className="text-center my-4 p-4 bg-red-500/20 border border-red-500 text-red-300 rounded-lg">
                <p className="font-bold">Oops! Something went wrong.</p>
                <p>{error}</p>
                <button onClick={resetState} className="mt-2 bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded">Try Again</button>
            </div>
        )}

        {showResults && analysisResult && (
          <ResultDisplay
            analysis={analysisResult}
            spoiledImages={spoiledImages}
            recalls={recallInfo}
            onSetReminder={addFoodItem}
            onReset={resetState}
          />
        )}
      </main>
      <footer className="text-center mt-12 text-slate-500 text-sm">
        <p>Powered by Google Gemini & Imagen. Recall data from openFDA.</p>
        <p>This tool is for informational purposes only and does not constitute professional advice. When in doubt, throw it out.</p>
      </footer>
    </div>
  );
};

export default App;
