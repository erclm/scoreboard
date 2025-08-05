import { AppState } from '../types';

const STORAGE_KEY = 'scoreboard-data';

export const saveData = (data: AppState): boolean => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
    
    // Verify save worked
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === serialized) {
      console.log('✅ Data saved successfully');
      return true;
    } else {
      console.error('❌ Save verification failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to save data:', error);
    
    // Check if it's a quota exceeded error
    if (error instanceof DOMException && error.code === 22) {
      console.error('💾 Storage quota exceeded. Try clearing old data.');
    }
    return false;
  }
};

export const loadData = (): AppState | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      console.log('✅ Data loaded successfully');
      return parsed;
    } else {
      console.log('📭 No saved data found');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to load data:', error);
    return null;
  }
};

export const clearData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
};

export const exportData = (data: AppState): void => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `scoreboard-data-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<AppState> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid file format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const checkStorageHealth = (): { available: boolean; quota?: number; used?: number } => {
  try {
    // Test localStorage availability
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    
    // Get storage quota info if available
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        console.log(`💾 Storage: ${Math.round((estimate.usage || 0) / 1024)}KB used of ${Math.round((estimate.quota || 0) / 1024 / 1024)}MB`);
      });
    }
    
    return { available: true };
  } catch (error) {
    console.error('❌ localStorage not available:', error);
    return { available: false };
  }
};
