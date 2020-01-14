import contactModel from "./../models/contactModel";
import userModel from "./../models/userModel";
import chatGroupModel from "./../models/chatGroupModel";
import messageModel from "./../models/messageModel";
import _ from "lodash";
import {transErrors} from "./../../lang/vi";
import {app} from "./../config/app";

const LIMIT_CONVERSATION_TAKEN = 15;
const LIMIT_MESSAGE_TAKEN = 30;

/**
 * Get all conversation
 * @param {string} currentUserId 
 */
let getAllConversationItems = (currentUserId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let contacts = await contactModel.getContacts(currentUserId, LIMIT_CONVERSATION_TAKEN);

            let userConversationsPromise = contacts.map(async (contact) => {
                if (contact.contactId == currentUserId) {
                    let getUserContact = await userModel.getNormalUserDataById(contact.userId);
                    getUserContact.updatedAt = contact.updatedAt;
                    return getUserContact;
                } else {
                    let getUserContact = await userModel.getNormalUserDataById(contact.contactId);
                    getUserContact.updatedAt = contact.updatedAt;
                    return getUserContact;
                }
            });
            let usersConversations = await Promise.all(userConversationsPromise);
            let groupConversations = await chatGroupModel.getChatGroups(currentUserId, LIMIT_CONVERSATION_TAKEN);
            let allConversations = usersConversations.concat(groupConversations);

            allConversations = _.sortBy(allConversations, (item) => {
                return -item.updatedAt;
            });

            // get messages to apply into screen chat
            let allConversationWithMessagesPromise = allConversations.map(async (conversation) => {
                conversation = conversation.toObject();

                if (conversation.members) {
                    let getMessages = await messageModel.model.getMessagesInGroup(conversation._id, LIMIT_MESSAGE_TAKEN);
                    conversation.messages = _.reverse(getMessages);
                } else {
                    let getMessages = await messageModel.model.getMessagesInPersonal(currentUserId, conversation._id, LIMIT_MESSAGE_TAKEN);
                    conversation.messages = _.reverse(getMessages);
                }

                return conversation;
            });

            let allConversationWithMessages = await Promise.all(allConversationWithMessagesPromise);
            // sort by updatedAt descending
            allConversationWithMessages = _.sortBy(allConversationWithMessages, (item) => {
                return -item.updatedAt;
            });

            resolve({
                allConversationWithMessages: allConversationWithMessages
            });
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Add new message and emoji
 * @param {object} sender current user
 * @param {string} receiverId user id or group id
 * @param {string} messageVal 
 * @param {bool} isChatGroup 
 */
let addNewTextEmoji = (sender, receiverId, messageVal, isChatGroup) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (isChatGroup) {
                let getChatGroupReceiver = await chatGroupModel.getChatGroupById(receiverId);
                if (!getChatGroupReceiver) {
                    return reject(transErrors.conversation_not_found);
                }
                let receiver = {
                    id: getChatGroupReceiver._id,
                    name: getChatGroupReceiver.name,
                    avatar: app.general_avatar_group_chat
                };

                let newMessageItem = {
                    senderId: sender.id,
                    receiverId: receiver.id,
                    conversationType: messageModel.conversationTypes.GROUP,
                    messageType: messageModel.messageTypes.TEXT,
                    sender: sender,
                    receiver: receiver,
                    text: messageVal,
                    createdAt: Date.now()
                };
                // create new message
                let newMessage = await messageModel.model.createNew(newMessageItem);
                // update group chat
                await chatGroupModel.updateWhenHasNewMessage(getChatGroupReceiver._id, getChatGroupReceiver.messageAmount+1);
                resolve(newMessage);
            } else {
                let getUserReceiver = await userModel.getNormalUserDataById(receiverId);
                if (!getUserReceiver) {
                    return reject(transErrors.conversation_not_found);
                }

                let receiver = {
                    id: getUserReceiver._id,
                    name: getUserReceiver.username,
                    avatar: getUserReceiver.avatar
                };

                let newMessageItem = {
                    senderId: sender.id,
                    receiverId: receiver.id,
                    conversationType: messageModel.conversationTypes.PERSONAL,
                    messageType: messageModel.messageTypes.TEXT,
                    sender: sender,
                    receiver: receiver,
                    text: messageVal,
                    createdAt: Date.now()
                };
                // create new message
                let newMessage = await messageModel.model.createNew(newMessageItem);
                // update personal chat
                await contactModel.updateWhenHasNewMessage(sender.id, getUserReceiver._id);

                resolve(newMessage);
            }
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    getAllConversationItems: getAllConversationItems,
    addNewTextEmoji: addNewTextEmoji
};