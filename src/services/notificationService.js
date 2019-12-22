import notificationModel from "./../models/notificationModel"
import userModel from "./../models/userModel"

const LIMIT_NUMBER_TAKEN = 10;

/**
 * Get notification when refresh browser
 * Just 10 notification on time
 * @param {string} currentUserId
 */
let getNotifications = (currentUserId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let notifications = await notificationModel.model.getByUserIdAndLimit(currentUserId, LIMIT_NUMBER_TAKEN);
            
            let getNotifContents = notifications.map(async (notification) => {
                let sender = await userModel.getNormalUserDataById(notification.senderId);
                return notificationModel.contents.getContent(notification.type, notification.isRead, sender._id, sender.username, sender.avatar);
            });

            resolve(await Promise.all(getNotifContents));
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Count all unread notifications
 * @param {string} currentUserId 
 */
let countNotifUnread = (currentUserId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let notificationsUnread = await notificationModel.model.countNotifUnread(currentUserId);
            resolve(notificationsUnread);
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Read more notification, max 10 items one time
 * @param {string} currentUserId 
 * @param {number} skipNumberNotifcation 
 */
let readMore = (currentUserId, skipNumberNotifcation) => {
    return new Promise(async (resolve, reject) => {
        try {
            let newNotifications = await notificationModel.model.readMore(currentUserId, skipNumberNotifcation, LIMIT_NUMBER_TAKEN);

            let getNotifContents = newNotifications.map(async (notification) => {
                let sender = await userModel.getNormalUserDataById(notification.senderId);
                return notificationModel.contents.getContent(notification.type, notification.isRead, sender._id, sender.username, sender.avatar);
            });

            resolve(await Promise.all(getNotifContents));
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Mark notifications as read
 * @param {string} currentUserId 
 * @param {array} targetUsers 
 */
let markAllAsRead = (currentUserId, targetUsers) => {
    return new Promise(async (resolve, reject) => {
        try {
            await notificationModel.model.markAllAsRead(currentUserId, targetUsers);
            resolve(true);
        } catch (error) {
            console.log(`Error when mark notifications as read: ${error}`);
            reject(false);
        }
    });
};

module.exports = {
    getNotifications: getNotifications,
    countNotifUnread: countNotifUnread,
    readMore: readMore,
    markAllAsRead: markAllAsRead
};