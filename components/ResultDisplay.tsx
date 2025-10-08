
import React, { useState } from 'react';
import type { AnalysisResult, FdaRecall, StorageAdvice } from '../types';
import { getSpoilageDate, getStorageAdvice } from '../services/geminiService';

interface ResultDisplayProps {
  analysis: AnalysisResult;
  spoiledImages: string[];
  recalls: FdaRecall[];
  userImage: string | null;
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
          <strong key={i} className="bg-yellow-300/50 text-yellow-800 px-1 rounded">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
};

const ExternalLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

const smartTruncate = (description: string, highlight: string, maxLength: number = 250): string => {
    if (description.length <= maxLength) {
        return description;
    }

    const highlightTerm = highlight.toLowerCase();
    const descriptionLower = description.toLowerCase();
    const highlightIndex = descriptionLower.indexOf(highlightTerm);

    // Case 1: Highlight not found or is clearly visible in a simple truncation.
    // We check if the highlight term starts well before the maxLength limit.
    if (highlightIndex === -1 || highlightIndex < maxLength - highlightTerm.length - 20) { // 20 chars for context
        return description.substring(0, maxLength).trim() + '...';
    }

    // Case 2: Highlight is further in. Create a "sliding window".
    const contextBefore = 30; // How many characters to show before the highlight term.
    const startIndex = Math.max(0, highlightIndex - contextBefore);
    
    // Create the snippet starting with '...'
    const snippet = '...' + description.substring(startIndex);

    // Now, truncate this new string (snippet) if it's still too long.
    if (snippet.length > maxLength) {
        return snippet.substring(0, maxLength).trim() + '...';
    }
    
    return snippet;
};


