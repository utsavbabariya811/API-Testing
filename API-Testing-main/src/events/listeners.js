const taskEvents = require('./events');

/**
 * Practical 10: Background Notification Listeners
 * Registered once at server start-up via server.js:
 *   require('./src/events/listeners');
 */

// Simulated slow notification work (change with the NOTIFICATION_DELAY_MS env variable)
const NOTIFICATION_DELAY_MS = parseInt(process.env.NOTIFICATION_DELAY_MS, 10) || 2000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ── task-created ─────────────────────────────────────────────────────────────
taskEvents.on('task-created', async ({ task, user }) => {
  try {
    console.log(`[Listener] task-created handler started at ${new Date().toISOString()}`);

    // Error listener demo: uncomment the next line to simulate a failure,
    // take your screenshot, then comment it out again.
    // throw new Error('Simulated notification failure');

    await sleep(NOTIFICATION_DELAY_MS); // non-blocking: the event loop stays free

    const assignedUser = (user && (user.email || user.id)) || 'unassigned';
    console.log(
      `[Notification] Task "${task.title}" | assigned user: ${assignedUser} | timestamp: ${new Date().toISOString()}`
    );
  } catch (err) {
    taskEvents.emit('error', err);
  }
});

// ── task-deleted (Supplementary 1) ───────────────────────────────────────────
taskEvents.on('task-deleted', ({ task, user }) => {
  const by = (user && (user.email || user.id)) || 'unknown user';
  console.log(
    `[Notification] Task "${task.title}" was DELETED by ${by} at ${new Date().toISOString()}`
  );
});

// ── error (Supplementary 2) ──────────────────────────────────────────────────
// Without this listener, emit('error') would throw and crash the process.
taskEvents.on('error', (err) => {
  console.error(`[Event Error] ${err.message} at ${new Date().toISOString()}`);
});

module.exports = taskEvents;