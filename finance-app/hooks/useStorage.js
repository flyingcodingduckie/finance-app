// hooks/useStorage.js
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useStorage(key, initial = []) {
  const [data, setData]       = useState(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(key).then((raw) => {
      if (raw) setData(JSON.parse(raw));
      setLoading(false);
    });
  }, [key]);

  const persist = useCallback((next) => {
    setData(next);
    AsyncStorage.setItem(key, JSON.stringify(next));
  }, [key]);

  return [data, persist, loading];
}
