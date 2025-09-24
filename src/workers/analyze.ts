// Web Worker for on-device energy analysis
// Uses basic heuristics and computer vision to detect energy inefficiencies
// Privacy-first: all processing happens locally

export interface AnalysisResult {
  findings: EnergyFinding[];
  confidence: number;
  processingTime: number;
}

export interface EnergyFinding {
  id: string;
  type: 'window' | 'door' | 'appliance' | 'insulation' | 'lighting';
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  title: string;
  description: string;
  location?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

// Basic heuristic analysis functions
function detectWindowDrafts(imageData: ImageData): EnergyFinding[] {
  const findings: EnergyFinding[] = [];
  const { data, width, height } = imageData;
  
  // Simple edge detection to find potential gaps/drafts
  // Look for bright lines that might indicate daylight coming through gaps
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // Calculate brightness
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      
      // Look for bright spots that might indicate light leaks
      if (brightness > 200) {
        // Check if it's part of a line (potential draft)
        const horizontalGradient = Math.abs(data[idx] - data[idx - 4]) + 
                                   Math.abs(data[idx] - data[idx + 4]);
        const verticalGradient = Math.abs(data[idx] - data[(y-1) * width * 4 + x * 4]) + 
                                Math.abs(data[idx] - data[(y+1) * width * 4 + x * 4]);
        
        if (horizontalGradient > 100 || verticalGradient > 100) {
          findings.push({
            id: `window_draft_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            type: 'window',
            severity: 'medium',
            confidence: 0.6,
            title: 'Potential Window Draft',
            description: 'Detected bright lines that may indicate air leaks around window frames',
            location: `Position: ${x}, ${y}`,
            boundingBox: { x: x - 10, y: y - 10, width: 20, height: 20 }
          });
        }
      }
    }
  }
  
  return findings.slice(0, 5); // Limit findings to avoid spam
}

function detectOldAppliances(imageData: ImageData): EnergyFinding[] {
  const findings: EnergyFinding[] = [];
  // Placeholder for appliance detection
  // In a real implementation, this would use trained models
  
  // Simple color-based detection for old appliances (very basic)
  const { data, width, height } = imageData;
  let yellowPixels = 0;
  let totalPixels = width * height;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Detect yellowish colors that might indicate old incandescent bulbs
    if (r > 200 && g > 150 && b < 100) {
      yellowPixels++;
    }
  }
  
  const yellowPercentage = yellowPixels / totalPixels;
  if (yellowPercentage > 0.01) { // More than 1% yellow pixels
    findings.push({
      id: `lighting_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: 'lighting',
      severity: 'low',
      confidence: 0.4,
      title: 'Potential Incandescent Lighting',
      description: 'Detected warm yellow lighting that may indicate inefficient incandescent bulbs',
      location: 'Multiple locations detected'
    });
  }
  
  return findings;
}

function detectInsulationIssues(imageData: ImageData): EnergyFinding[] {
  const findings: EnergyFinding[] = [];
  // Placeholder for thermal/insulation detection
  // Would typically require thermal imaging or other specialized detection
  
  return findings;
}

// Main analysis function
function analyzeImage(imageData: ImageData): EnergyFinding[] {
  const startTime = performance.now();
  
  const findings: EnergyFinding[] = [
    ...detectWindowDrafts(imageData),
    ...detectOldAppliances(imageData),
    ...detectInsulationIssues(imageData)
  ];
  
  const processingTime = performance.now() - startTime;
  console.log(`Analysis completed in ${processingTime.toFixed(2)}ms`);
  
  return findings;
}

// Web Worker message handler
self.onmessage = function(e) {
  const { imageData, frameIndex } = e.data;
  
  try {
    const findings = analyzeImage(imageData);
    
    // Send results back to main thread
    self.postMessage({
      success: true,
      findings,
      frameIndex,
      processingTime: performance.now()
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message,
      frameIndex
    });
  }
};

export {};