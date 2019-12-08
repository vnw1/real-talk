import userModel from "./../models/userModel";

/**
 * Update user info
 * @param {userId} id 
 * @param {dataUpdate} item 
 */
let updateUser = (id, item) => {
    return userModel.updateUser(id, item);
};

module.exports = {
    updateUser: updateUser
};