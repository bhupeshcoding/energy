// IndexedDB utilities for storing scan data, findings, and reports locally
// Privacy-first approach - all data stays on device

import { openDB, type IDBPDatabase } from 'idb';

export interface ScanData {
  id: string;
  timestamp: number;
  mediaFiles: string[]; // blob URLs
  findings: any[];
  checklist: Record<string, any>;
  survey: Record<string, any>;
  status: 'in_progress' | 'completed' | 'archived';
}

export interface ReportData {
  id: string;
  scanId: string;
  timestamp: number;
  pdfBlob?: Blob;
  findings: any[];
  recommendations: string[];
}

const DB_NAME = 'RuralEnergyAssistant';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

export async function initDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store scan sessions
      if (!db.objectStoreNames.contains('scans')) {
        const scanStore = db.createObjectStore('scans', { keyPath: 'id' });
        scanStore.createIndex('timestamp', 'timestamp');
        scanStore.createIndex('status', 'status');
      }
      
      // Store generated reports
      if (!db.objectStoreNames.contains('reports')) {
        const reportStore = db.createObjectStore('reports', { keyPath: 'id' });
        reportStore.createIndex('scanId', 'scanId');
        reportStore.createIndex('timestamp', 'timestamp');
      }
      
      // Store user preferences and settings
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
  
  return dbInstance;
}

export async function saveScanData(scanData: ScanData): Promise<void> {
  const db = await initDB();
  await db.put('scans', scanData);
}

export async function getScanData(id: string): Promise<ScanData | undefined> {
  const db = await initDB();
  return db.get('scans', id);
}

export async function getAllScans(): Promise<ScanData[]> {
  const db = await initDB();
  return db.getAllFromIndex('scans', 'timestamp');
}

export async function saveReportData(reportData: ReportData): Promise<void> {
  const db = await initDB();
  await db.put('reports', reportData);
}

export async function getReportData(id: string): Promise<ReportData | undefined> {
  const db = await initDB();
  return db.get('reports', id);
}

export async function saveSetting(key: string, value: any): Promise<void> {
  const db = await initDB();
  await db.put('settings', { key, value });
}

export async function getSetting(key: string): Promise<any> {
  const db = await initDB();
  const result = await db.get('settings', key);
  return result?.value;
}

// Clean up old data to prevent storage bloat
export async function cleanupOldData(daysToKeep: number = 30): Promise<void> {
  const db = await initDB();
  const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
  
  const tx = db.transaction(['scans', 'reports'], 'readwrite');
  
  // Clean old scans
  const scanCursor = await tx.objectStore('scans').index('timestamp').openCursor();
  if (scanCursor) {
    for (let cursor = scanCursor; cursor; cursor = await cursor.continue()) {
      if (cursor.value.timestamp < cutoffTime && cursor.value.status === 'archived') {
        await cursor.delete();
      }
    }
  }
  
  await tx.done;
}