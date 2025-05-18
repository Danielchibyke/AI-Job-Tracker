import { Notification } from '../models/notification.model.js';

class NotificationService {
    constructor(notificationId, userId, message, date, isRead){
        this.notificationId = notificationId;
        this.userId = userId;
        this.message = message;
        this.date = date;
        this.isRead = isRead;
    }

    // Create a new notification
    static async sendNotification(userId, message) {
        const notification = new Notification({ userId, message });
        await notification.save();
        return notification;
    }

    // Fetch all notifications for a user
    static async getUserNotifications(userId) {
        return Notification.find({ userId }).sort({ date: -1 });
    }

    // Mark a notification as read
    static async markAsRead(notificationId) {
        return Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    }

    // Get unread notification count for a user
    static async getUnreadCount(userId) {
        return Notification.countDocuments({ userId, isRead: false });
    }
}

export default NotificationService;