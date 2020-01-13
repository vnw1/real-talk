function textAndEmojiChat(divId) {
  $(".emojionearea").unbind("keyup").on("keyup", function (element) {
      let currentEmojioneArea = $(this);
      if (element.which === 13) {
          let targetId = $(`#write-chat-${divId}`).data("chat");
          let messageVal = $(`#write-chat-${divId}`).val();

          if (!targetId.length || !messageVal.length) {
              return false;
          }

          let dataTextEmojiForSend = {
            uid: targetId,
            messageVal: messageVal
          };

          if ($(`#write-chat-${divId}`).hasClass("chat-in-group")) {
              dataTextEmojiForSend.isChatGroup = true;
          }

          // call send message
          $.post("/message/add-new-text-emoji", dataTextEmojiForSend, function (data) {
              let dataToEmit = {
                message: data.message
              };
              let messageOfMe = $(`<div class="bubble me data-mess-id="${data.message._id}"></div>`);
              messageOfMe.text(data.message.text);

              if (dataTextEmojiForSend.isChatGroup) {
                let senderAvatar = `<img src="/images/users/${data.message.sender.avatar}" class="avatar-small" title="${data.message.sender.name}" />`;
                messageOfMe.html(`${senderAvatar} ${data.message.text}`);

                increaseNumberMessageGroup(divId);
                dataToEmit.groupId = targetId;
              } else {
                messageOfMe.text(data.message.text);
                dataToEmit.contactId = targetId;
              }

              $(`.right .chat[data-chat=${divId}]`).append(messageOfMe);
              nineScrollRight(divId);

              // clear texting input after pressing enter
              $(`#write-chat-${divId}`).val("");
              currentEmojioneArea.find(".emojionearea-editor").text("");

              // update preview message
              $(`.person[data-chat=${divId}]`).find("span.time").removeClass("message-time-realtime").html(moment(data.message.createdAt).locale("en").startOf("second").fromNow());
              $(`.person[data-chat=${divId}]`).find("span.preview").html(data.message.text);

              // move conversation to top
              $(`.person[data-chat=${divId}]`).on("huyyagami.moveConversationToTheTop", function () {
                let dataToMove = $(this).parent();
                $(this).closest("ul").prepend(dataToMove);
                $(this).off("huyyagami.moveConversationToTheTop");
              });
              $(`.person[data-chat=${divId}]`).trigger("huyyagami.moveConversationToTheTop");

              // Emit realtime
              socket.emit("chat-text-emoji", dataToEmit)

          }).fail(function (res) {
              alertify.notify(res.responseText, "error", 7);
          });
      }
  })
};

$(document).ready(function () {
    socket.on("response-chat-text-emoji", function (response) {
      let divId = "";
      let messageOfYou = $(`<div class="bubble you data-mess-id="${response.message._id}"></div>`);
      messageOfYou.text(response.message.text);

      if (response.currentGroupId) {
        let senderAvatar = `<img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title="${response.message.sender.name}" />`;
        messageOfYou.html(`${senderAvatar} ${response.message.text}`);

        divId = response.currentGroupId;

        if (response.currentUserId !== $("#dropdown-navbar-user").data("uid")) {
          increaseNumberMessageGroup(divId);
        }
      } else {
        messageOfYou.text(response.message.text);
        divId = response.currentUserId;
      }

      if (response.currentUserId !== $("#dropdown-navbar-user").data("uid")) {
        console.log(true);
        $(`.right .chat[data-chat=${divId}]`).append(messageOfYou);
        nineScrollRight(divId);
        $(`.person[data-chat=${divId}]`).find("span.time").addClass("message-time-realtime");
      }

      // update preview message
      $(`.person[data-chat=${divId}]`).find("span.time").html(moment(response.message.createdAt).locale("en").startOf("second").fromNow());
      $(`.person[data-chat=${divId}]`).find("span.preview").html(response.message.text);

      // move conversation to top
      $(`.person[data-chat=${divId}]`).on("huyyagami.moveConversationToTheTop", function () {
        let dataToMove = $(this).parent();
        $(this).closest("ul").prepend(dataToMove);
        $(this).off("huyyagami.moveConversationToTheTop");
      });
      $(`.person[data-chat=${divId}]`).trigger("huyyagami.moveConversationToTheTop");
  });
});