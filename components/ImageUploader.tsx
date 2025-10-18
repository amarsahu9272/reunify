
import React, { useRef } from 'react';

interface ImageUploaderProps {
  id: string;
  label: string;
  onFileSelect: (file: File | null) => void;
  previewUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onFileSelect, previewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onFileSelect(file || null);
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-semibold text-gray-700 mb-3">{label}</h3>
      <div
        onClick={handleAreaClick}
        className="w-full h-64 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-indigo-400 transition-all duration-300"
      >
        <input
          ref={fileInputRef}
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <div className="text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2">Click to upload an image</p>
          </div>
        )}
      </div>
    </div>
  );
};
