import React, { useRef, useState, useEffect } from 'react';

interface ImageUploaderProps {
  onImageSelect: (base64: string, mimeType: string) => void;
  disabled: boolean;
}

// A new component for the camera view
const CameraView: React.FC<{
    onCapture: (dataUrl: string) => void;
    onClose: () => void;
}> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const openCamera = async () => {
            try {
                // Prefer rear camera
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing rear camera:", err);
                // Fallback to any camera if environment facing fails
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (fallbackErr) {
                     console.error("Error accessing any camera:", fallbackErr);
                     if (fallbackErr instanceof DOMException) {
                        switch(fallbackErr.name) {
                            case 'NotFoundError':
                            case 'DevicesNotFoundError':
                                setError("No camera found. Please ensure a camera is connected and enabled.");
                                break;
                            case 'NotAllowedError':
                            case 'PermissionDeniedError':
                                setError("Camera access was denied. Please allow camera permissions in your browser settings.");
                                break;
                            case 'NotReadableError':
                                setError("The camera is currently in use by another application.");
                                break;
                            default:
                                setError("Could not access camera. Please check permissions and ensure your browser supports this feature.");
                        }
                     } else {
                        setError("An unexpected error occurred while trying to access the camera.");
                     }
                }
            }
        };

        openCamera();

        return () => {
            // Cleanup: stop the stream when component unmounts
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                onCapture(dataUrl);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50 p-4">
            {error ? (
                 <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">
                        Close
                    </button>
                </div>
            ) : (
                <>
                    <video ref={videoRef} autoPlay playsInline className="w-full max-w-2xl h-auto rounded-lg shadow-2xl mb-4"></video>
                    <div className="flex gap-4">
                        <button onClick={handleCapture} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-transform transform hover:scale-105">
                            Capture
                        </button>
                        <button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-transform transform hover:scale-105">
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};


const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraSupported, setIsCameraSupported] = useState(false);

  useEffect(() => {
    const checkCameraSupport = async () => {
      if (navigator.mediaDevices?.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasCamera = devices.some(device => device.kind === 'videoinput');
          setIsCameraSupported(hasCamera);
        } catch (error) {
          console.error("Error enumerating devices:", error);
          setIsCameraSupported(false);
        }
      } else {
        setIsCameraSupported(false);
      }
    };
    checkCameraSupport();
  }, []);

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
  
  const handleCapture = (dataUrl: string) => {
    const base64 = dataUrl.split(',')[1] || '';
    onImageSelect(base64, 'image/jpeg');
    setIsCameraOpen(false);
  }

  const triggerFileInput = () => fileInputRef.current?.click();
  const openCamera = () => {
    if (isCameraSupported) {
      setIsCameraOpen(true);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto border border-gray-200">
        <h2 className="text-xl font-bold text-center text-green-700 mb-4">Check Your Food's Freshness</h2>
        <p className="text-gray-600 text-center mb-6">Upload or take a photo of a food item to get an AI-powered analysis.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />
          <button
            onClick={openCamera}
            disabled={disabled || !isCameraSupported}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
            aria-label="Take a photo with your camera"
            title={!isCameraSupported ? "No camera detected on this device" : "Take a photo"}
          >
            <CameraIcon /> Take Photo
          </button>
          <button
            onClick={triggerFileInput}
            disabled={disabled}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
            aria-label="Upload an image from your device"
          >
            <UploadIcon /> Upload Image
          </button>
        </div>
      </div>
      {isCameraOpen && <CameraView onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />}
    </>
  );
};

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export default ImageUploader;