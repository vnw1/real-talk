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
     * Remove request contact
     * @param {string} userId 
     * @param {string} contactId 
     */
    removeRequestContact(userId, contactId){
        return this.deleteOne({
            $and: [
                {"userId": userId},
                {"contactId": contactId}
            ]
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
        }).sort({"createdAt": -1}).limit(limit).exec();
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
    }
}

module.exports = mongoose.model("contact", ContactSchema);