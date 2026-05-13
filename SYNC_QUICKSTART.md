# Mobile ↔ PC Data Sync - Quick Start

## 🚀 30-Second Setup

### Step 1: Firebase Credentials (2 min)
```bash
# Get from Firebase Console: https://console.firebase.google.com
# Go to Project Settings → Service Accounts → Copy credentials
```

### Step 2: Create `.env`
```bash
cp .env.example .env
# Edit .env with your Firebase credentials
```

### Step 3: Initialize Sync in App.jsx
Add this to the top of your `App` function:
```javascript
import { initializeSync } from './services/dataSync';

useEffect(() => {
  const cleanup = initializeSync();
  return cleanup;
}, []);
```

### Step 4: Add Sync Indicator to TopBar
```javascript
import SyncStatusIndicator from './components/SyncStatusIndicator';

// In your topbar JSX:
<SyncStatusIndicator />
```

### Step 5: Sync Your First Update
```javascript
import { pushDashboardMetrics } from './services/dataSync';

const metrics = {
  salahDone: 3,
  tasksDone: 5
};

await pushDashboardMetrics('user_123', metrics);
```

✅ **You're done!** Data syncs across all devices in real-time.

---

## 📱 For Android App Integration

Use Firebase SDK for Android:
```java
import com.google.firebase.database.ktx.database
import com.google.firebase.ktx.Firebase

val db = Firebase.database
val ref = db.getReference("metrics/user_123/android/device_id")

ref.setValue(metrics)
ref.addValueEventListener(listener)
```

---

## 🔧 What Syncs

| Data Type | Path | Sync Behavior |
|-----------|------|---------------|
| **Metrics** | `metrics/{userId}/{platform}/{deviceId}` | Real-time aggregation from all devices |
| **Settings** | `settings/{userId}` | Overwrites with latest |
| **Records** | `data/{userId}/{collection}/{recordId}` | Individual CRUD operations |

---

## 🎯 Common Tasks

### Push a metric update
```javascript
await pushDashboardMetrics(userId, { prayers: 5, tasks: 10 });
```

### Listen for changes
```javascript
const { metrics } = useMetricsSync(userId);
```

### Sync todos
```javascript
const { records, addRecord, updateRecord } = useCollectionSync(userId, 'todos');
```

### Check sync status
```javascript
import { getSyncStatus, getQueuedItems } from './services/dataSync';

console.log(getSyncStatus());
console.log(getQueuedItems());
```

---

## ⚙️ Firebase Rules

Paste in Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "metrics": { "$uid": { ".read": "auth.uid === $uid", ".write": "auth.uid === $uid", "$platform": { "$deviceId": { ".validate": "newData.hasChildren(['data', 'lastUpdated'])" } } } },
    "settings": { "$uid": { ".read": "auth.uid === $uid", ".write": "auth.uid === $uid" } },
    "data": { "$uid": { ".read": "auth.uid === $uid", ".write": "auth.uid === $uid", "$collection": { "$recordId": { ".validate": "newData.hasChildren(['id'])" } } } }
  }
}
```

---

## 📊 Debugging

### View sync status
Click the sync indicator in top-right corner

### Check queued items
```javascript
import { getQueuedItems } from './services/dataSync';
console.log(getQueuedItems());
```

### Force sync queue
```javascript
import { forceSyncQueue } from './services/dataSync';
await forceSyncQueue();
```

### View listeners
```javascript
import { getSyncStatus } from './services/dataSync';
const { activeListeners } = getSyncStatus();
console.log(`Active listeners: ${activeListeners}`);
```

---

## 🔄 How It Works

```
┌─────────────────────────────────────────┐
│  PC Updates Dashboard (e.g., mark prayer) │
└──────────────┬──────────────────────────┘
               │
               ↓
        ┌─────────────────┐
        │  Local Update   │
        │  State Change   │
        └────────┬────────┘
                 │
                 ↓
        ┌─────────────────┐
        │ pushDashboardMetrics()
        │ Send to Firebase │
        └────────┬────────┘
                 │
                 ↓
        ┌─────────────────────────────────┐
        │  Firebase Realtime Database     │
        │  metrics/user_123/web/device_a  │
        └──────────┬──────────────────────┘
                   │
     ┌─────────────┼─────────────┐
     │             │             │
     ↓             ↓             ↓
┌─────────┐ ┌─────────┐ ┌──────────┐
│ PC Tab2 │ │ Android │ │ Tablet   │
│ Updates │ │ Updates │ │ Updates  │
│ in Real-│ │ in Real-│ │ in Real- │
│  time!  │ │ time!   │ │ time!    │
└─────────┘ └─────────┘ └──────────┘
```

---

## ❌ Troubleshooting

| Problem | Solution |
|---------|----------|
| Data not syncing | Check `.env` firebase credentials |
| Auth errors | Ensure `auth.uid === $uid` rule is set |
| Slow updates | Reduce listener count, check internet |
| Offline not working | Check sync queue with `getQueuedItems()` |
| Platform not detected | Check `navigator.userAgent` in console |

---

## 📚 Full Documentation

See `SYNC_DOCUMENTATION.md` for:
- Complete API reference
- Advanced usage patterns
- Performance optimization
- Android integration guide
- Conflict resolution strategy

---

## 🎓 Learn More

- [Firebase Docs](https://firebase.google.com/docs/database)
- [React Hooks](https://react.dev/reference/react/hooks)
- [Firebase Android SDK](https://firebase.google.com/docs/database/android/start)

---

**Ready to sync?** 🚀 Follow the 5 steps above and you're good to go!
