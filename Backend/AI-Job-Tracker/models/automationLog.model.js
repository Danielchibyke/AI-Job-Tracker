import mongoose from "mongoose";

const automationLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'recommend', 'auto-apply', 'optimize-cv'
  details: { type: Object }, // e.g., jobs recommended/applied, errors, etc.
  status: { type: String, default: 'success' }, // 'success' | 'error'
  createdAt: { type: Date, default: Date.now }
});
const AutomationLog = mongoose.model('AutomationLog', automationLogSchema); 

export default AutomationLog;