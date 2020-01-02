import contactModel from "./../models/contactModel";
import userModel from "./../models/userModel";
import chatGroupModel from "./../models/chatGroupModel";
import _ from "lodash";

const LIMIT_CONVERSATION_TAKEN = 15;

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

            resolve({
                usersConversations: usersConversations,
                groupConversations: groupConversations,
                allConversations: allConversations
            });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    getAllConversationItems: getAllConversationItems
};