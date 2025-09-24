import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { CameraPanel } from '../components/CameraPanel';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { useTranslation } from 'react-i18next';
import { EnergyFinding, generateFindingId } from '../lib/energy';
import { saveScanData, ScanData } from '../lib/storage';

export function Scan() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [isRecording, setIsRecording] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [findings, setFindings] = useState<EnergyFinding[]>([]);
  const [scanId] = useState(() => `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [hasConsented, setHasConsented] = useState(false);
  const [analysisWorker, setAnalysisWorker] = useState<Worker | null>(null);

  // Initialize analysis worker
  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/analyze.ts', import.meta.url),
      { type: 'module' }
    );
    
    worker.onmessage = (e) => {
      const { success, findings: workerFindings, frameIndex } = e.data;
      
      if (success && workerFindings) {
        setFindings(prev => [...prev, ...workerFindings]);
        setAnalysisProgress(prev => Math.min(prev + 10, 90));
      }
    };
    
    setAnalysisWorker(worker);
    
    return () => worker.terminate();
  }, []);

  const handleFrameCaptured = useCallback(async (imageData: ImageData) => {
    if (!analysisWorker || !hasConsented) return;

    // Send frame to worker for analysis
    analysisWorker.postMessage({
      imageData: {
        data: Array.from(imageData.data),
        width: imageData.width,
        height: imageData.height
      },
      frameIndex: Date.now()
    });

    setAnalysisProgress(prev => Math.min(prev + 5, 95));
  }, [analysisWorker, hasConsented]);

  const handleMediaRecorded = useCallback(async (blob: Blob) => {
    if (!hasConsented) return;
    
    console.log('Media recorded:', blob.size, 'bytes');
    
    // Store media in IndexedDB for privacy
    const mediaUrl = URL.createObjectURL(blob);
    
    // Save scan data
    const scanData: ScanData = {
      id: scanId,
      timestamp: Date.now(),
      mediaFiles: [mediaUrl],
      findings: findings.map(f => ({ ...f })),
      checklist: {},
      survey: {},
      status: 'in_progress'
    };
    
    await saveScanData(scanData);
    setAnalysisProgress(100);
  }, [scanId, findings, hasConsented]);

  const handleComplete = async () => {
    // Save current findings and proceed to checklist
    const scanData: ScanData = {
      id: scanId,
      timestamp: Date.now(),
      mediaFiles: [],
      findings: findings.map(f => ({ ...f })),
      checklist: {},
      survey: {},
      status: 'in_progress'
    };
    
    await saveScanData(scanData);
    navigate(`/checklist?scanId=${scanId}`);
  };

  if (!hasConsented) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Privacy & Consent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Your Privacy is Protected</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• All analysis happens locally on your device</li>
                <li>• No images or videos are uploaded to servers</li>
                <li>• Data is stored only in your device's local storage</li>
                <li>• You can delete all data at any time</li>
              </ul>
            </div>
            
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent"
                checked={hasConsented}
                onChange={(e) => setHasConsented(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="consent" className="text-sm">
                {t('scan.consent')} and understand that all processing happens locally on my device for privacy protection.
              </label>
            </div>
            
            <Button 
              onClick={() => setHasConsented(true)}
              disabled={!hasConsented}
              className="w-full"
            >
              Continue to Scan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t('scan.title')}</h1>
        </div>

        {/* Instructions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              {t('scan.instructions')}
            </p>
          </CardContent>
        </Card>

        {/* Camera Panel */}
        <div className="mb-6">
          <CameraPanel
            onFrameCaptured={handleFrameCaptured}
            onMediaRecorded={handleMediaRecorded}
            isRecording={isRecording}
            onRecordingChange={setIsRecording}
          />
        </div>

        {/* Analysis Progress */}
        {analysisProgress > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Analysis Progress</span>
                <span className="text-sm text-muted-foreground">{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="mb-4" />
              
              {findings.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Initial Findings ({findings.length})</h3>
                  <div className="space-y-1">
                    {findings.slice(0, 3).map(finding => (
                      <div key={finding.id} className="text-sm text-muted-foreground">
                        • {finding.title}
                      </div>
                    ))}
                    {findings.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        + {findings.length - 3} more findings...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        {analysisProgress > 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                {findings.length > 0 
                  ? `Found ${findings.length} potential energy issues. Continue to complete your assessment.`
                  : 'Analysis in progress. Continue when ready to proceed with the detailed checklist.'
                }
              </p>
              <Button onClick={handleComplete}>
                Continue to Checklist
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}