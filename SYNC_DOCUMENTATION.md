# Mobile ↔ PC Sync System Documentation

## Overview
Real-time synchronization system for syncing dashboard metrics, user settings, and database records between Android mobile app and PC using Firebase Realtime Database.

---

## Setup Instructions

### 1. Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing
3. Enable **Realtime Database** (Choose **North America** region)
4. Enable **Authentication** (Email/Password)
5. Copy your Firebase credentials

### 2. Environment Variables
Create `.env` in your project root:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

### 3. Firebase Rules
Set these security rules in Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "metrics": {
      "$uid": {
        ".read": "auth.uid === $uid",
        ".write": "auth.uid === $uid",
        "$platform": {
          "$deviceId": {
            ".validate": "newData.hasChildren(['data', 'lastUpdated'])"
          }
        }
      }
    },
    "settings": {
      "$uid": {
        ".read": "auth.uid === $uid",
        ".write": "auth.uid === $uid"
      }
    },
    "data": {
      "$uid": {
        ".read": "auth.uid === $uid",
        ".write": "auth.uid === $uid",
        "$collection": {
          "$recordId": {
            ".validate": "newData.hasChildren(['id'])"
          }
        }
      }
    }
  }
}
```

---

## Architecture

### Files Created
- `src/firebase.js` - Firebase initialization
- `src/services/syncService.js` - Core sync engine
- `src/services/dataSync.js` - Helper functions
- `src/services/useSync.js` - React hooks
- `src/components/SyncStatusIndicator.jsx` - UI indicator

### Data Structure

#### Dashboard Metrics
```javascript
// Path: metrics/{userId}/{platform}/{deviceId}
{
  data: { /* your metrics */ },
  deviceId: "device_xxx",
  platform: "android|ios|web",
  lastUpdated: timestamp,
  synced: true
}
```

#### Settings
```javascript
// Path: settings/{userId}
{
  theme: "dark",
  language: "en",
  notifications: true,
  lastUpdated: timestamp,
  syncedFrom: "device_xxx",
  platform: "android"
}
```

#### Database Records
```javascript
// Path: data/{userId}/{collectionName}/{recordId}
{
  id: "record_xxx",
  /* custom record data */,
  createdAt: timestamp,
  updatedAt: timestamp,
  syncedFrom: "device_xxx",
  platform: "android"
}
```

---

## Usage

### 1. Initialize Sync
In your main `App.jsx`:

```javascript
import { initializeSync } from './services/dataSync';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Initialize sync service & queue processor
    const cleanup = initializeSync();
    return cleanup;
  }, []);

  return (
    // Your app components
  );
}
```

### 2. Push Metrics to All Devices
```javascript
import { pushDashboardMetrics } from './services/dataSync';

const metrics = {
  salahDone: 3,
  tasksDone: 5,
  studyHours: 2.5,
  workoutEnergy: 8
};

// Push from current device
await pushDashboardMetrics('user_123', metrics);
```

### 3. Listen for Aggregated Metrics
```javascript
import { useMetricsSync } from './services/useSync';

function Dashboard() {
  const { metrics, loading } = useMetricsSync('user_123');

  if (loading) return <div>Loading metrics...</div>;

  return (
    <div>
      <h3>Total Prayers: {metrics?.prayersDone || 0}</h3>
      <h3>Total Tasks: {metrics?.tasksDone || 0}</h3>
    </div>
  );
}
```

### 4. Sync Settings
```javascript
import { syncUserSettings } from './services/dataSync';

const settings = {
  theme: 'dark',
  notifications: true,
  language: 'en'
};

await syncUserSettings('user_123', settings);
```

### 5. Listen for Settings Updates
```javascript
import { useSettingsSync } from './services/useSync';

function SettingsPanel() {
  const { settings, updateSettings } = useSettingsSync('user_123');

  const handleThemeChange = async (newTheme) => {
    await updateSettings({ theme: newTheme });
  };

  return (
    <div>
      <p>Current Theme: {settings?.theme}</p>
      <button onClick={() => handleThemeChange('light')}>Light</button>
    </div>
  );
}
```

### 6. Database Records Sync
```javascript
import { useCollectionSync } from './services/useSync';

function TodosList() {
  const { records, addRecord, updateRecord } = useCollectionSync(
    'user_123',
    'todos'
  );

  const handleAddTodo = async (todoData) => {
    await addRecord({
      task: "Python practice",
      priority: "High",
      done: false
    });
  };

  const handleUpdateTodo = async (recordId) => {
    await updateRecord(recordId, { done: true });
  };

  return (
    <div>
      {records.map(todo => (
        <div key={todo.id}>
          <span>{todo.task}</span>
          <button onClick={() => handleUpdateTodo(todo.id)}>Done</button>
        </div>
      ))}
    </div>
  );
}
```

### 7. Display Sync Status
```javascript
import { SyncStatusIndicator } from './components/SyncStatusIndicator';

