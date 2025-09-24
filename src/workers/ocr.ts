// Web Worker for OCR processing of utility bills
// Uses Tesseract.js to extract text from energy bills for analysis

import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  data: {
    kWh?: number;
    rate?: number;
    monthlyUsage?: number;
    billAmount?: number;
  };
}

function extractEnergyData(text: string): OCRResult['data'] {
  const data: OCRResult['data'] = {};
  
  // Common patterns for Australian energy bills
  const patterns = {
    kWh: /(\d+(?:\.\d+)?)\s*kWh/i,
    rate: /(\d+(?:\.\d+)?)\s*¢?\/kWh/i,
    billAmount: /\$(\d+(?:\.\d+)?)/g,
    usage: /usage[\s:]*(\d+(?:\.\d+)?)/i
  };
  
  // Extract kWh usage
  const kWhMatch = text.match(patterns.kWh);
  if (kWhMatch) {
    data.kWh = parseFloat(kWhMatch[1]);
  }
  
  // Extract rate per kWh
  const rateMatch = text.match(patterns.rate);
  if (rateMatch) {
    data.rate = parseFloat(rateMatch[1]) / 100; // Convert cents to dollars
  }
  
  // Extract bill amounts
  const billMatches = [...text.matchAll(patterns.billAmount)];
  if (billMatches.length > 0) {
    // Usually the largest amount is the total bill
    const amounts = billMatches.map(match => parseFloat(match[1]));
    data.billAmount = Math.max(...amounts);
  }
  
  // Extract monthly usage
  const usageMatch = text.match(patterns.usage);
  if (usageMatch) {
    data.monthlyUsage = parseFloat(usageMatch[1]);
  }
  
  return data;
}

self.onmessage = async function(e) {
  const { imageData, options = {} } = e.data;
  
  try {
    // Initialize Tesseract worker
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: m => {
        // Send progress updates
        if (m.status === 'recognizing text') {
          self.postMessage({
            type: 'progress',
            progress: m.progress
          });
        }
      }
    });
    
    // Perform OCR
    const { data } = await worker.recognize(imageData, {
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,$/¢ ',
      ...options
    });
    
    const extractedData = extractEnergyData(data.text);
    
    const result: OCRResult = {
      text: data.text,
      confidence: data.confidence / 100, // Convert to 0-1 scale
      data: extractedData
    };
    
    await worker.terminate();
    
    self.postMessage({
      success: true,
      result
    });
    
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message
    });
  }
};

export {};