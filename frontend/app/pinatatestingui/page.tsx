"use client";

import { usePinataUpload } from '@/hooks/ipfs/usePinataUpload';

export default function TestPage() {
  const {
    selectedFile,
    uploadedCID,
    isUploading,
    error,
    uploadProgress,
    fileValidation,
    uploadToPinata,
    handleFileSelect,
    resetUpload,
    getGatewayUrl
  } = usePinataUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Pinata Upload Test
        </h1>

        {/* File Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Image</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer block"
            >
              <div className="text-gray-600">
                {selectedFile ? (
                  <div>
                    <p className="font-medium text-green-600">✓ File Selected</p>
                    <p className="text-sm mt-2">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg">📁 Click to select an image</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports: JPEG, PNG, GIF, WebP (max 10MB)
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* File Validation Error */}
          {!fileValidation.isValid && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{fileValidation.message}</p>
            </div>
          )}
        </div>

        {/* Upload Button */}
        {selectedFile && fileValidation.isValid && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <button
              onClick={uploadToPinata}
              disabled={isUploading}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                isUploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload to Pinata'}
            </button>

            {/* Progress Bar */}
            {isUploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Progress: {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 font-medium">Error:</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {uploadedCID && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              ✅ Upload Successful!
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">CID:</p>
                <p className="text-sm text-green-600 font-mono break-all">
                  {uploadedCID}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Gateway URL:</p>
                <a
                  href={getGatewayUrl(uploadedCID)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {getGatewayUrl(uploadedCID)}
                </a>
              </div>

              {/* Image Preview */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <img
                  src={getGatewayUrl(uploadedCID)}
                  alt="Uploaded content"
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Reset Button */}
        {(selectedFile || uploadedCID) && (
          <div className="text-center">
            <button
              onClick={resetUpload}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">How to Test:</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Select an image file (JPEG, PNG, GIF, or WebP)</li>
            <li>Click "Upload to Pinata"</li>
            <li>Wait for the upload to complete</li>
            <li>Copy the CID and test the gateway URL</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 