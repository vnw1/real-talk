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
    $("#cancel-group-chat").bind("click", function() {
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
    
};

$(document).ready(function() {
    $("#input-search-friends-to-add-group-chat").bind("keypress", callSearchFriends);
    $("#btn-search-friends-to-add-group-chat").bind("click", callSearchFriends);
});