const ResultDisplay: React.FC<ResultDisplayProps> = ({ analysis, spoiledImages, recalls, userImage, onReset }) => {
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
      // onSetReminder(analysis.foodName, estimate.endDate);

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
      case 'Fresh': return 'text-green-600 border-green-500';
      case 'Still Good': return 'text-lime-600 border-lime-500';
      case 'Eat Soon': return 'text-orange-500 border-orange-400';
      case 'Spoiled': return 'text-red-600 border-red-500';
      case 'Unsure': return 'text-amber-500 border-amber-400';
      default: return 'text-gray-500 border-gray-400';
    }
  };
  
  if (analysis.isSpoiled === 'N/A') {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md text-center">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">No Food Detected</h2>
          <p className="text-gray-700 mb-6">{analysis.explanation}</p>
          <p className="text-gray-500 mb-6">Please try again with a clearer picture. Ensure the food item is well-lit and in focus.</p>
          <button onClick={onReset} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">
            Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Analysis Result Card */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-green-700 mb-4">AI Freshness Analysis</h2>
        <div className="text-center mb-4">
          <p className={`text-3xl font-bold ${getStatusColor()} inline-block px-4 py-2 border-2 rounded-lg`}>{analysis.isSpoiled}</p>
        </div>
        <p className="text-lg font-semibold text-gray-800">Identified Food: <span className="font-bold">{analysis.foodName}</span></p>
        <p className="text-gray-700 mt-2">{analysis.explanation}</p>
        {(analysis.isSpoiled === 'Unsure' || analysis.isSpoiled === 'Eat Soon') && analysis.sensoryChecks && (
          <div className="mt-4 p-4 bg-amber-50 rounded-lg">
            <h3 className="font-bold text-amber-800">How to Check Manually</h3>
            <p className="text-gray-700 mt-1">{analysis.sensoryChecks}</p>
          </div>
        )}
      </div>

      {/* Spoilage Date & Reminder */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold text-green-700 mb-4">Spoilage & Reminder</h3>
          <p className="text-gray-500 mb-4">Enter the purchase date to estimate when it might spoil and set a reminder.</p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
              <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="bg-gray-100 text-gray-800 p-2 rounded-md w-full sm:w-auto border border-gray-300"/>
              <button onClick={handleGetEstimate} disabled={!purchaseDate || loadingEstimate} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto">
                  {loadingEstimate ? 'Estimating...' : 'Get Spoilage Estimate'}
              </button>
          </div>
          {spoilageMessage && (
            <div className={`mt-4 p-4 rounded-lg border ${
                messageType === 'danger' ? 'bg-red-100 border-red-400 text-red-800' :
                messageType === 'warning' ? 'bg-orange-100 border-orange-400 text-orange-800' :
                'bg-green-100 border-green-400 text-green-800'
            }`}>
                <p className="font-semibold">{spoilageMessage}</p>
                {spoilageEstimate && messageType !== 'danger' && (
                    <p className="text-sm mt-1">Estimated spoilage date range: {spoilageEstimate.start} to {spoilageEstimate.end}.</p>
                )}
            </div>
          )}
          {showStorageQuery && !storageAdvice && (
            <div className="mt-4 p-4 bg-stone-100 rounded-lg space-y-3 animate-fade-in">
                <p className="font-semibold text-orange-700">How have you been storing the {analysis.foodName}?</p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <select value={userStorageMethod} onChange={(e) => setUserStorageMethod(e.target.value)} className="bg-gray-100 text-gray-800 p-2 rounded-md w-full focus:ring-2 focus:ring-green-500 focus:outline-none border border-gray-300">
                        <option value="">Select storage method...</option>
                        <option value="On the counter">On the counter</option>
                        <option value="In the pantry">In the pantry</option>
                        <option value="In the refrigerator">In the refrigerator</option>
                        <option value="In the freezer">In the freezer</option>
                    </select>
                    <button onClick={handleGetStorageAdvice} disabled={!userStorageMethod || loadingStorageAdvice} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto whitespace-nowrap">
                        {loadingStorageAdvice ? 'Getting advice...' : 'Get Storage Advice'}
                    </button>
                </div>
            </div>
          )}
          {storageAdvice && (
            <div className="mt-4 p-4 bg-stone-100 rounded-lg animate-fade-in">
                {storageAdvice.isOptimal ? (
                    <p className="text-green-700 font-bold">✓ Great! You are using the optimal storage method.</p>
                ) : (
                    <>
                        <p className="font-bold text-orange-700 mb-2">Storage Tip:</p>
                        <p className="text-gray-700">{storageAdvice.optimalMethod}</p>
                        <p className="text-green-600 font-semibold mt-3">{storageAdvice.shelfLifeExtension}</p>
                    </>
                )}
            </div>
          )}
      </div>

      {/* Visual Comparison */}
      {(userImage || spoiledImages.length > 0) && (
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold text-green-700 mb-4">Visual Comparison</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-start">
            {userImage && (
              <div className="text-center">
                <img src={userImage} alt="User uploaded photo" className="rounded-lg object-cover w-full h-auto aspect-square" />
                <p className="mt-2 font-semibold text-gray-700">Your Photo</p>
              </div>
            )}
            {spoiledImages.map((src, index) => (
              <div key={index} className="text-center">
                <img src={src} alt={`Spoiled ${analysis.foodName} example ${index + 1}`} className="rounded-lg object-cover w-full h-auto aspect-square" />
                <p className="mt-2 font-semibold text-gray-700">{`Spoiled Example ${index + 1}`}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FDA Recalls */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-green-700 mb-2">FDA Recall Check</h3>
        <p className="text-gray-500 mb-4">Recent recalls related to "{analysis.foodName}" from the last year.</p>
        {recalls.length > 0 ? (
          <ul className="space-y-4">
            {recalls.map(recall => (
              <li key={recall.recall_number} className="bg-stone-100 p-4 rounded-lg">
                <p className="font-bold text-gray-800">
                    <HighlightText text={smartTruncate(recall.product_description, analysis.foodName.split(' ')[0])} highlight={analysis.foodName.split(' ')[0]} />
                </p>
                <p className="text-sm text-red-600 mt-1">
                  <span className="font-semibold text-gray-700">Reason:</span>{' '}
                  <HighlightText text={smartTruncate(recall.reason_for_recall, 'allerg')} highlight={'allerg'} />
                </p>
                <p className="text-xs text-gray-500 mt-2">{recall.recalling_firm} | Recall Date: {recall.recall_initiation_date}</p>
                <a 
                    href={`https://www.google.com/search?q=FDA+recall+${recall.recall_number}+${encodeURIComponent(recall.product_description)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center text-green-600 hover:text-green-700 hover:underline text-sm"
                >
                    Find out more
                    <ExternalLinkIcon />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700">No recent FDA recalls found for "{analysis.foodName}".</p>
        )}
      </div>

       {/* Reset Button */}
       <div className="text-center">
         <button onClick={onReset} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105">
           Check Another Item
         </button>
       </div>
    </div>
  );
};

export default ResultDisplay;