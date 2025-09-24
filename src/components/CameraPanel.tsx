import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, Upload, StopCircle, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { useTranslation } from 'react-i18next';

interface CameraPanelProps {
  onFrameCaptured: (imageData: ImageData) => void;
  onMediaRecorded: (blob: Blob) => void;
  isRecording?: boolean;
  onRecordingChange?: (recording: boolean) => void;
}

export function CameraPanel({ 
  onFrameCaptured, 
  onMediaRecorded, 
  isRecording = false,
  onRecordingChange 
}: CameraPanelProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  // Request camera access with fallback
  const initCamera = useCallback(async () => {
    try {
      // Try to get camera with environment facing preference (rear camera)
      const constraints: MediaStreamConstraints = {
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false // Privacy-first: no audio recording needed
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setHasCamera(true);
        setCameraError(null);
      }
    } catch (error) {
      console.warn('Camera access failed:', error);
      setHasCamera(false);
      setCameraError(
        error instanceof Error 
          ? error.message 
          : 'Camera not available. Please use file upload instead.'
      );
    }
  }, []);

  // Start recording video for analysis
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        onMediaRecorded(blob);
      };

      mediaRecorder.start(1000); // Collect data every second
      onRecordingChange?.(true);
    } catch (error) {
      console.error('Recording failed:', error);
    }
  }, [recordedChunks, onMediaRecorded, onRecordingChange]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      onRecordingChange?.(false);
    }
  }, [onRecordingChange]);

  // Capture single frame for analysis
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    onFrameCaptured(imageData);
  }, [onFrameCaptured]);

  // Handle file upload fallback
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        // Process image file
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          onFrameCaptured(imageData);
        };
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        // Process video file
        onMediaRecorded(file);
      }
    });
  }, [onFrameCaptured, onMediaRecorded]);

  useEffect(() => {
    initCamera();
    
    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [initCamera]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        {/* Privacy Notice */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <p className="font-medium mb-1">{t('scan.privacyNotice')}</p>
          <p className="text-xs">All analysis happens locally on your device. No video or images are sent to external servers.</p>
        </div>

        {/* Camera View or Fallback */}
        <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden aspect-video">
          {hasCamera ? (
            <>
              <video 
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              {analysisProgress > 0 && (
                <div className="absolute bottom-2 left-2 right-2">
                  <Progress value={analysisProgress} className="bg-black/20" />
                  <p className="text-white text-xs mt-1">{t('scan.processing')}</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <Camera className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 text-center mb-2">
                {cameraError || t('scan.fallbackMessage')}
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('scan.uploadImages')}
              </Button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {hasCamera && (
            <>
              <Button
                onClick={captureFrame}
                variant="outline"
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                {t('scan.takePhoto')}
              </Button>
              
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {t('scan.startRecording')}
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  className="flex-1"
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  {t('scan.stopRecording')}
                </Button>
              )}
            </>
          )}
        </div>

        {/* Hidden file input for fallback */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Hidden canvas for frame processing */}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}