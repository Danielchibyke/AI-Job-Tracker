import mongoose from 'mongoose';
import cron from 'node-cron';
import User from '../models/user.model.js';
// import NotificationService from '../services/notification.service.js';
import aiService from '../services/ai.service.js';
import AutomationLog from '../models/automationLog.model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-job-tracker';

async function runAutomation() {
  let db;
  try {
    db = await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('[Automation] Connected to DB');

    const users = await User.find({ smartAutomationEnabled: true });
    console.log(`[Automation] Found ${users.length} users with automation enabled.`);

    for (const user of users) {
      try {
        console.log(`[Automation] Running automation for user: ${user.email}`);
        const recommendations = await aiService.recommendJobs(user._id);
        await AutomationLog.create({
          userId: user._id,
          action: 'recommend',
          details: { recommendations },
          status: 'success'
        });
        console.log(`[Automation] Recommendations for ${user.email}:`, recommendations);
        const autoApplyResult = await aiService.autoApply(user._id);
        await AutomationLog.create({
          userId: user._id,
          action: 'auto-apply',
          details: { autoApplyResult },
          status: 'success'
        });
        console.log(`[Automation] Auto-apply result for ${user.email}:`, autoApplyResult);
        // Example: await aiService.optimizeCV(user._id, someJobId);
        // Example: await NotificationService.sendNotification(...);
      } catch (err) {
        await AutomationLog.create({
          userId: user._id,
          action: 'automation-error',
          details: { error: err.message },
          status: 'error'
        });
        console.error(`[Automation] Error processing user ${user.email}:`, err);
      }
    }
  } catch (err) {
    console.error('[Automation] Error:', err);
  } finally {
    // Only disconnect if not in a long-running cron job
    if (db) {
      try {
        await mongoose.disconnect();
        console.log('[Automation] Disconnected from DB');
      } catch (e) {
        console.error('[Automation] Error disconnecting:', e);
      }
    }
  }
}

// Schedule to run every minute
cron.schedule('* * * * *', () => {
  console.log('[Automation] Scheduled run at', new Date().toISOString());
  runAutomation();
});

// For manual run (node automation.worker.js)
if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  runAutomation().then(() => {
    // Only exit if not running as a cron job
    if (!process.send) process.exit(0);
  });
} 