$(document).ready(function () {
    $("#link-read-more-all-chat").bind("click", function () {
        let skipPersonal = $("#all-chat").find("li:not(.group-chat)").length;
        let skipGroup = $("#all-chat").find("li.group-chat").length;

        $("#link-read-more-all-chat").css("display", "none");
        $(".read-more-all-chat-loader").css("display", "inline-block");
        
        $.get(`/message/read-more-all-chat?skipPersonal=${skipPersonal}&skipGroup=${skipGroup}`, function (data) {
            if (data.leftSideData.trim() === "") {
                alertify.notify("Bạn không còn cuộc trò chuyện nào để xem nữa cả", "error", 7);
                $("#link-read-more-all-chat").css("display", "inline-block");
                $(".read-more-all-chat-loader").css("display", "none");

                return false;
            }

            // Step 1: process leftSide
            $("#all-chat").find("ul").append(data.leftSideData);

            // Step 2: process scroll left
            resizeNineScrollLeft();
            nineScrollLeft();

            // Step 3: process rightSide
            $("#screen-chat").append(data.rightSideData);

            // Step 4: call changeScreenChat function
            changeScreenChat();

            // Step 5: convert emoji (skip)

            // Step 6: process imageModal
            $("body").append(data.imageModalData);

            // Step 7: call function gridPhotos
            gridPhotos(5);

            // Step 8: process attachmentModal
            $("body").append(data.attachmentModalData);

            // Step 9: update user online status
            socket.emit("check-status");
            
            // Step10: remove loading
            $("#link-read-more-all-chat").css("display", "inline-block");
            $(".read-more-all-chat-loader").css("display", "none");

            // Step 11: call readMoreMessages
            readMoreMessages();
        });
    });
});