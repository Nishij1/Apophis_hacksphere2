import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, File, Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFiles = (files: FileList) => {
    if (files?.[0]) {
      const file = files[0];
      setFileName(file.name);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
      
      onFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openCamera = async () => {
    try {
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      // Clear any previous errors
      setCameraError(null);

      // Request camera access with constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Prefer back camera on mobile devices
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      // Here you would typically open a modal with camera stream
      // For now, we'll just stop the stream
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      let errorMessage = 'Failed to access camera';
      
      if (err instanceof Error) {
        // Handle specific error cases
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage = 'No camera found on this device';
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = 'Camera access was denied';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMessage = 'Camera is in use by another application';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Camera does not meet the required constraints';
        } else if (err.message) {
          errorMessage = err.message;
        }
      }
      
      setCameraError(errorMessage);
      console.error('Camera error:', errorMessage);
    }
  };

  const clearFile = () => {
    setPreview(null);
    setFileName(null);
    setCameraError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf"
        onChange={handleFileInput}
      />
      
      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {preview || fileName ? (
          <div className="relative">
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg"
              />
            )}
            {fileName && (
              <p className="text-center mt-2 text-gray-600">{fileName}</p>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
              onClick={clearFile}
            >
              <X size={16} />
            </motion.button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-600">
                Drag and drop your files here, or
              </p>
            </div>

            <div className="mt-4 flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center gap-2"
                onClick={openFileDialog}
              >
                <File size={20} />
                Choose File
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center gap-2"
                onClick={openCamera}
              >
                <Camera size={20} />
                Use Camera
              </motion.button>
            </div>

            {cameraError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm text-center text-red-500"
              >
                {cameraError}
              </motion.p>
            )}

            <p className="mt-2 text-xs text-center text-gray-500">
              Supports: Images (PNG, JPG) and PDF files
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};