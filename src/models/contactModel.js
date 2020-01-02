import mongoose from "mongoose";

let Schema = mongoose.Schema;

let ContactSchema = new Schema({
    userId: String,
    contactId: String,
    status: {type: Boolean, default: false},
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: null},
    deletedAt: {type: Number, default: null}
});

ContactSchema.statics = {
    createNew(item){
        return this.create(item)
    },
    /**
     * Find all item related to user
     * @param {string} userId 
     */
    findAllByUser(userId) {
        return this.find({
            $or: [
                {"userId": userId},
                {"contactId": userId}
            ]
        }).exec();
    },
    /**
     * Check exist of 2 users
     * @param {string} userId 
     * @param {string} contactId 
     */
    checkExists(userId, contactId) {
        return this.findOne({
            $or: [
                {$and: [
                    {"userId": userId},
                    {"contactId": contactId}
                ]},
                {$and: [
                    {"userId": contactId},
                    {"contactId": userId}
                ]}
            ]
        }).exec();
    },
    /**
     * Remove contact
     * @param {string} userId 
     * @param {string} contactId 
     */
    removeContact(userId, contactId) {
        return this.deleteOne({
            $or: [
                {$and: [
                    {"userId": userId},
                    {"contactId": contactId},
                    {"status": true}
                ]},
                {$and: [
                    {"userId": contactId},
                    {"contactId": userId},
                    {"status": true}
                ]}
            ]
        }).exec();
    },
    /**
     * Remove sent contact
     * @param {string} userId 
     * @param {string} contactId 
     */
    removeRequestContactSent(userId, contactId){
        return this.deleteOne({
            $and: [
                {"userId": userId},
                {"contactId": contactId},
                {"status": false}
            ]
        }).exec();
    },
    /**
     * Remove received contact
     * @param {string} userId 
     * @param {string} contactId 
     */
    removeRequestContactReceived(userId, contactId){
        return this.deleteOne({
            $and: [
                {"contactId": userId},
                {"userId": contactId},
                {"status": false}
            ]
        }).exec();
    },
    /**
     * Approve received contact
     * @param {string: of currentUser} userId 
     * @param {string} contactId 
     */
    approveRequestContactReceived(userId, contactId){
        return this.updateOne({
            $and: [
                {"contactId": userId},
                {"userId": contactId},
                {"status": false}
            ]
        }, {
            "status": true,
            "updatedAt": Date.now()
        }).exec();
    },
    /**
     * Get contact by userId and Limit
     * @param {string} userId 
     * @param {number} limit 
     */
    getContacts(userId, limit){
        return this.find({
            $and: [
                {$or: [
                    {"userId": userId},
                    {"contactId": userId}
                ]},
                {"status": true}
            ]
        }).sort({"updatedAt": -1}).limit(limit).exec();
    },
    /**
     * Get sent contact by userId and Limit
     * @param {string} userId 
     * @param {number} limit 
     */
    getContactsSent(userId, limit){
        return this.find({
            $and: [
                {"userId": userId},
                {"status": false}
            ]
        }).sort({"createdAt": -1}).limit(limit).exec();
    },
    /**
     * Get received contact by userId and Limit
     * @param {string} userId 
     * @param {number} limit 
     */
    getContactsReceived(userId, limit){
        return this.find({
            $and: [
                {"contactId": userId},
                {"status": false}
            ]
        }).sort({"createdAt": -1}).limit(limit).exec();
    },
    /**
     * Count all contact by userId and Limit
     * @param {string} userId
     */
    countAllContacts(userId){
        return this.countDocuments({
            $and: [
                {$or: [
                    {"userId": userId},
                    {"contactId": userId}
                ]},
                {"status": true}
            ]
        }).exec();
    },
    /**
     * Count all sent contact by userId and Limit
     * @param {string} userId
     */
    countAllContactsSent(userId){
        return this.countDocuments({
            $and: [
                {"userId": userId},
                {"status": false}
            ]
        }).exec();
    },
    /**
     * Count all received contact by userId and Limit
     * @param {string} userId
     */
    countAllContactsReceived(userId){
        return this.countDocuments({
            $and: [
                {"contactId": userId},
                {"status": false}
            ]
        }).exec();
    },
    /**
     * Read more contacts by userId, skip, limit
     * @param {string} userId 
     * @param {number} skip 
     * @param {number} limit 
     */
    readMoreContacts(userId, skip, limit) {
        return this.find({
            $and: [
                {$or: [
                    {"userId": userId},
                    {"contactId": userId}
                ]},
                {"status": true}
            ]
        }).sort({"updatedAt": -1}).skip(skip).limit(limit).exec();
    },
    /**
     * Read more sent contacts by userId, skip, limit
     * @param {string} userId 
     * @param {number} skip 
     * @param {number} limit 
     */
    readMoreContactsSent(userId, skip, limit) {
        return this.find({
            $and: [
                {"userId": userId},
                {"status": false}
            ]
        }).sort({"createdAt": -1}).skip(skip).limit(limit).exec();
    },
    /**
     * Read more received contacts by userId, skip, limit
     * @param {string} userId 
     * @param {number} skip 
     * @param {number} limit 
     */
    readMoreContactsReceived(userId, skip, limit) {
        return this.find({
            $and: [
                {"contactId": userId},
                {"status": false}
            ]
        }).sort({"createdAt": -1}).skip(skip).limit(limit).exec();
    }
}

module.exports = mongoose.model("contact", ContactSchema);