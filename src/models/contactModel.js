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
    }
}

module.exports = mongoose.model("contact", ContactSchema);