function TopBar() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <h1>Dashboard</h1>
      <SyncStatusIndicator />
    </div>
  );
}
```

---

## Real-Time Sync Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Real-Time Sync Architecture                      │
└─────────────────────────────────────────────────────────────┘

PC Updates State
    ↓
pushDashboardMetrics() / syncSettings() / syncDatabaseRecord()
    ↓
Firebase Realtime Database
    ↓
    ├→ Listeners on Android
    │   └→ Update UI in real-time
    │
    ├→ Listeners on Web
    │   └→ Update UI in real-time
    │
    └→ Listeners on other PCs
        └→ Update UI in real-time

Offline Support:
    ↓
Changes added to Sync Queue
    ↓
Network restored (5s interval check)
    ↓
processSyncQueue() pushes queued items
    ↓
All devices synchronized
```

---

## Conflict Resolution

The system uses **last-write-wins** strategy with timestamps:

```javascript
// When conflicts occur:
// 1. Compare lastUpdated timestamps
// 2. Accept the most recent update
// 3. Sync queued items retry up to 3 times
// 4. Failed items logged for manual review
```

---

## Offline Behavior

- All changes are queued locally
- Sync attempts retry every 5 seconds
- Queue persists until successful
- View queued items: `getQueuedItems()`
- Force sync: `forceSyncQueue()`

---

## API Reference

### `pushDashboardMetrics(userId, metrics)`
Push metrics from current device
- **Returns**: `{success, timestamp}`

### `listenToAggregatedMetrics(userId, callback)`
Real-time listener for all devices' metrics
- **Returns**: `listenerId`

### `syncUserSettings(userId, settings)`
Sync settings across devices
- **Returns**: `{success}`

### `listenToSettingsUpdates(userId, callback)`
Listen for settings changes
- **Returns**: `listenerId`

### `syncDatabaseRecord(userId, collectionName, recordData)`
Sync a single record
- **Returns**: `{success, recordId}`

### `listenToCollectionChanges(userId, collectionName, callback)`
Real-time listener for collection changes
- **Returns**: `listenerId`

### `updateSharedRecord(userId, collectionName, recordId, updates)`
Update a record across devices
- **Returns**: `{success}`

### `getSyncStatus()`
Get current sync status
- **Returns**: `{deviceId, platform, activeListeners, queuedItems, isSyncing}`

### `getQueuedItems()`
Get items waiting to sync
- **Returns**: `[{type, userId, data, queuedAt, attempts}]`

### `removeListener(listenerId)`
Unsubscribe from a specific listener

### `removeAllListeners()`
Clean up all listeners

---

## Android Integration

For native Android app, use Firebase Realtime Database SDK:

```java
// Android (Kotlin example)
import com.google.firebase.database.ktx.database
import com.google.firebase.ktx.Firebase

val database = Firebase.database
val metricsRef = database.getReference("metrics/$userId/android/$deviceId")

// Push metrics
metricsRef.setValue(MetricsData(
    data = metrics,
    deviceId = deviceId,
    platform = "android",
    lastUpdated = System.currentTimeMillis()
))

// Listen for updates
metricsRef.addValueEventListener(object : ValueEventListener {
    override fun onDataChange(snapshot: DataSnapshot) {
        val metrics = snapshot.getValue(MetricsData::class.java)
        updateUI(metrics)
    }
    override fun onCancelled(error: DatabaseError) {}
})
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Data not syncing | Check Firebase rules & network connection |
| Slow updates | Check listeners count, reduce frequency |
| Offline queue full | Check failed items with `getQueuedItems()` |
| Auth errors | Verify Firebase credentials in `.env` |
| Metrics not aggregating | Check data structure matches schema |

---

## Best Practices

1. **Initialize once**: Call `initializeSync()` in your main App component
2. **Cleanup listeners**: Remove listeners when components unmount
3. **Batch updates**: Group multiple updates in single sync call
4. **Monitor queue**: Check queued items in development
5. **Test offline**: Test sync behavior with network disabled
6. **Platform detection**: System auto-detects platform (android/ios/web)
7. **Error handling**: Always handle promise rejections

---

## Performance Optimization

- Listeners are efficient for small datasets
- For large collections, consider pagination
- Disable listeners not actively used
- Monitor active listeners count
- Adjust sync queue interval based on needs (default: 5s)

---

## Next Steps

1. ✅ Configure Firebase credentials
2. ✅ Set Firebase security rules
3. ✅ Initialize sync in App.jsx
4. ✅ Add SyncStatusIndicator to UI
5. ✅ Update state changes to use sync functions
6. ✅ Build Android app using same Firebase config
7. ✅ Test real-time sync between devices

