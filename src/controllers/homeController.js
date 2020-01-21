import {notification, contact, message} from "./../services/index";
import {bufferToBase64, lastItemOfArray, convertTimeStampToHumanTime} from "./../helpers/clientHelper"
import request from "request";

let getICETurnServer = () => {
    return new Promise(async (resolve, reject) => {
        // Node Get ICE STUN and TURN list
    let o = {
        format: "urls"
    };

    let bodyString = JSON.stringify(o);

    let options = {
        url: "https://global.xirsys.net/_turn/real-talk",
        // host: "global.xirsys.net",
        // path: "/_turn/real-talk",
        method: "PUT",
        headers: {
            "Authorization": "Basic " + Buffer.from(`vnw1:${process.env.TURN_SERVER_KEY}`).toString("base64"),
            "Content-Type": "application/json",
            "Content-Length": bodyString.length
        }
    };

    // Request ICE turn server
    request(options, (error, response, body) => {
        if (error) {
            console.log("Error when get ICE list: " + error);
            return reject(error);
        }
        let bodyJson = JSON.parse(body);
        resolve(bodyJson.v.iceServers);
    });
    });
};

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
    // all messages with conversation, max 30 items
    let allConversationWithMessages = getAllConversationItems.allConversationWithMessages;

    // get ICE list from turn server
    let iceServerList = await getICETurnServer();

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
        allConversationWithMessages: allConversationWithMessages,
        bufferToBase64: bufferToBase64,
        lastItemOfArray: lastItemOfArray,
        convertTimeStampToHumanTime: convertTimeStampToHumanTime,
        iceServerList: JSON.stringify(iceServerList)
    });
};

module.exports = {
    getHome: getHome
};