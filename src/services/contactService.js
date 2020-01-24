import contactModel from "./../models/contactModel"
import userModel from "./../models/userModel"
import notificationModel from "./../models/notificationModel"
import _ from 'lodash';

const LIMIT_NUMBER_TAKEN = 10;

let findUsersContact = (currentUserId, keyword) => {
    return new Promise(async (resolve, reject) => {
        let deprecatedUserIds = [currentUserId];
        let contactsByUser = await contactModel.findAllByUser(currentUserId);
        contactsByUser.forEach(contact => {
            deprecatedUserIds.push(contact.userId);
            deprecatedUserIds.push(contact.contactId);
        });

        deprecatedUserIds = _.uniqBy(deprecatedUserIds);
        let users = await userModel.findAllForAddContact(deprecatedUserIds, keyword);

        resolve(users);
    });
};

let addNew = (currentUserId, contactId) => {
    return new Promise(async (resolve, reject) => {
        let contactExists = await contactModel.checkExists(currentUserId, contactId);
        if(contactExists) {
            return reject(false);
        }
        // create contact
        let newContactItem = {
            userId: currentUserId,
            contactId: contactId
        };
        let newContact = await contactModel.createNew(newContactItem);

        // create notification
        let notificationItem = {
            senderId: currentUserId,
            receiverId: contactId,
            type: notificationModel.types.ADD_CONTACT
        };
        await notificationModel.model.createNew(notificationItem);

        resolve(newContact);
    });
};

let removeContact = (currentUserId, contactId) => {
    return new Promise(async (resolve, reject) => {
        let removeContact = await contactModel.removeContact(currentUserId, contactId);
        if (removeContact.n === 0) {
            return reject(false);
        }
        resolve(true);
    });
};

let removeRequestContactSent = (currentUserId, contactId) => {
    return new Promise(async (resolve, reject) => {
        let removeReq = await contactModel.removeRequestContactSent(currentUserId, contactId);
        if (removeReq.n === 0) {
            return reject(false);
        }
        // remove notification
        let notifTypeAddContact = notificationModel.types.ADD_CONTACT
        await notificationModel.model.removeRequestContactSentNotification(currentUserId, contactId, notifTypeAddContact);
        resolve(true);
    });
};

let removeRequestContactReceived = (currentUserId, contactId) => {
    return new Promise(async (resolve, reject) => {
        let removeReq = await contactModel.removeRequestContactReceived(currentUserId, contactId);
        if (removeReq.n === 0) {
            return reject(false);
        }
        // remove notification
        // let notifTypeAddContact = notificationModel.types.ADD_CONTACT
        // await notificationModel.model.removeRequestContactReceivedNotification(currentUserId, contactId, notifTypeAddContact);
        resolve(true);
    });
};

let approveRequestContactReceived = (currentUserId, contactId) => {
    return new Promise(async (resolve, reject) => {
        let approveReq = await contactModel.approveRequestContactReceived(currentUserId, contactId);
        if (approveReq.nModified === 0) {
            return reject(false);
        }
        // create notification
        let notificationItem = {
            senderId: currentUserId,
            receiverId: contactId,
            type: notificationModel.types.APPROVE_CONTACT
        };
        await notificationModel.model.createNew(notificationItem);

        resolve(true);
    });
};

let getContacts = (currentUserId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let contacts = await contactModel.getContacts(currentUserId, LIMIT_NUMBER_TAKEN);

            let users = contacts.map(async (contact) => {
                if (contact.contactId == currentUserId) {
                    return await userModel.getNormalUserDataById(contact.userId);
                } else {
                    return await userModel.getNormalUserDataById(contact.contactId);
                }
            });

            resolve(await Promise.all(users));
        } catch (error) {
            reject(error);
        }
    });
};

let getContactsSent = (currentUserId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let contacts = await contactModel.getContactsSent(currentUserId, LIMIT_NUMBER_TAKEN);
            let users = contacts.map(async (contact) => {
                return await userModel.getNormalUserDataById(contact.contactId);
            });

            resolve(await Promise.all(users));
        } catch (error) {
            reject(error);
        }
    });
};

