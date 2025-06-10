
import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { processFile } from '../../utils/dataProcessor';

const UploadArea: React.FC = () => {
  const { addDataset, setCurrentView, setLoading } = useAppStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('idle');

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const processedData = await processFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      const dataset = {
        id: Date.now().toString(),
        name: file.name.split('.')[0],
        filename: file.name,
        data: processedData.data,
        columns: processedData.columns,
        rows: processedData.data.length,
        domain: processedData.domain,
        confidence: processedData.confidence,
        uploadDate: new Date(),
        dataQuality: processedData.dataQuality,
        detectedFeatures: processedData.detectedFeatures
      };

      addDataset(dataset);
      setUploadStatus('success');
      
      setTimeout(() => {
        setCurrentView('datasets');
      }, 1500);

    } catch (error) {
      console.error('File upload error:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus('idle');
      }, 3000);
    }
  }, [addDataset, setCurrentView]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] rounded-full mb-4"
        >
          <Upload className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold text-white mb-2">Upload Your Dataset</h1>
        <p className="text-gray-400">Drag and drop your files here, or click to browse</p>
        <p className="text-sm text-gray-500 mt-2">
          Supports CSV, Excel (XLSX/XLS), JSON, and TSV files up to 50MB
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-[#00d4ff] bg-[#00d4ff]/5' 
            : 'border-[#2a2a2a] hover:border-[#00d4ff]/50'
          }
          ${isUploading ? 'pointer-events-none' : 'cursor-pointer'}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Upload className="w-8 h-8 text-[#00d4ff]" />
              </motion.div>
            </div>
            <div>
              <p className="text-white font-medium mb-2">Processing your dataset...</p>
              <div className="w-64 mx-auto bg-[#2a2a2a] rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">{uploadProgress}% complete</p>
            </div>
          </div>
        ) : uploadStatus === 'success' ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <p className="text-green-500 font-medium">Upload successful!</p>
              <p className="text-gray-400 text-sm">Redirecting to datasets...</p>
            </div>
          </div>
        ) : uploadStatus === 'error' ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <p className="text-red-500 font-medium">Upload failed</p>
              <p className="text-gray-400 text-sm">Please try again with a supported file format</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-[#00d4ff]" />
            </div>
            <div>
              <p className="text-xl font-medium text-white mb-2">
                {isDragOver ? 'Drop your file here' : 'Choose a file to upload'}
              </p>
              <p className="text-gray-400">
                Multiple files • Auto-detection • Data validation
              </p>
            </div>
          </div>
        )}

        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls,.json,.txt,.tsv"
          onChange={handleFileSelect}
        />
      </motion.div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {[
          { icon: '🔍', title: 'Auto-detection', desc: 'Automatically detects data domain and structure' },
          { icon: '📊', title: 'Data validation', desc: 'Real-time quality assessment and error detection' },
          { icon: '🤖', title: 'AI insights', desc: 'Powered by advanced AI for instant analysis' }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-[#1a1a1a] rounded-lg p-6 text-center border border-[#2a2a2a] hover:border-[#00d4ff]/30 transition-colors"
          >
            <div className="text-2xl mb-3">{feature.icon}</div>
            <h3 className="text-white font-medium mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UploadArea;
