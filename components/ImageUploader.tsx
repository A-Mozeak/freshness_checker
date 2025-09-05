
import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelect: (base64: string, mimeType: string) => void;
  disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result?.toString().split(',')[1] || '', file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const triggerCameraInput = () => cameraInputRef.current?.click();

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center text-cyan-300 mb-4">Check Your Food's Freshness</h2>
      <p className="text-slate-400 text-center mb-6">Upload or take a photo of a food item to get an AI-powered analysis.</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        <button
          onClick={triggerCameraInput}
          disabled={disabled}
          className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
        >
          <CameraIcon /> Take Photo
        </button>
        <button
          onClick={triggerFileInput}
          disabled={disabled}
          className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
        >
          <UploadIcon /> Upload Image
        </button>
      </div>
    </div>
  );
};

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export default ImageUploader;
