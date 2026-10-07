# Practical 8: Performance Optimization and Lazy Loading in React

**Course**: Advanced Web Development Frameworks (ITUE301)  
**CO/PO Mapping**: CO1, CO2 / PO3, PO5  
**Pass Threshold**: 5 / 10 Marks (Rubric: Concepts 2M, Implementation 4M, Correctness 2M, Reflection 1M, Evidence 1M)

---

## 🎯 Objective

To improve frontend application performance using **route-based code splitting**, dynamic imports with `React.lazy()` and `<Suspense>`, **structural skeleton fallbacks**, and isolated third-party library chunking (**Chart.js**), measuring before/after bundle sizes and load times with browser developer tools.

---

## 🏗️ Architecture & Code-Splitting Data Flow

```text
BEFORE (Monolithic single bundle loaded upfront):
main.bundle.js ──────────────► [Home / Tasks][Projects][Contact][Chart.js (~180 KB)] all loaded upfront

AFTER (Route-Based Code Splitting with Suspense):
main.bundle.js ────────► Loaded on initial visit (/)
Projects.chunk.js ─────► Loaded ONLY when /projects is visited
Contact.chunk.js ──────► Loaded ONLY when /contact is visited
vendor-charts.chunk.js ─► Loaded ONLY when /analytics is visited
```

---

## 🚀 Key Features Implemented (Practical 8)

1. **Route-Based Code Splitting (`react-router-dom` + `React.lazy`)**:
   - `/`: Core Kanban Board and Task Stream
   - `/projects`: Sprints, milestones, and project workload tracking (Lazy Loaded)
   - `/analytics`: Task metrics and productivity analytics (Lazy Loaded)
   - `/contact`: Technical feedback and engineering support form (Lazy Loaded)
2. **Structural Skeleton Fallback UI (`PageSkeletonFallback.jsx`)**:
   - Shimmer glassmorphic placeholder preventing layout shifts (Cumulative Layout Shift = 0) while chunks download.
3. **Anti-Flicker Minimum Delay (`lazyWithDelay.js`)**:
   - Guaranteed minimum 300 ms duration for loading transitions on fast networks to prevent distracting spinner flashes.
4. **Heavy Third-Party Component Splitting (Chart.js & `react-chartjs-2`)**:
   - The ~180 KB canvas charting engine is completely isolated into `vendor-charts-*.js` and never downloaded by users who stay on the main task board.
5. **React DevTools Profiler Optimization (`React.memo`)**:
   - Custom shallow equality comparator in `TaskCard.jsx` eliminates unnecessary re-renders when parent states change.
6. **Smart Hover & Idle Preloading**:
   - Route chunks prefetch on navigation tab hover (`onMouseEnter`) and during browser idle periods (`requestIdleCallback`).

---

## 📊 Bundle Size Metrics (Vite Build)

Run the production build:
```bash
npm run build --prefix client
```

### Build Chunk Breakdown:
| Chunk | Size | Gzip Size | Trigger / Load Condition |
| :--- | :--- | :--- | :--- |
| `vendor-charts-*.js` | **179.33 kB** | 61.92 kB | **On-demand**: only when `/analytics` is opened |
| `vendor-react-*.js` | **181.75 kB** | 57.16 kB | Critical runtime on first visit |
| `vendor-router-*.js` | **39.16 kB** | 14.09 kB | Critical routing runtime |
| `index-*.js` (App Shell) | **36.62 kB** | 9.74 kB | Main application shell |
| `vendor-icons-*.js` | **13.13 kB** | 4.79 kB | Lucide icon glyphs |
| `Projects-*.js` | **8.36 kB** | 2.19 kB | **On-demand**: only when `/projects` is visited |
| `Contact-*.js` | **8.31 kB** | 2.47 kB | **On-demand**: only when `/contact` is visited |
| `Analytics-*.js` | **4.84 kB** | 1.76 kB | **On-demand**: only when `/analytics` is visited |

---

## 🛠️ How to Run Locally

### 1. Install Dependencies
```bash
# Root dependencies
npm install

# Frontend client dependencies
cd client
npm install
cd ..
```

### 2. Start Application
```bash
npm run dev
```
- **React Frontend**: `http://localhost:5173` (or `5174`)
- **Express Backend**: `http://localhost:5000`

### 3. Run Automated Tests
```bash
npm test
```

---

## 🧪 Browser DevTools Verification Guide

1. Open DevTools (**F12**) and navigate to the **Network** tab.
2. Set filter to **JS**.
3. Reload `http://localhost:5173/`: Note that `Projects`, `Contact`, and `vendor-charts` are **not** present in the network waterfall.
4. Click **Projects**: Observe `Projects-*.js` load in the network waterfall.
5. Click **Analytics**: Observe `vendor-charts-*.js` (179 kB) load on demand.
6. Set Network Throttling to **Slow 3G**: Navigate between tabs to view the shimmer skeleton fallback UI in action.

