import userModel from "./../models/userModel";
import {transErrors} from "./../../lang/vi";
import bcrypt from "bcryptjs";

const saltRounds = 7;

/**
 * Update user info
 * @param {userId} id 
 * @param {dataUpdate} item 
 */
let updateUser = (id, item) => {
    return userModel.updateUser(id, item);
};

/**
 * Update user password
 * @param {userId} id 
 * @param {dataUpdate} dataUpdate 
 */
let updatePassword = (id, dataUpdate) => {
    return new Promise(async (resolve, reject) => {
        let currentUser = await userModel.findUserByIdToUpdatePassword(id);
        if (!currentUser) {
            return reject(transErrors.account_undefined);
        }

        let checkCurrentPassword = await currentUser.comparePassword(dataUpdate.currentPassword);
        if (!checkCurrentPassword) {
            return reject(transErrors.user_current_password_failed);
        }

        let salt = bcrypt.genSaltSync(saltRounds);
        await userModel.updatePassword(id, bcrypt.hashSync(dataUpdate.newPassword, salt));
        resolve(true);
    });
};

module.exports = {
    updateUser: updateUser,
    updatePassword: updatePassword
};