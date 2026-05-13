import { useEffect, useState, useCallback } from 'react';
import { 
  listenToAggregatedMetrics,
  listenToSettingsUpdates,
  listenToCollectionChanges,
  syncDatabaseRecord,
  updateSharedRecord,
  pushDashboardMetrics,
  syncUserSettings,
  removeListener
} from './dataSync';

// ═══════════════════════════════════════════════════════════════════════════
// useSync Hook - Easy integration of sync service in React components
// ═══════════════════════════════════════════════════════════════════════════

export function useMetricsSync(userId) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const listenerId = listenToAggregatedMetrics(userId, (metricsData) => {
      setMetrics(metricsData);
      setLoading(false);
    });

    return () => {
      removeListener(listenerId);
    };
  }, [userId]);

  return { metrics, loading };
}

export function useSettingsSync(userId) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const listenerId = listenToSettingsUpdates(userId, (settingsData) => {
      setSettings(settingsData);
      setLoading(false);
    });

    return () => {
      removeListener(listenerId);
    };
  }, [userId]);

  const updateSettings = useCallback(
    async (newSettings) => {
      return await syncUserSettings(userId, { ...settings, ...newSettings });
    },
    [userId, settings]
  );

  return { settings, loading, updateSettings };
}

export function useCollectionSync(userId, collectionName) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !collectionName) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const listenerId = listenToCollectionChanges(userId, collectionName, (recordsData) => {
      setRecords(recordsData);
      setLoading(false);
    });

    return () => {
      removeListener(listenerId);
    };
  }, [userId, collectionName]);

  const addRecord = useCallback(
    async (recordData) => {
      return await syncDatabaseRecord(userId, collectionName, recordData);
    },
    [userId, collectionName]
  );

  const updateRecord = useCallback(
    async (recordId, updates) => {
      return await updateSharedRecord(userId, collectionName, recordId, updates);
    },
    [userId, collectionName]
  );

  return { records, loading, addRecord, updateRecord };
}
