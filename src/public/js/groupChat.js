function addFriendsToGroup() {
    $("ul#group-chat-friends").find("div.add-user").bind("click", function() {
        let uid = $(this).data("uid");
        $(this).remove();
        let html = $("ul#group-chat-friends").find("div[data-uid=" + uid + "]").html();

        let promise = new Promise(function(resolve, reject) {
        $("ul#friends-added").append(html);
        $("#groupChatModal .list-user-added").show();
        resolve(true);
        });
        promise.then(function(success) {
        $("ul#group-chat-friends").find("div[data-uid=" + uid + "]").remove();
        });
    });
}
  
function cancelCreateGroup() {
    $("#btn-cancel-group-chat").bind("click", function() {
        $("#groupChatModal .list-user-added").hide();
        if ($("ul#friends-added>li").length) {
        $("ul#friends-added>li").each(function(index) {
            $(this).remove();
        });
        }
    });
}

function callSearchFriends(element) {
    if (element.which === 13 || element.type === "click") {
        let keyword = $("#input-search-friends-to-add-group-chat").val();
        let regexKeyword = new RegExp(/^[\s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/);

        if (!keyword.length) {
            alertify.notify("Chưa nhập nội dung tìm kiếm", "error", 7);
            return false;
        }

        if (!regexKeyword.test(keyword)) {
            alertify.notify("Chỉ cho phép tìm kiếm chữ cái, số và khoảng trắng", "error", 7);
            return false;
        }

        $.get(`/contact/search-friends/${keyword}`, function (data) {
            $("ul#group-chat-friends").html(data);
            // Thêm người dùng vào danh sách liệt kê trước khi tạo nhóm trò chuyện
            addFriendsToGroup();

            // Action hủy việc tạo nhóm trò chuyện
            cancelCreateGroup();
        });
    }
};

function callCreateGroupChat() {
    $("#btn-create-group-chat").unbind("click").on("click", function () {
        let countUsers = $("ul#friends-added").find("li");
        if (countUsers.length < 2) {
            alertify.notify("At least 2 friends to create group", "error", 7);
            return false;
        }

        let groupChatName = $("#input-name-group-chat").val();
        let regexGroupChatName = new RegExp(/^[\s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/);
        if (!regexGroupChatName.test(groupChatName) || groupChatName.length < 5 || groupChatName.length > 30) {
            alertify.notify("Name length must be between 5 to 30 and not contain special characters", "error", 7);
            return false;
        }

        let arrayIds = [];
        $("ul#friends-added").find("li").each(function(index, item) {
            arrayIds.push({"userId": $(item).data("uid")});
        });

        Swal.fire({
            title: `Bạn có chắc chắn muốn tạo nhóm &nbsp; ${groupChatName}?`,
            type: "info",
            showCancelButton: true,
            confirmButtonColor: "#2ECC71",
            cancelButtonColor: "#ff7675",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy"
          }).then((result) => {
            if (!result.value) {
                return false;
            }
            $.post("/group-chat/add-new", {
                arrayIds: arrayIds,
                groupChatName: groupChatName
            }, function (data) {
                // Step 1: hide modal
                $("#input-name-group-chat").val("");
                $("#btn-cancel-group-chat").click();
                $("#groupChatModal").modal("hide");

                // Step 2: process leftSide.ejs
                let subGroupChatName = data.groupChat.name;
                if (subGroupChatName.length > 15) {
                    subGroupChatName = subGroupChatName.substr(0, 14);
                }
                let leftSideData = `
                    <a href="#uid_${data.groupChat._id}" class="room-chat" data-target="#to_${data.groupChat._id}">
                        <li class="person group-chat" data-chat="${data.groupChat._id}">
                            <div class="left-avatar">
                                <img src="images/users/group-avatar-huyyagami.png" alt="">
                            </div>
                            <span class="name">
                                <span class="group-chat-name">
                                    ${subGroupChatName}<span>...</span>
                                </span>
                            </span>
                            <span class="time"></span>
                            <span class="preview"></span>
                        </li>
                    </a>
                `;
                $("#all-chat").find("ul").prepend(leftSideData);
                $("#group-chat").find("ul").prepend(leftSideData);

                // Step 3: process rightSide
                let rightSideData = `
                    <div class="right tab-pane" data-chat="${data.groupChat._id}" id="to_${data.groupChat._id}">
                        <div class="top">
                            <span>To: <span class="name">${data.groupChat.name}</span></span>
                            <span class="chat-menu-right">
                                <a href="#attachmentsModal_${data.groupChat._id}" class="show-attachments" data-toggle="modal">
                                    Tệp đính kèm
                                    <i class="fa fa-paperclip"></i>
                                </a>
                            </span>
                            <span class="chat-menu-right">
                                <a href="javascript:void(0)">&nbsp;</a>
                            </span>
                            <span class="chat-menu-right">
                                <a href="#imagesModal_${data.groupChat._id}" class="show-images" data-toggle="modal">
                                    Hình ảnh
                                    <i class="fa fa-photo"></i>
                                </a>
                            </span>
                            <span class="chat-menu-right">
                                <a href="javascript:void(0)">&nbsp;</a>
                            </span>
                            <span class="chat-menu-right">
                                <a href="javascript:void(0)" class="number-members" data-toggle="modal">
                                    <span class="show-number-members">${data.groupChat.userAmount}</span>
                                    <i class="fa fa-users"></i>
                                </a>
                            </span>
                            <span class="chat-menu-right">
                                <a href="javascript:void(0)">&nbsp;</a>
                            </span>
                            <span class="chat-menu-right">
                                <a href="javascript:void(0)" class="number-messages" data-toggle="modal">
                                    <span class="show-number-messages">${data.groupChat.messageAmount}</span>
                                    <i class="fa fa-comment-o"></i>
                                </a>
                            </span>
                        </div>
                        <div class="content-chat">
                            <div class="chat" data-chat="${data.groupChat._id}"></div>
                        </div>
                        <div class="write" data-chat="${data.groupChat._id}">
                            <input type="text" class="write-chat chat-in-group" id="write-chat-${data.groupChat._id}" data-chat="${data.groupChat._id}">
                            <div class="icons">
                                <a href="#" class="icon-chat" data-chat="${data.groupChat._id}"><i class="fa fa-smile-o"></i></a>
                                <label for="image-chat-${data.groupChat._id}">
                                    <input type="file" id="image-chat-${data.groupChat._id}" name="my-image-chat" class="image-chat chat-in-group" data-chat="${data.groupChat._id}">
                                    <i class="fa fa-photo"></i>
                                </label>
                                <label for="attachment-chat-${data.groupChat._id}">
                                    <input type="file" id="attachment-chat-${data.groupChat._id}" name="my-attachment-chat" class="attachment-chat chat-in-group" data-chat="${data.groupChat._id}">
                                    <i class="fa fa-paperclip"></i>
                                </label>
                                <a href="javascript:void(0)" id="video-chat-group">
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
                    <div class="modal fade" id="imagesModal_${data.groupChat._id}" role="dialog">
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
                    <div class="modal fade" id="attachmentsModal_${data.groupChat._id}" role="dialog">
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

                // Step 8: Emit created group
                socket.emit("new-group-created", {groupChat: data.groupChat});

                // Step 9: skip

                // Step 10: update online
                socket.emit("check-status");
            })
            .fail(function (response) {
                alertify.notify(response.responseText, "error", 7);
            });
          });
    });
};

$(document).ready(function() {
    $("#input-search-friends-to-add-group-chat").bind("keypress", callSearchFriends);
    $("#btn-search-friends-to-add-group-chat").bind("click", callSearchFriends);
    callCreateGroupChat();

    socket.on("response-new-group-created", function (response) {
        // Step 2: process leftSide.ejs
        let subGroupChatName = response.groupChat.name;
        if (subGroupChatName.length > 15) {
            subGroupChatName = subGroupChatName.substr(0, 14);
        }
        let leftSideData = `
            <a href="#uid_${response.groupChat._id}" class="room-chat" data-target="#to_${response.groupChat._id}">
                <li class="person group-chat" data-chat="${response.groupChat._id}">
                    <div class="left-avatar">
                        <img src="images/users/group-avatar-huyyagami.png" alt="">
                    </div>
                    <span class="name">
                        <span class="group-chat-name">
                            ${subGroupChatName}<span>...</span>
                        </span>
                    </span>
                    <span class="time"></span>
                    <span class="preview"></span>
                </li>
            </a>
        `;
        $("#all-chat").find("ul").prepend(leftSideData);
        $("#group-chat").find("ul").prepend(leftSideData);

        // Step 3: process rightSide
        let rightSideData = `
            <div class="right tab-pane" data-chat="${response.groupChat._id}" id="to_${response.groupChat._id}">
                <div class="top">
                    <span>To: <span class="name">${response.groupChat.name}</span></span>
                    <span class="chat-menu-right">
                        <a href="#attachmentsModal_${response.groupChat._id}" class="show-attachments" data-toggle="modal">
                            Tệp đính kèm
                            <i class="fa fa-paperclip"></i>
                        </a>
                    </span>
                    <span class="chat-menu-right">
                        <a href="javascript:void(0)">&nbsp;</a>
                    </span>
                    <span class="chat-menu-right">
                        <a href="#imagesModal_${response.groupChat._id}" class="show-images" data-toggle="modal">
                            Hình ảnh
                            <i class="fa fa-photo"></i>
                        </a>
                    </span>
                    <span class="chat-menu-right">
                        <a href="javascript:void(0)">&nbsp;</a>
                    </span>
                    <span class="chat-menu-right">
                        <a href="javascript:void(0)" class="number-members" data-toggle="modal">
                            <span class="show-number-members">${response.groupChat.userAmount}</span>
                            <i class="fa fa-users"></i>
                        </a>
                    </span>
                    <span class="chat-menu-right">
                        <a href="javascript:void(0)">&nbsp;</a>
                    </span>
                    <span class="chat-menu-right">
                        <a href="javascript:void(0)" class="number-messages" data-toggle="modal">
                            <span class="show-number-messages">${response.groupChat.messageAmount}</span>
                            <i class="fa fa-comment-o"></i>
                        </a>
                    </span>
                </div>
                <div class="content-chat">
                    <div class="chat" data-chat="${response.groupChat._id}"></div>
                </div>
                <div class="write" data-chat="${response.groupChat._id}">
                    <input type="text" class="write-chat chat-in-group" id="write-chat-${response.groupChat._id}" data-chat="${response.groupChat._id}">
                    <div class="icons">
                        <a href="#" class="icon-chat" data-chat="${response.groupChat._id}"><i class="fa fa-smile-o"></i></a>
                        <label for="image-chat-${response.groupChat._id}">
                            <input type="file" id="image-chat-${response.groupChat._id}" name="my-image-chat" class="image-chat chat-in-group" data-chat="${response.groupChat._id}">
                            <i class="fa fa-photo"></i>
                        </label>
                        <label for="attachment-chat-${response.groupChat._id}">
                            <input type="file" id="attachment-chat-${response.groupChat._id}" name="my-attachment-chat" class="attachment-chat chat-in-group" data-chat="${response.groupChat._id}">
                            <i class="fa fa-paperclip"></i>
                        </label>
                        <a href="javascript:void(0)" id="video-chat-group">
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
            <div class="modal fade" id="imagesModal_${response.groupChat._id}" role="dialog">
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
            <div class="modal fade" id="attachmentsModal_${response.groupChat._id}" role="dialog">
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

        // Step 9: Emit when member is added to group chat
        socket.emit("member-received-group-chat", {groupChatId: response.groupChat._id});

        // Step 10: update online
        socket.emit("check-status");
    });
});