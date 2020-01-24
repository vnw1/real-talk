function approveRequestContactReceived() {
    $(".user-approve-request-contact-received").unbind("click").on("click", function () {
        let targetId = $(this).data("uid");
        let targetName = $(this).parent().find("div.user-name>p").text().trim();
        let targetAvatar = $(this).parent().find("div.user-avatar>img").attr("src");
        
        $.ajax({
            url: "/contact/approve-request-contact-received",
            type: "put",
            data: {uid: targetId},
            success: function (data) {
                if (data.success) {
                    let userInfo = $("#request-contact-received").find(`ul li[data-uid = ${targetId}]`);
                    $(userInfo).find("div.user-approve-request-contact-received").remove();
                    $(userInfo).find("div.user-remove-request-contact-received").remove();
                    $(userInfo).find("div.contactPanel")
                        .append(`
                            <div class="user-talk" data-uid="${targetId}">
                                Trò chuyện
                            </div>
                            <div class="user-remove-contact action-danger" data-uid="${targetId}">
                                Xóa liên hệ
                            </div>
                        `);
                    let userInfoHtml = userInfo.get(0).outerHTML;
                    $("#contacts").find("ul").prepend(userInfoHtml);
                    $(userInfo).remove();

                    decreaseNumberNotifContact("count-request-contact-received"); // js/calculateNotifContact.js
                    increaseNumberNotifContact("count-contacts"); // js/calculateNotifContact.js

                    decreaseNumberNotification("noti_contact_counter", 1); // js/calculateNotification.js

                    removeContact(); // js/removeContact.js

                    socket.emit("approve-request-contact-received", {contactId: targetId});

                    // Handle chat after approve contact
                    // Step 1: hide modal
                    // $("#contactsModal").modal("hide");

                    // Step 2: process leftSide.ejs
                    let subUsername = targetName;
                    if (subUsername.length > 15) {
                        subUsername = subUsername.substr(0, 14);
                    }
                    let leftSideData = `
                        <a href="#uid_${targetId}" class="room-chat" data-target="#to_${targetId}">
                            <li class="person" data-chat="${targetId}">
                                <div class="left-avatar">
                                    <div class="dot"></div>
                                    <img src="${targetAvatar}" alt="">
                                </div>
                                <span class="name">
                                    ${subUsername}
                                </span>
                                <span class="time"></span>
                                <span class="preview"></span>
                            </li>
                        </a>
                    `;
                    $("#all-chat").find("ul").prepend(leftSideData);
                    $("#user-chat").find("ul").prepend(leftSideData);

                    // Step 3: process rightSide
                    let rightSideData = `
                        <div class="right tab-pane" data-chat="${targetId}" id="to_${targetId}">
                            <div class="top">
                                <span>To: <span class="name">${targetName}</span></span>
                                <span class="chat-menu-right">
                                    <a href="#attachmentsModal_${targetId}" class="show-attachments" data-toggle="modal">
                                        Tệp đính kèm
                                        <i class="fa fa-paperclip"></i>
                                    </a>
                                </span>
                                <span class="chat-menu-right">
                                    <a href="javascript:void(0)">&nbsp;</a>
                                </span>
                                <span class="chat-menu-right">
                                    <a href="#imagesModal_${targetId}" class="show-images" data-toggle="modal">
                                        Hình ảnh
                                        <i class="fa fa-photo"></i>
                                    </a>
                                </span>
                            </div>
                            <div class="content-chat">
                                <div class="chat" data-chat="${targetId}"></div>
                            </div>
                            <div class="write" data-chat="${targetId}">
                                <input type="text" class="write-chat" id="write-chat-${targetId}" data-chat="${targetId}">
                                <div class="icons">
                                    <a href="#" class="icon-chat" data-chat="${targetId}"><i class="fa fa-smile-o"></i></a>
                                    <label for="image-chat-${targetId}">
                                        <input type="file" id="image-chat-${targetId}" name="my-image-chat" class="image-chat" data-chat="${targetId}">
                                        <i class="fa fa-photo"></i>
                                    </label>
                                    <label for="attachment-chat-${targetId}">
                                        <input type="file" id="attachment-chat-${targetId}" name="my-attachment-chat" class="attachment-chat" data-chat="${targetId}">
                                        <i class="fa fa-paperclip"></i>
                                    </label>
                                    <a href="javascript:void(0)" id="video-chat-${targetId}" class="video-chat" data-chat="${targetId}">
                                        <i class="fa fa-video-camera"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;
                    $("#screen-chat").prepend(rightSideData);

                    // Step 4: call function changeScreenChat
                    changeScreenChat();

                    // Step 5: process image modal
                    let imageModalData = `
                        <div class="modal fade" id="imagesModal_${targetId}" role="dialog">
                            <div class="modal-dialog modal-lg">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                                        <h4 class="modal-title">All Images in this conversation.</h4>
                                    </div>
                                    <div class="modal-body">
                                        <div class="all-images" style="visibility: hidden;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    $("body").append(imageModalData);

                    // Step 6: call gridPhotos function
                    gridPhotos(5);

                    // Step 7: process attachment modal
                    let attachmentModalData = `
                        <div class="modal fade" id="attachmentsModal_${targetId}" role="dialog">
                            <div class="modal-dialog modal-lg">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                                        <h4 class="modal-title">All Attachments in this conversation.</h4>
                                    </div>
                                    <div class="modal-body">
                                        <ul class="list-attachments"></ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    $("body").append(attachmentModalData);

                    // Step 8: update online
                    socket.emit("check-status");
                }
            }
        });
    });
};

socket.on("response-approve-request-contact-received", function (user) {
    let notif = `<div class="notif-readed-false" data-uid="${user.id}">
                    <img class="avatar-small" src="images/users/${user.avatar}" alt=""> 
                    <strong>${user.username}</strong> đã chấp nhận lời mời kết bạn của bạn!
                </div>`;
    $(".noti_content").prepend(notif); // popup notification
    $("ul.list-notifications").prepend(`<li>${notif}</li>`); // modal notification

    decreaseNumberNotification("noti_contact_counter", 1); // js/calculateNotification.js
    increaseNumberNotification("noti_counter", 1); // js/calculateNotifContact.js

    decreaseNumberNotifContact("count-request-contact-sent"); // js/calculateNotifContact.js
    increaseNumberNotifContact("count-contacts"); // js/calculateNotifContact.js

    $("request-contact-sent").find(`ul li[data-uid = ${user.id}]`).remove();
    $("#find-user").find(`ul li[data-uid = ${user.id}]`).remove();
    let userInfoHtml = `
        <li class="_contactList" data-uid="${user.id}">
            <div class="contactPanel">
                <div class="user-avatar">
                    <img src="images/users/${user.avatar}" alt="">
                </div>
                <div class="user-name">
                    <p>
                    ${user.username}
                    </p>
                </div>
                <br>
                <div class="user-address">
                    <span>&nbsp ${user.address}</span>
                </div>
                <div class="user-talk" data-uid="${user.id}">
                    Trò chuyện
                </div>
                <div class="user-remove-contact action-danger" data-uid="${user.id}">
                    Xóa liên hệ
                </div>
            </div>
        </li>
    `;
    $("#contacts").find("ul").prepend(userInfoHtml);

    removeContact(); // js/removeContact.js
    
    // Handle chat after approve contact
    // Step 1 skip

    // Step 2: process leftSide.ejs
    let subUsername = user.username;
    if (subUsername.length > 15) {
        subUsername = subUsername.substr(0, 14);
    }
    let leftSideData = `
        <a href="#uid_${user.id}" class="room-chat" data-target="#to_${user.id}">
            <li class="person" data-chat="${user.id}">
                <div class="left-avatar">
                    <div class="dot"></div>
                    <img src="images/users/${user.avatar}" alt="">
                </div>
                <span class="name">
                    ${subUsername}
                </span>
                <span class="time"></span>
                <span class="preview"></span>
            </li>
        </a>
    `;
    $("#all-chat").find("ul").prepend(leftSideData);
    $("#user-chat").find("ul").prepend(leftSideData);

    // Step 3: process rightSide
    let rightSideData = `
        <div class="right tab-pane" data-chat="${user.id}" id="to_${user.id}">
            <div class="top">
                <span>To: <span class="name">${user.username}</span></span>
                <span class="chat-menu-right">
                    <a href="#attachmentsModal_${user.id}" class="show-attachments" data-toggle="modal">
                        Tệp đính kèm
                        <i class="fa fa-paperclip"></i>
                    </a>
                </span>
                <span class="chat-menu-right">
                    <a href="javascript:void(0)">&nbsp;</a>
                </span>
                <span class="chat-menu-right">
                    <a href="#imagesModal_${user.id}" class="show-images" data-toggle="modal">
                        Hình ảnh
                        <i class="fa fa-photo"></i>
                    </a>
                </span>
            </div>
            <div class="content-chat">
                <div class="chat" data-chat="${user.id}"></div>
            </div>
            <div class="write" data-chat="${user.id}">
                <input type="text" class="write-chat" id="write-chat-${user.id}" data-chat="${user.id}">
                <div class="icons">
                    <a href="#" class="icon-chat" data-chat="${user.id}"><i class="fa fa-smile-o"></i></a>
                    <label for="image-chat-${user.id}">
                        <input type="file" id="image-chat-${user.id}" name="my-image-chat" class="image-chat" data-chat="${user.id}">
                        <i class="fa fa-photo"></i>
                    </label>
                    <label for="attachment-chat-${user.id}">
                        <input type="file" id="attachment-chat-${user.id}" name="my-attachment-chat" class="attachment-chat" data-chat="${user.id}">
                        <i class="fa fa-paperclip"></i>
                    </label>
                    <a href="javascript:void(0)" id="video-chat-${user.id}" class="video-chat" data-chat="${user.id}">
                        <i class="fa fa-video-camera"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
    $("#screen-chat").prepend(rightSideData);

    // Step 4: call function changeScreenChat
    changeScreenChat();

    // Step 5: process image modal
    let imageModalData = `
        <div class="modal fade" id="imagesModal_${user.id}" role="dialog">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">All Images in this conversation.</h4>
                    </div>
                    <div class="modal-body">
                        <div class="all-images" style="visibility: hidden;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    $("body").append(imageModalData);

    // Step 6: call gridPhotos function
    gridPhotos(5);

    // Step 7: process attachment modal
    let attachmentModalData = `
        <div class="modal fade" id="attachmentsModal_${user.id}" role="dialog">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">All Attachments in this conversation.</h4>
                    </div>
                    <div class="modal-body">
                        <ul class="list-attachments"></ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    $("body").append(attachmentModalData);

    // Step 8: update online
    socket.emit("check-status");
});

$(document).ready(function () {
    approveRequestContactReceived();
});