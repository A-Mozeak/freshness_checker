import React, { useState } from 'react';
import type { AnalysisResult, FdaRecall, StorageAdvice } from '../types';
import { getSpoilageDate, getStorageAdvice } from '../services/geminiService';

interface ResultDisplayProps {
  analysis: AnalysisResult;
  spoiledImages: string[];
  recalls: FdaRecall[];
  userImage: string | null;
  onSetReminder: (name: string, date: string) => void;
  onReset: () => void;
}

// Helper component to highlight text
const HighlightText: React.FC<{ text: string, highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim() || !text) {
    return <>{text}</>;
  }
  // Escape special characters for regex
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <strong key={i} className="bg-yellow-500/30 text-yellow-200 px-1 rounded">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
};


const ResultDisplay: React.FC<ResultDisplayProps> = ({ analysis, spoiledImages, recalls, userImage, onSetReminder, onReset }) => {
  const [purchaseDate, setPurchaseDate] = useState('');
  const [spoilageEstimate, setSpoilageEstimate] = useState<{ start: string; end: string } | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [spoilageMessage, setSpoilageMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'info' | 'warning' | 'danger'>('info');
  const [showStorageQuery, setShowStorageQuery] = useState(false);
  const [userStorageMethod, setUserStorageMethod] = useState('');
  const [storageAdvice, setStorageAdvice] = useState<StorageAdvice | null>(null);
  const [loadingStorageAdvice, setLoadingStorageAdvice] = useState(false);
  
  const handleGetEstimate = async () => {
    if (!purchaseDate) return;
    setLoadingEstimate(true);
    // Reset states for a new estimation
    setSpoilageEstimate(null);
    setSpoilageMessage(null);
    setShowStorageQuery(false);
    setStorageAdvice(null);
    setUserStorageMethod('');
    setMessageType('info');

    try {
      const estimate = await getSpoilageDate(analysis.foodName, purchaseDate);
      setSpoilageEstimate({ start: estimate.startDate, end: estimate.endDate });
      onSetReminder(analysis.foodName, estimate.endDate);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(estimate.endDate);
      
      const timeDiff = endDate.getTime() - today.getTime();
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (dayDiff < 0) {
        setMessageType('danger');
        setSpoilageMessage("This item is past its estimated spoilage date. For your safety, it's best to dispose of it.");
      } else if (dayDiff <= 7) {
        setMessageType('warning');
        setSpoilageMessage(`This item is nearing its spoilage date.`);
        setShowStorageQuery(true);
      } else {
        setMessageType('info');
        setSpoilageMessage(`This item looks good for a while!`);
      }
    } catch (error) {
      console.error("Error getting spoilage estimate:", error);
      alert("Could not retrieve a spoilage estimate.");
    } finally {
      setLoadingEstimate(false);
    }
  };
  
  const handleGetStorageAdvice = async () => {
    if (!userStorageMethod) return;
    setLoadingStorageAdvice(true);
    setStorageAdvice(null);
    try {
      const advice = await getStorageAdvice(analysis.foodName, userStorageMethod);
      setStorageAdvice(advice);
    } catch (error) {
      console.error("Error getting storage advice:", error);
      alert("Could not retrieve storage advice.");
    } finally {
      setLoadingStorageAdvice(false);
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
          {spoilageMessage && (
            <div className={`mt-4 p-4 rounded-lg border ${
                messageType === 'danger' ? 'bg-red-900/50 border-red-500 text-red-300' :
                messageType === 'warning' ? 'bg-yellow-900/50 border-yellow-500 text-yellow-300' :
                'bg-slate-700 border-slate-600 text-slate-300'
            }`}>
                <p className="font-semibold">{spoilageMessage}</p>
                {spoilageEstimate && messageType !== 'danger' && (
                    <p className="text-sm mt-1">Estimated spoilage date range: {spoilageEstimate.start} to {spoilageEstimate.end}. A reminder has been set!</p>
                )}
            </div>
          )}
          {showStorageQuery && !storageAdvice && (
            <div className="mt-4 p-4 bg-slate-700 rounded-lg space-y-3 animate-fade-in">
                <p className="font-semibold text-yellow-300">How have you been storing the {analysis.foodName}?</p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <select value={userStorageMethod} onChange={(e) => setUserStorageMethod(e.target.value)} className="bg-slate-600 text-white p-2 rounded-md w-full focus:ring-2 focus:ring-cyan-500 focus:outline-none border-0">
                        <option value="">Select storage method...</option>
                        <option value="On the counter">On the counter</option>
                        <option value="In the pantry">In the pantry</option>
                        <option value="In the refrigerator">In the refrigerator</option>
                        <option value="In the freezer">In the freezer</option>
                    </select>
                    <button onClick={handleGetStorageAdvice} disabled={!userStorageMethod || loadingStorageAdvice} className="bg-violet-600 hover:bg-violet-500 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto whitespace-nowrap">
                        {loadingStorageAdvice ? 'Getting advice...' : 'Get Storage Advice'}
                    </button>
                </div>
            </div>
          )}
          {storageAdvice && (
            <div className="mt-4 p-4 bg-slate-700 rounded-lg animate-fade-in">
                {storageAdvice.isOptimal ? (
                    <p className="text-green-300 font-bold">✓ Great! You are using the optimal storage method.</p>
                ) : (
                    <>
                        <p className="font-bold text-yellow-300 mb-2">Storage Tip:</p>
                        <p className="text-slate-300">{storageAdvice.optimalMethod}</p>
                        <p className="text-cyan-300 font-semibold mt-3">{storageAdvice.shelfLifeExtension}</p>
                    </>
                )}
            </div>
          )}
      </div>

      {/* Visual Comparison */}
      {/* FIX: Removed redundant `analysis.isSpoiled !== 'N/A'` check. This is always true at this point in the code due to the early return for 'N/A' cases. */}
      {(userImage || spoiledImages.length > 0) && (
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-cyan-300 mb-4">Visual Comparison</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-start">
            {/* FIX: Removed redundant `analysis.isSpoiled !== 'N/A'` check. */}
            {userImage && (
              <div className="text-center">
                <img src={userImage} alt="User uploaded photo" className="rounded-lg object-cover w-full h-auto aspect-square" />
                <p className="mt-2 font-semibold text-slate-300">Your Photo</p>
              </div>
            )}
            {spoiledImages.map((src, index) => (
              <div key={index} className="text-center">
                <img src={src} alt={`Spoiled ${analysis.foodName} example ${index + 1}`} className="rounded-lg object-cover w-full h-auto aspect-square" />
                <p className="mt-2 font-semibold text-slate-300">{`Spoiled Example ${index + 1}`}</p>
              </div>
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
                <p className="font-bold text-red-400">
                   <HighlightText text={recall.product_description} highlight={analysis.foodName.split(' ')[0]} />
                </p>
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