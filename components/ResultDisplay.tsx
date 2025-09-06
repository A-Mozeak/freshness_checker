
import React, { useState } from 'react';
import type { AnalysisResult, FdaRecall } from '../types';
import { getSpoilageDate } from '../services/geminiService';

interface ResultDisplayProps {
  analysis: AnalysisResult;
  spoiledImages: string[];
  recalls: FdaRecall[];
  onSetReminder: (name: string, date: string) => void;
  onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ analysis, spoiledImages, recalls, onSetReminder, onReset }) => {
  const [purchaseDate, setPurchaseDate] = useState('');
  const [spoilageEstimate, setSpoilageEstimate] = useState<{ start: string; end: string } | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  
  const handleGetEstimate = async () => {
    if (!purchaseDate) return;
    setLoadingEstimate(true);
    try {
      const estimate = await getSpoilageDate(analysis.foodName, purchaseDate);
      setSpoilageEstimate({ start: estimate.startDate, end: estimate.endDate });
      onSetReminder(analysis.foodName, estimate.endDate);
    } catch (error) {
      console.error("Error getting spoilage estimate:", error);
      alert("Could not retrieve a spoilage estimate.");
    } finally {
      setLoadingEstimate(false);
    }
  };

  const getStatusColor = () => {
    switch(analysis.isSpoiled) {
      case 'Fresh': return 'text-green-400 border-green-400';
      case 'Spoiled': return 'text-red-400 border-red-400';
      case 'Unsure': return 'text-yellow-400 border-yellow-400';
      default: return 'text-slate-400 border-slate-400';
    }
  };
  
  if (analysis.isSpoiled === 'N/A') {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-yellow-300 mb-4">No Food Detected</h2>
          <p className="text-slate-300 mb-6">{analysis.explanation}</p>
          <p className="text-slate-400 mb-6">Please try again with a clearer picture. Ensure the food item is well-lit and in focus.</p>
          <button onClick={onReset} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">
            Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Analysis Result Card */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-cyan-300 mb-4">AI Freshness Analysis</h2>
        <div className="text-center mb-4">
          <p className={`text-3xl font-bold ${getStatusColor()} inline-block px-4 py-2 border-2 rounded-lg`}>{analysis.isSpoiled}</p>
        </div>
        <p className="text-lg font-semibold text-white">Identified Food: <span className="font-bold">{analysis.foodName}</span></p>
        <p className="text-slate-300 mt-2">{analysis.explanation}</p>
        {analysis.isSpoiled === 'Unsure' && (
          <div className="mt-4 p-4 bg-slate-700 rounded-lg">
            <h3 className="font-bold text-yellow-300">How to Check Manually</h3>
            <p className="text-slate-300 mt-1">{analysis.sensoryChecks}</p>
          </div>
        )}
      </div>

      {/* Spoilage Date & Reminder */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-cyan-300 mb-4">Spoilage & Reminder</h3>
          <p className="text-slate-400 mb-4">Enter the purchase date to estimate when it might spoil and set a reminder.</p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
              <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="bg-slate-700 text-white p-2 rounded-md w-full sm:w-auto"/>
              <button onClick={handleGetEstimate} disabled={!purchaseDate || loadingEstimate} className="bg-violet-600 hover:bg-violet-500 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto">
                  {loadingEstimate ? 'Estimating...' : 'Get Spoilage Estimate'}
              </button>
          </div>
          {spoilageEstimate && (
              <div className="mt-4 p-4 bg-slate-700 rounded-lg">
                  <p className="text-green-300 font-semibold">Estimated to be best by: <span className="font-bold">{spoilageEstimate.start}</span> to <span className="font-bold">{spoilageEstimate.end}</span>.</p>
                  <p className="text-slate-300 text-sm mt-1">A reminder has been set for you!</p>
              </div>
          )}
      </div>

      {/* Spoiled Examples */}
      {spoiledImages.length > 0 && (
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-cyan-300 mb-4">Examples of Spoiled {analysis.foodName}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {spoiledImages.map((src, index) => (
              <img key={index} src={src} alt={`Spoiled ${analysis.foodName} example ${index + 1}`} className="rounded-lg object-cover w-full h-auto"/>
            ))}
          </div>
        </div>
      )}

      {/* FDA Recalls */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-cyan-300 mb-4">FDA Recall Information</h3>
        {recalls.length > 0 ? (
          <ul className="space-y-4">
            {recalls.map((recall, index) => (
              <li key={index} className="p-4 bg-slate-700 rounded-lg">
                <p className="font-bold text-red-400">{recall.product_description}</p>
                <p><span className="font-semibold text-slate-300">Reason:</span> {recall.reason_for_recall}</p>
                <p><span className="font-semibold text-slate-300">Recalled by:</span> {recall.recalling_firm}</p>
                <p><span className="font-semibold text-slate-300">Date:</span> {new Date(recall.recall_initiation_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400">No recent recalls found for "{analysis.foodName}" in the FDA database.</p>
        )}
      </div>

      <div className="text-center">
        <button onClick={onReset} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg">
          Check Another Item
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;