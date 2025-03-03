
class NotificationService{
    constructor(notificationId, userId, message, date, isRead){
        this.notificationId = notificationId;
        this.userId = userId;
        this.message = message;
        this.date = date;
        this.isRead = isRead;
    }

    sendNotification(){}
    markAsRead(){}
}