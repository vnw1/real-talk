function addContact() {
    $(".user-add-new-contact").bind("click", function () {
        let targetId = $(this).data("uid");
        $.post("/contact/add-new", {uid: targetId}, function (data) {
            if (data.success) {
             $("#find-user").find(`div.user-add-new-contact[data-uid = ${targetId}]`).hide();   
             $("#find-user").find(`div.user-remove-request-contact-sent[data-uid = ${targetId}]`).css("display", "inline-block");   

             increaseNumberNotification("noti_contact_counter", 1); // js/calculateNotification.js

             increaseNumberNotifContact("count-request-contact-sent"); // js/calculateNotifContact.js

             // Add html element into tab sent request
             let userInfoHtml = $("#find-user").find(`ul li[data-uid=${targetId}]`).get(0).outerHTML;
             $("#request-contact-sent").find("ul").prepend(userInfoHtml);

             removeRequestContactSent(); // js/removeRequestContactSent.js

             socket.emit("add-new-contact", {contactId: targetId});
            }
        });
    });
}

socket.on("response-add-new-contact", function (user) {
    let notif = `<div class="notif-readed-false" data-uid="${user.id}">
                    <img class="avatar-small" src="images/users/${user.avatar}" alt=""> 
                    <strong>${user.username}</strong> đã gửi cho bạn một lời mời kết bạn!
                </div>`;
    $(".noti_content").prepend(notif); // popup notification
    $("ul.list-notifications").prepend(`<li>${notif}</li>`); // modal notification

    increaseNumberNotifContact("count-request-contact-received");

    increaseNumberNotification("noti_contact_counter", 1); // js/calculateNotification.js
    increaseNumberNotification("noti_counter", 1); // js/calculateNotifContact.js

    // Add html element into tab received request
    let userInfoHtml = `<li class="_contactList" data-uid="${user.id}">
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
                                <div class="user-acccept-contact-received" data-uid="${user.id}">
                                    Chấp nhận
                                </div>
                                <div class="user-reject-request-contact-received action-danger" data-uid="${user.id}">
                                    Xóa yêu cầu
                                </div>
                            </div>
                        </li>`;
    $("#request-contact-received").find("ul").prepend(userInfoHtml);
});