let getContactsReceived = (currentUserId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let contacts = await contactModel.getContactsReceived(currentUserId, LIMIT_NUMBER_TAKEN);
            let users = contacts.map(async (contact) => {
                return await userModel.getNormalUserDataById(contact.userId);
            });

            resolve(await Promise.all(users));
        } catch (error) {
            reject(error);
        }
    });
};

let countAllContacts = (currentUserId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await contactModel.countAllContacts(currentUserId);
            resolve(count);
        } catch (error) {
            reject(error);
        }
    });
};

let countAllContactsSent = (currentUserId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await contactModel.countAllContactsSent(currentUserId);
            resolve(count);
        } catch (error) {
            reject(error);
        }
    });
};

let countAllContactsReceived = (currentUserId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await contactModel.countAllContactsReceived(currentUserId);
            resolve(count);
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Read more contacts, 10 items one time
 * @param {string} currentUserId 
 * @param {number} skipNumberContacts 
 */
let readMoreContacts = (currentUserId, skipNumberContacts) => {
    return new Promise(async (resolve, reject) => {
        try {
            let newContacts = await contactModel.readMoreContacts(currentUserId, skipNumberContacts, LIMIT_NUMBER_TAKEN);

            let users = newContacts.map(async (contact) => {
                if (contact.contactId == currentUserId) {
                return await userModel.getNormalUserDataById(contact.userId);
                } else {
                    return await userModel.getNormalUserDataById(contact.contactId);
                }
            });

            resolve(await Promise.all(users));
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Read more sent contacts, 10 items one time
 * @param {string} currentUserId 
 * @param {number} skipNumberContacts 
 */
let readMoreContactsSent = (currentUserId, skipNumberContacts) => {
    return new Promise(async (resolve, reject) => {
        try {
            let newContacts = await contactModel.readMoreContactsSent(currentUserId, skipNumberContacts, LIMIT_NUMBER_TAKEN);

            let users = newContacts.map(async (contact) => {
                return await userModel.getNormalUserDataById(contact.contactId);
            });

            resolve(await Promise.all(users));
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Read more received contacts, 10 items one time
 * @param {string} currentUserId 
 * @param {number} skipNumberContacts 
 */
let readMoreContactsReceived = (currentUserId, skipNumberContacts) => {
    return new Promise(async (resolve, reject) => {
        try {
            let newContacts = await contactModel.readMoreContactsReceived(currentUserId, skipNumberContacts, LIMIT_NUMBER_TAKEN);

            let users = newContacts.map(async (contact) => {
                return await userModel.getNormalUserDataById(contact.userId);
            });

            resolve(await Promise.all(users));
        } catch (error) {
            reject(error);
        }
    });
};

let searchFriends = (currentUserId, keyword) => {
    return new Promise(async (resolve, reject) => {
        let friendIds = [];
        let friends = await contactModel.getFriends(currentUserId);

        friends.forEach(item => {
            friendIds.push(item.userId);
            friendIds.push(item.contactId);
        });

        friendIds = _.uniqBy(friendIds);
        friendIds = friendIds.filter(userId => userId != currentUserId);

        let users = await userModel.findAllToAddGroupChat(friendIds, keyword);

        resolve(users);
    });
};

module.exports = {
    findUsersContact: findUsersContact,
    addNew: addNew,
    removeContact: removeContact,
    removeRequestContactSent: removeRequestContactSent,
    removeRequestContactReceived: removeRequestContactReceived,
    approveRequestContactReceived: approveRequestContactReceived,
    getContacts: getContacts,
    getContactsSent: getContactsSent,
    getContactsReceived: getContactsReceived,
    countAllContacts: countAllContacts,
    countAllContactsSent: countAllContactsSent,
    countAllContactsReceived: countAllContactsReceived,
    readMoreContacts: readMoreContacts,
    readMoreContactsSent: readMoreContactsSent,
    readMoreContactsReceived: readMoreContactsReceived,
    searchFriends: searchFriends
};