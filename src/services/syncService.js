import { 
  ref, 
  set, 
  get, 
  onValue, 
  update,
  child,
  query,
  orderByChild,
  limitToLast
} from 'firebase/database';
import { database } from '../firebase';

// ═══════════════════════════════════════════════════════════════════════════
// Real-time Synchronization Service
// Handles mobile ↔ PC data sync for dashboard metrics, settings, and records
// ═══════════════════════════════════════════════════════════════════════════

class SyncService {
  constructor() {
    this.listeners = new Map();
    this.syncQueue = [];
    this.deviceId = this.getOrCreateDeviceId();
    this.platform = this.detectPlatform();
    this.isSyncing = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Device & Platform Detection
  // ─────────────────────────────────────────────────────────────────────────

  getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  detectPlatform() {
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) return 'android';
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    return 'web';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Dashboard Metrics Sync
  // ─────────────────────────────────────────────────────────────────────────

  async pushMetrics(userId, metrics) {
    try {
      const timestamp = Date.now();
      const metricsRef = ref(database, `metrics/${userId}/${this.platform}/${this.deviceId}`);
      
      await set(metricsRef, {
        data: metrics,
        deviceId: this.deviceId,
        platform: this.platform,
        lastUpdated: timestamp,
        synced: true
      });

      console.log('✓ Metrics synced:', metrics);
      return { success: true, timestamp };
    } catch (error) {
      console.error('✗ Metrics sync failed:', error);
      this.addToQueue({ type: 'metrics', userId, metrics });
      return { success: false, error: error.message };
    }
  }

  subscribeToMetrics(userId, callback) {
    const metricsRef = ref(database, `metrics/${userId}`);
    
    const unsubscribe = onValue(metricsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const aggregatedMetrics = this.aggregateMetrics(data);
        callback(aggregatedMetrics);
      }
    }, (error) => {
      console.error('Metrics subscription error:', error);
    });

    const listenerId = `metrics_${userId}`;
    this.listeners.set(listenerId, unsubscribe);
    return listenerId;
  }

  aggregateMetrics(metricsData) {
    // Combine metrics from all devices (mobile + PC)
    const aggregated = {};
    
    Object.entries(metricsData).forEach(([platform, devices]) => {
      Object.entries(devices).forEach(([deviceId, deviceData]) => {
        if (deviceData.data) {
          Object.entries(deviceData.data).forEach(([key, value]) => {
            if (typeof value === 'number') {
              aggregated[key] = (aggregated[key] || 0) + value;
            } else if (Array.isArray(value)) {
              aggregated[key] = [...(aggregated[key] || []), ...value];
            } else {
              aggregated[key] = value;
            }
          });
        }
      });
    });

    return aggregated;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Settings/Preferences Sync
  // ─────────────────────────────────────────────────────────────────────────

  async syncSettings(userId, settings) {
    try {
      const settingsRef = ref(database, `settings/${userId}`);
      
      await set(settingsRef, {
        ...settings,
        lastUpdated: Date.now(),
        syncedFrom: this.deviceId,
        platform: this.platform
      });

      console.log('✓ Settings synced');
      return { success: true };
    } catch (error) {
      console.error('✗ Settings sync failed:', error);
      this.addToQueue({ type: 'settings', userId, settings });
      return { success: false, error: error.message };
    }
  }

  subscribeToSettings(userId, callback) {
    const settingsRef = ref(database, `settings/${userId}`);
    
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const settings = snapshot.val();
      if (settings) {
        callback(settings);
      }
    }, (error) => {
      console.error('Settings subscription error:', error);
    });

    const listenerId = `settings_${userId}`;
    this.listeners.set(listenerId, unsubscribe);
    return listenerId;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Database Records Sync
  // ─────────────────────────────────────────────────────────────────────────

  async pushDatabaseRecord(userId, collectionName, recordData) {
    try {
      const recordId = recordData.id || `record_${Date.now()}`;
      const recordRef = ref(database, `data/${userId}/${collectionName}/${recordId}`);
      
      await set(recordRef, {
        ...recordData,
        id: recordId,
        createdAt: recordData.createdAt || Date.now(),
        updatedAt: Date.now(),
        syncedFrom: this.deviceId,
        platform: this.platform
      });

      console.log(`✓ Record synced to ${collectionName}`);
      return { success: true, recordId };
    } catch (error) {
      console.error('✗ Record sync failed:', error);
      this.addToQueue({ type: 'record', userId, collectionName, recordData });
      return { success: false, error: error.message };
    }
  }

  subscribeToCollection(userId, collectionName, callback) {
    const collectionRef = ref(database, `data/${userId}/${collectionName}`);
    
    const unsubscribe = onValue(collectionRef, (snapshot) => {
      const data = snapshot.val();
      const records = data ? Object.values(data) : [];
      callback(records);
    }, (error) => {
      console.error('Collection subscription error:', error);
    });

    const listenerId = `collection_${userId}_${collectionName}`;
    this.listeners.set(listenerId, unsubscribe);
    return listenerId;
  }

  async updateRecord(userId, collectionName, recordId, updates) {
    try {
      const recordRef = ref(database, `data/${userId}/${collectionName}/${recordId}`);
      
      await update(recordRef, {
        ...updates,
        updatedAt: Date.now(),
        lastSyncedFrom: this.deviceId,
        platform: this.platform
      });

      console.log(`✓ Record updated in ${collectionName}`);
      return { success: true };
    } catch (error) {
      console.error('✗ Record update failed:', error);
      return { success: false, error: error.message };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Conflict Resolution & Sync Queue
  // ─────────────────────────────────────────────────────────────────────────

  addToQueue(syncItem) {
    this.syncQueue.push({
      ...syncItem,
      queuedAt: Date.now(),
      attempts: 0
    });
    console.log('Added to sync queue:', syncItem);
  }

  async processSyncQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) return;

    this.isSyncing = true;
    const failedItems = [];

    while (this.syncQueue.length > 0) {
      const item = this.syncQueue.shift();
      
      if (item.attempts > 3) {
        console.warn('Max retries exceeded, storing locally:', item);
        failedItems.push(item);
        continue;
      }

      try {
        switch (item.type) {
          case 'metrics':
            await this.pushMetrics(item.userId, item.metrics);
            break;
          case 'settings':
            await this.syncSettings(item.userId, item.settings);
            break;
          case 'record':
            await this.pushDatabaseRecord(item.userId, item.collectionName, item.recordData);
            break;
        }
      } catch (error) {
        item.attempts++;
        this.syncQueue.push(item);
        failedItems.push(item);
      }
    }

    this.isSyncing = false;
    return { processed: true, failedCount: failedItems.length };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Listener Management
  // ─────────────────────────────────────────────────────────────────────────

  unsubscribe(listenerId) {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
      console.log('Listener removed:', listenerId);
    }
  }

  unsubscribeAll() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
    console.log('All listeners removed');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Status & Diagnostics
  // ─────────────────────────────────────────────────────────────────────────

  getSyncStatus() {
    return {
      deviceId: this.deviceId,
      platform: this.platform,
      activeListeners: this.listeners.size,
      queuedItems: this.syncQueue.length,
      isSyncing: this.isSyncing
    };
  }

  getQueuedItems() {
    return this.syncQueue;
  }
}

// Export singleton instance
export default new SyncService();
