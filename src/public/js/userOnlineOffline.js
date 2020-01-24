// Step 0
socket.emit("check-status");

// Step 1
socket.on("server-send-list-users-online", function (listUserIds) {
    listUserIds.forEach(userId => {
        $(`.person[data-chat=${userId}]`).find("div.dot").addClass("online");
        $(`.person[data-chat=${userId}]`).find("img").addClass("avatar-online");
    });
});


// Step 2
socket.on("server-send-when-new-user-online", function (userId) {
    $(`.person[data-chat=${userId}]`).find("div.dot").addClass("online");
    $(`.person[data-chat=${userId}]`).find("img").addClass("avatar-online");
});

// Step 3
socket.on("server-send-when-new-user-offline", function (userId) {
    $(`.person[data-chat=${userId}]`).find("div.dot").removeClass("online");
    $(`.person[data-chat=${userId}]`).find("img").removeClass("avatar-online");
});

