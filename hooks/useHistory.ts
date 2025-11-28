import { useState, useCallback } from 'react';
import { DrawingElement } from '../types';

export const useHistory = (initialElements: DrawingElement[]) => {
  const [history, setHistory] = useState<DrawingElement[][]>([initialElements]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pushState = useCallback((newElements: DrawingElement[]) => {
    // If we are not at the end of history, discard future states
    const newHistory = history.slice(0, currentIndex + 1);
    
    // Only push if different (shallow check for performance or deep if needed)
    // For now, we push everything. Optimizations can be added later.
    newHistory.push(newElements);
    
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [history, currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [history, currentIndex]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    elements: history[currentIndex],
    pushState,
    undo,
    redo,
    canUndo,
    canRedo
  };
};