import {pushSocketIdToArray, emitNotifyToArray, removeSocketIdFromArray} from "./../../helpers/socketHelper";

/**
 * @param io from socket.io lib 
 */
let addNewContact = (io) => {
    let clients = {};
   io.on("connection", (socket) => {
       // push socket id to array
       clients = pushSocketIdToArray(clients, socket.request.user._id, socket.id);

       socket.on("add-new-contact", (data) => {
           let currentUser = {
               id: socket.request.user._id,
               username: socket.request.user.username,
               avatar: socket.request.user.avatar
           };
           // emit notification
           if (clients[data.contactId]) {
            emitNotifyToArray(clients, data.contactId, io, "response-add-new-contact", currentUser);
           }
       });
       
       socket.on("disconnect", () => {
        // remove socket id when socket disconnected
        clients = removeSocketIdFromArray(clients, socket.request.user._id, socket);
       });
       console.log(clients);
   }); 
}

module.exports = addNewContact;