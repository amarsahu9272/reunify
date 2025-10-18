
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { createReunificationImage } from './services/geminiService';

const Header: React.FC = () => (
  <header className="text-center mb-8">
    <h1 className="text-5xl font-bold text-gray-800 tracking-tight">Reunify</h1>
    <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
      Upload a childhood photo and a recent one to create a magical image of your past and present selves together.
    </p>
  </header>
);

const Spinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-2">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    <p className="text-indigo-600 font-medium">Creating your reunion... this may take a moment.</p>
  </div>
);

const ResultDisplay: React.FC<{ generatedImage: string | null }> = ({ generatedImage }) => {
  if (!generatedImage) return null;

  return (
    <div className="mt-10 w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Your Reunification Photo</h2>
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <img src={generatedImage} alt="Generated reunification" className="rounded-md w-full" />
      </div>
       <div className="text-center mt-4">
          <a
            href={generatedImage}
            download="reunify-image.png"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
          >
            Download Image
          </a>
        </div>
    </div>
  );
};


const App: React.FC = () => {
  const [childPhoto, setChildPhoto] = useState<File | null>(null);
  const [adultPhoto, setAdultPhoto] = useState<File | null>(null);
  const [childPhotoPreview, setChildPhotoPreview] = useState<string | null>(null);
  const [adultPhotoPreview, setAdultPhotoPreview] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File | null, type: 'child' | 'adult') => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (type === 'child') {
        setChildPhoto(file);
        setChildPhotoPreview(previewUrl);
      } else {
        setAdultPhoto(file);
        setAdultPhotoPreview(previewUrl);
      }
    } else {
      if (type === 'child') {
        setChildPhoto(null);
        if (childPhotoPreview) URL.revokeObjectURL(childPhotoPreview);
        setChildPhotoPreview(null);
      } else {
        setAdultPhoto(null);
        if (adultPhotoPreview) URL.revokeObjectURL(adultPhotoPreview);
        setAdultPhotoPreview(null);
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // remove the `data:mime/type;base64,` prefix
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });

  const generateImage = useCallback(async () => {
    if (!childPhoto || !adultPhoto) {
      setError("Please upload both photos before generating.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const childPhotoBase64 = await fileToBase64(childPhoto);
      const adultPhotoBase64 = await fileToBase64(adultPhoto);
      
      const childMimeType = childPhoto.type;
      const adultMimeType = adultPhoto.type;

      const resultImageBase64 = await createReunificationImage(
        childPhotoBase64,
        childMimeType,
        adultPhotoBase64,
        adultMimeType
      );
      
      setGeneratedImage(`data:image/png;base64,${resultImageBase64}`);

    } catch (err) {
      console.error("Error generating image:", err);
      setError("Sorry, we couldn't create your image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [childPhoto, adultPhoto]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImageUploader
              id="child-photo"
              label="Childhood Photo"
              onFileSelect={(file) => handleFileChange(file, 'child')}
              previewUrl={childPhotoPreview}
            />
            <ImageUploader
              id="adult-photo"
              label="Recent Photo"
              onFileSelect={(file) => handleFileChange(file, 'adult')}
              previewUrl={adultPhotoPreview}
            />
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={generateImage}
              disabled={!childPhoto || !adultPhoto || isLoading}
              className="w-full max-w-xs px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100"
            >
              {isLoading ? 'Generating...' : 'Reunify Me'}
            </button>
          </div>
          {error && <p className="mt-4 text-center text-red-600">{error}</p>}
        </main>

        <div className="mt-10 flex justify-center">
          {isLoading ? <Spinner /> : <ResultDisplay generatedImage={generatedImage} />}
        </div>
      </div>
    </div>
  );
};

export default App;
