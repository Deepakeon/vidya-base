"use client"
import { useRef, useState } from 'react';
import { Upload, Video, X } from 'lucide-react';

interface VideoUploadProps {
  onVideoSelect: (file: File) => void;
  disabled?: boolean;
}

export function VideoUpload({ onVideoSelect, disabled = false }: VideoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('video/')) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleProcess = () => {
    if (selectedFile) {
      onVideoSelect(selectedFile);
    }
  };

  const onButtonClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
     <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <div
          className={`relative border border-dashed rounded-2xl p-20 text-center transition-all ${
            dragActive
              ? 'border-orange-500 bg-orange-500/5 scale-[1.02]'
              : 'border-gray-700 hover:border-gray-600 bg-[#1a1a1a]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Upload video file"
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              onButtonClick();
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="video/*"
            onChange={handleChange}
            disabled={disabled}
            aria-label="Video file input"
          />

          {!selectedFile ? (
           <div className="space-y-6">
  <div className="flex justify-center">
    <div className="w-24 h-24 rounded-full bg-linear-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
      <Upload className="w-12 h-12 text-orange-400" aria-hidden="true" />
    </div>
  </div>

  <div>
    <h3 className="text-2xl font-semibold text-white mb-3">
      Upload Your Video
    </h3>
    <p className="text-gray-400 text-base mb-2">
      Drag and drop your video file here, or click to browse
    </p>
    <p className="text-gray-500 text-sm">
      Supports MP4, WebM, and other common video formats
    </p>
  </div>

  {/* 🧠 New info section */}
  <div className="mt-6 border-t border-neutral-800 pt-4 text-center">
    <h4 className="text-lg font-medium text-orange-400 mb-2">
      What Happens Next?
    </h4>
    <p className="text-gray-400 text-sm leading-relaxed">
      Once uploaded, the app will <span className="text-white font-medium">transcribe</span> your video,  
      <span className="text-white font-medium"> summarize key insights</span>, and  
      generate a structured <span className="text-orange-400 font-semibold">Knowledge Base</span> —  
      all processed securely on your device.
    </p>
  </div>
</div>

          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-linear-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <Video className="w-12 h-12 text-green-400" aria-hidden="true" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {selectedFile.name}
                </h3>
                <p className="text-gray-400 text-base">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleClearFile}
              disabled={disabled}
              className="px-8 py-3 bg-[#2a2a2a] hover:bg-[#333333] text-gray-200 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-gray-700 hover:border-gray-600"
              aria-label="Clear selected video"
            >
              <X className="w-5 h-5" aria-hidden="true" />
              Clear
            </button>
            <button
              onClick={handleProcess}
              disabled={disabled}
              className="px-8 py-3 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-orange-500/20"
              aria-label="Generate Knowledge Base"
            >
              <Video className="w-5 h-5" aria-hidden="true" />
              Generate Knowledge Base
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
