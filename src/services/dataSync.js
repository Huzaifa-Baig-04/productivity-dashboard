import syncService from './syncService';

// ═══════════════════════════════════════════════════════════════════════════
// Data Sync Hooks & Utilities
// Helper functions to integrate sync service into React components
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialize sync service and set up periodic queue processing
 */
export function initializeSync() {
  // Process sync queue every 5 seconds
  const queueInterval = setInterval(() => {
    syncService.processSyncQueue();
  }, 5000);

  // Return cleanup function
  return () => {
    clearInterval(queueInterval);
    syncService.unsubscribeAll();
  };
}

/**
 * Sync dashboard metrics from current device
 * @param {string} userId - User ID
 * @param {object} metrics - Metrics object
 */
export async function pushDashboardMetrics(userId, metrics) {
  return await syncService.pushMetrics(userId, metrics);
}

/**
 * Listen for aggregated metrics from all devices
 * @param {string} userId - User ID
 * @param {function} callback - Callback function
 */
export function listenToAggregatedMetrics(userId, callback) {
  return syncService.subscribeToMetrics(userId, callback);
}

/**
 * Sync user settings/preferences across devices
 * @param {string} userId - User ID
 * @param {object} settings - Settings object
 */
export async function syncUserSettings(userId, settings) {
  return await syncService.syncSettings(userId, settings);
}

/**
 * Listen for settings updates from other devices
 * @param {string} userId - User ID
 * @param {function} callback - Callback function
 */
export function listenToSettingsUpdates(userId, callback) {
  return syncService.subscribeToSettings(userId, callback);
}

/**
 * Sync a database record across devices
 * @param {string} userId - User ID
 * @param {string} collectionName - Collection name
 * @param {object} recordData - Record data
 */
export async function syncDatabaseRecord(userId, collectionName, recordData) {
  return await syncService.pushDatabaseRecord(userId, collectionName, recordData);
}

/**
 * Listen for collection changes in real-time
 * @param {string} userId - User ID
 * @param {string} collectionName - Collection name
 * @param {function} callback - Callback function
 */
export function listenToCollectionChanges(userId, collectionName, callback) {
  return syncService.subscribeToCollection(userId, collectionName, callback);
}

/**
 * Update a record across all devices
 * @param {string} userId - User ID
 * @param {string} collectionName - Collection name
 * @param {string} recordId - Record ID
 * @param {object} updates - Updates object
 */
export async function updateSharedRecord(userId, collectionName, recordId, updates) {
  return await syncService.updateRecord(userId, collectionName, recordId, updates);
}

/**
 * Get current sync status
 */
export function getSyncStatus() {
  return syncService.getSyncStatus();
}

/**
 * Get queued items waiting to sync
 */
export function getQueuedItems() {
  return syncService.getQueuedItems();
}

/**
 * Force sync queue processing
 */
export async function forceSyncQueue() {
  return await syncService.processSyncQueue();
}

/**
 * Remove a specific listener
 */
export function removeListener(listenerId) {
  syncService.unsubscribe(listenerId);
}

/**
 * Remove all listeners
 */
export function removeAllListeners() {
  syncService.unsubscribeAll();
}