---

## 📄 Lab Report
For the complete report, theoretical analysis, and viva responses, refer to:
- [LAB_REPORT.md](file:///d:/5TH%20SEM/ADWF/PRACTICAL/PR8/API-Testing/LAB_REPORT.md)

---

# Practical 9 — In-Memory Caching and Query Optimization

## 1. Objective
To implement server-side in-memory caching using `node-cache` in the Task Management Express + MongoDB REST API, optimize read latency for frequent database queries, enforce automatic cache invalidation on write mutations, and measure API response times before and after caching.

## 2. Technology Used
- **Runtime & Framework**: Node.js & Express.js (CommonJS)
- **Database**: MongoDB with Mongoose ODM
- **Caching Engine**: `node-cache` (Process-local in-memory key-value store)
- **Authentication**: JSON Web Token (JWT) Bearer Authentication via `authMiddleware`

## 3. Cache Implementation
A shared singleton cache instance is configured in `src/utils/cache.js`:
```javascript
const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: 60,       // Default TTL: 60 seconds
  checkperiod: 120  // Automatic sweep period: 120 seconds
});

module.exports = cache;
```

## 4. Cache TTL
- **Default TTL (`stdTTL`)**: `60` seconds. Cached records automatically expire after 60 seconds unless renewed or invalidated.
- **Check Period (`checkperiod`)**: `120` seconds. Background timer automatically cleans up expired keys from process memory.

## 5. Cache Key for All Tasks
- **Key**: `"all_tasks"`
- **Endpoint**: `GET /tasks` (when called without query filters)
- **Behavior**: On first request (MISS), queries MongoDB, stores formatted response payload with HATEOAS links in `"all_tasks"`. Subsequent requests (HIT) serve directly from memory without executing `Task.find()`.

## 6. Cache Key for Individual Task
- **Prefix**: `"task_"`
- **Pattern**: `task_<TASK_ID>` (e.g., `task_670a12b3c4d5e6f789012345`)
- **Endpoint**: `GET /tasks/:id`
- **Behavior**: On first request (MISS), queries `Task.findById(id)`. If found, stores payload in cache. If not found, returns `404 Not Found` without polluting the cache.

## 7. Cache Invalidation Strategy
To guarantee data consistency between RAM and MongoDB:
- **POST `/tasks`**: After `newTask.save()` completes successfully, invalidates:
  - `cache.del("all_tasks")`
- **PUT `/tasks/:id` & PATCH `/tasks/:id`**: After `findByIdAndUpdate()` succeeds, invalidates:
  - `cache.del("all_tasks")`
  - `cache.del("task_" + req.params.id)`
- **DELETE `/tasks/:id`**: After `findByIdAndDelete()` succeeds, invalidates:
  - `cache.del("all_tasks")`
  - `cache.del("task_" + req.params.id)`
- **Failure Safety**: If a database write operation fails or validation rejects the payload, invalidation is bypassed, preserving existing valid cache.

## 8. HIT/MISS Behavior & Console Logging
Every cacheable request logs its outcome and increments internal metric counters:
- `CACHE HIT: all_tasks`
- `CACHE MISS: all_tasks`
- `CACHE HIT: task_<id>`
- `CACHE MISS: task_<id>`
- `CACHE INVALIDATED: all_tasks`
- `CACHE INVALIDATED: task_<id>`

## 9. Debug Endpoint
- **Endpoint**: `GET /tasks/debug/cache`
- **Authentication**: Protected via Bearer JWT (`authMiddleware`)
- **Route Placement**: Placed **before** `GET /tasks/:id` in `taskRoutes.js` to prevent Express route matching from treating `"debug"` as a MongoDB ObjectId.
- **Response Format**:
```json
{
  "success": true,
  "cacheHits": 12,
  "cacheMisses": 4,
  "keys": ["all_tasks", "task_65f000000000000000000001"],
  "stats": {
    "hits": 12,
    "misses": 4,
    "keys": 2,
    "ksize": 34,
    "vsize": 1820
  }
}
```

## 10. How to Test Using Postman
1. **Set Bearer Token**: Obtain JWT via `POST /auth/login` and set `Authorization: Bearer <token>`.
2. **First Request**: Send `GET http://localhost:5000/tasks`.
   - Server logs: `CACHE MISS: all_tasks`
   - Response time represents a cold fetch querying MongoDB.
3. **Second Request**: Send `GET http://localhost:5000/tasks` again immediately.
   - Server logs: `CACHE HIT: all_tasks`
   - Response time drops significantly as data is served from RAM.
4. **Create Task**: Send `POST http://localhost:5000/tasks` with task JSON body.
   - Server logs: `CACHE INVALIDATED: all_tasks`
5. **Third Request**: Send `GET http://localhost:5000/tasks`.
   - Server logs: `CACHE MISS: all_tasks`
   - Shows newly created task immediately.
6. **Check Metrics**: Send `GET http://localhost:5000/tasks/debug/cache` to view total hits, misses, and active keys.

## 11. Response-Time Comparison Table

| Condition | Request 1 | Request 2 | Request 3 | Average |
| :--- | :---:| :---:| :---:| :---:|
| **Without Cache (Cold / MISS)** | *To be measured* | *To be measured* | *To be measured* | *To be measured* |
| **With Cache (RAM / HIT)** | *To be measured* | *To be measured* | *To be measured* | *To be measured* |

*(Note: Response times are to be measured directly in Postman by observing the time metric on the response panel).*

## 12. Architectural Discussion & Limitations

### Why Cache Invalidation is Required
Without proactive cache invalidation, write operations (`POST`, `PUT`, `PATCH`, `DELETE`) would update MongoDB while subsequent client read queries would continue receiving stale, outdated responses from RAM until the 60-second TTL expires. Invalidating the cache immediately upon successful database mutations ensures **read-after-write consistency** across the system.

### Why node-cache is Process-Local
`node-cache` stores key-value pairs directly in the Node.js V8 heap memory of the specific process running the server. 
- In a production environment with **horizontal scaling** (e.g., multiple instances behind an NGINX load balancer, Kubernetes pods, or PM2 cluster mode), each process maintains its own isolated memory space.
- A write mutation hitting Instance A would only invalidate Instance A's local cache, leaving Instance B and Instance C serving stale data to other users.
- For distributed multi-server deployments, a centralized distributed in-memory cache such as **Redis** or **Memcached** is required so all server instances share a single source of cached truth.


# Practical 10 — Asynchronous Processing with Event-Driven Architecture

**CO/PO Mapping**: CO4 / PO3, PO5

## 1. Objective

To implement asynchronous background processing in the Task Management API using Node.js's built-in `EventEmitter` (no external dependencies), so that side effects such as notifications run **after** the HTTP response has been sent and never slow down the request-response cycle.

## 2. Technology Used

| Component | Purpose |
| :--- | :--- |
| Node.js `events` module | Built-in `EventEmitter` for event-driven decoupling |
| Express.js + Mongoose | Existing REST API and MongoDB persistence |
| MongoDB Atlas | Cloud database used for testing |
| Postman / Thunder Client | API testing and response-time measurement |

## 3. Architecture / Flow

```text
POST /tasks
   |
   v
Save task to MongoDB
   |
   v
Respond immediately ──► 201 Created  (log: [API] Response sent at <time>)
   |
   v
emit('task-created', { task, user })
   |
   v  (handled asynchronously, after the response)
Notification Listener
   └── logs: task title, assigned user, timestamp (after simulated 2s delay)
```

## 4. Files Added / Modified

| File | Purpose |
| :--- | :--- |
| `src/events/events.js` | Exports a single shared `TaskEvents` emitter instance |
| `src/events/listeners.js` | Registers `task-created`, `task-deleted` and `error` listeners |
| `src/routes/taskRoutes.js` | `POST /tasks` responds first, then emits `task-created`; `DELETE /tasks/:id` emits `task-deleted` |
| `server.js` | Loads the listeners at start-up with `require('./src/events/listeners')` |
| `.env.example` | Adds the optional `NOTIFICATION_DELAY_MS` variable |

## 5. Events Implemented

| Event | Emitted By | Listener Behaviour |
| :--- | :--- | :--- |
| `task-created` | `POST /tasks` (after the response is sent) | Waits 2 seconds (simulated slow work), then logs task title, assigned user and timestamp |
| `task-deleted` | `DELETE /tasks/:id` (after the response is sent) | Logs the deleted task's title, the user and a timestamp |
| `error` | Any failure inside a listener | Catches and logs the error so the process never crashes |

The "assigned user" is the authenticated user taken from the JWT payload (`req.user.email`).

## 6. Core Code

**`src/events/events.js`**
```js
const EventEmitter = require('events');

class TaskEvents extends EventEmitter {}

module.exports = new TaskEvents();
```

**`POST /tasks` (response first, event second)**
```js
console.log(`[API] Response sent at ${new Date().toISOString()}`);
res.status(201).json({ success: true, message: 'Task created successfully', data: taskObj, _links: links });

taskEvents.emit('task-created', { task: taskObj, user: req.user });
```

**`task-created` listener (non-blocking delay)**
```js
taskEvents.on('task-created', async ({ task, user }) => {
  try {
    console.log(`[Listener] task-created handler started at ${new Date().toISOString()}`);
    await sleep(NOTIFICATION_DELAY_MS);   // default 2000 ms
    console.log(`[Notification] Task "${task.title}" | assigned user: ${user.email} | timestamp: ${new Date().toISOString()}`);
  } catch (err) {
    taskEvents.emit('error', err);
  }
});
```

## 7. Configuration

Add these to your `.env` file (see `.env.example`):

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-address>/taskdb?appName=Cluster0
JWT_SECRET=your_jwt_secret_here
PORT=5000
NOTIFICATION_DELAY_MS=2000
```

## 8. How to Test Using Postman

1. Start the server: `npm start` (expect `MongoDB connected successfully`).
2. **Register**: `POST http://localhost:5000/register`
   ```json
   { "name": "Utsav", "email": "utsav@example.com", "password": "password123" }
   ```
3. **Login**: `POST http://localhost:5000/login` and copy the `token`.
   ```json
   { "email": "utsav@example.com", "password": "password123" }
   ```
4. **Create task**: `POST http://localhost:5000/tasks` with `Authorization: Bearer <token>`:
   ```json
   { "title": "Demo task for Practical 10", "description": "Testing EventEmitter", "priority": "high" }
   ```
5. Observe the console log order (see Section 9).
6. **Delete task**: `DELETE http://localhost:5000/tasks/<_id>` with the same token and observe the `task-deleted` notification.

## 9. Expected Console Output

```text
[API] Response sent at 2026-10-07T08:10:00.045Z
[Listener] task-created handler started at 2026-10-07T08:10:00.048Z
[Notification] Task "Demo task for Practical 10" | assigned user: utsav@example.com | timestamp: 2026-10-07T08:10:02.051Z
```

On delete:
```text
[Notification] Task "Demo task for Practical 10" was DELETED by utsav@example.com at 2026-10-07T08:15:00.123Z
```

The `[API]` timestamp appears **before** the `[Notification]` timestamp, proving the handler does not block the response.

## 10. Timestamp Evidence Table

*(Example values shown; replace with the values from your own run.)*

| Event | Timestamp | Time After Request |
| :--- | :--- | :---: |
| Request received | 08:10:00.000 | 0 ms |
| `[API] Response sent` | 08:10:00.045 | 45 ms |
| `[Listener]` handler started | 08:10:00.048 | 48 ms |
| `[Notification]` handler finished | 08:10:02.051 | 2051 ms |

## 11. Synchronous vs Asynchronous Comparison

| Approach | Where Notification Logic Runs | Postman Response Time |
| :--- | :--- | :---: |
| **Asynchronous (EventEmitter)** | After the response, inside the listener | ≈ 20 ms *(to be measured)* |
| **Synchronous (inside the route)** | Before the response, awaited in the route | ≈ 2000 ms *(to be measured)* |

To reproduce the synchronous case, uncomment the `await new Promise((r) => setTimeout(r, 2000));` line in the `POST /tasks` route, restart the server and observe the response time in Postman. Comment it out again afterwards.

## 12. Supplementary Problems

1. **`task-deleted` event**: a second event with its own listener that logs a different message (Section 5).
2. **`error` listener**: uncomment `throw new Error('Simulated notification failure')` in `listeners.js` and create a task. The API still returns `201` and the console shows `[Event Error] Simulated notification failure ...`.
3. **Slow handler**: the 2-second `setTimeout`-based delay in the `task-created` listener confirms the API still responds instantly.

## 13. Key Questions & Analysis

### Why does emitting an event not block the API response?
In the route, the response is sent with `res.status(201).json(...)` **before** `emit()` is called, so the client already has its answer. The listener then runs `await sleep(...)`, which hands control back to the Node.js event loop, so the single thread is free to serve other requests while the timer waits. Strictly speaking, `emit()` itself calls listeners synchronously; the non-blocking behaviour comes from the asynchronous work (`await` / timers) inside the listener.

### What would happen if the notification logic were inside the POST route?
The route would have to `await` the notification before responding, so every `POST /tasks` request would take the notification's duration on top of its normal time (about 2 seconds with the simulated delay). Section 11 shows this difference as roughly 20 ms versus 2000 ms.

### Why is EventEmitter reasonable at this scale but not for millions of events per day?
`EventEmitter` is simple, dependency-free and ideal for small applications. However, events live only in the memory of one Node.js process, so:
- If the server crashes or restarts, pending events are **lost** (no persistence).
- There are **no retries**, acknowledgements or dead-letter handling for failed events.
- It cannot **scale horizontally**: an event emitted on instance A is invisible to instance B.
- A heavy synchronous listener can block the single-threaded event loop for all users.

High-volume production systems use a durable message broker such as **RabbitMQ**, **Apache Kafka** or **Redis-based queues (BullMQ)** with persistent storage, retries and independent worker processes.

## 14. Learning Outcome

Implemented non-blocking, event-driven background processing using Node's built-in `EventEmitter` and demonstrated, with timestamp evidence, how it keeps the main request-response cycle fast.