import {notification, contact, message} from "./../services/index";
import {bufferToBase64} from "./../helpers/clientHelper"

let getHome = async (req, res) => {
    // only 10 items one time
    let notifications = await notification.getNotifications(req.user._id);
    // get amount of unread notifications
    let countNotifUnread = await notification.countNotifUnread(req.user._id);

    // get 10 contact item one time
    let contacts = await contact.getContacts(req.user._id);
    // get 10 sent contact item one time
    let contactsSent = await contact.getContactsSent(req.user._id);
    // get 10 received contact item one time
    let contactsReceived = await contact.getContactsReceived(req.user._id);

    // count contacts
    let countAllContacts = await contact.countAllContacts(req.user._id);
    let countAllContactsSent = await contact.countAllContactsSent(req.user._id);
    let countAllContactsReceived = await contact.countAllContactsReceived(req.user._id);

    let getAllConversationItems = await message.getAllConversationItems(req.user._id);
    let allConversations = getAllConversationItems.allConversations;
    let usersConversations = getAllConversationItems.usersConversations;
    let groupConversations = getAllConversationItems.groupConversations;
    // all messages with conversation, max 30 items
    let allConversationWithMessages = getAllConversationItems.allConversationWithMessages;

    return res.render("main/home/home", {
        errors: req.flash("errors"),
        success: req.flash("success"),
        user: req.user,
        notifications: notifications,
        countNotifUnread: countNotifUnread,
        contacts: contacts,
        contactsSent: contactsSent,
        contactsReceived: contactsReceived,
        countAllContacts: countAllContacts,
        countAllContactsSent: countAllContactsSent,
        countAllContactsReceived: countAllContactsReceived,
        allConversations: allConversations,
        usersConversations: usersConversations,
        groupConversations: groupConversations,
        allConversationWithMessages: allConversationWithMessages,
        bufferToBase64: bufferToBase64
    });
};

module.exports = {
    getHome: getHome
};