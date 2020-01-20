function videoChat(divId) {
    $(`#video-chat-${divId}`).unbind("click").on("click", function () {
        let targetId = $(this).data("chat");
        let callerName = $("#navbar-username").text();

        let dataToEmit = {
            listenerId: targetId,
            callerName: callerName
        };

        // Step 1: check if listener is online
        socket.emit("caller-check-listener-online-or-not", dataToEmit);
    });
};

function playVideoStream(videoTagId, stream) {
  let video = document.getElementById(videoTagId);  
  video.srcObject = stream;
  video.onloadeddata = function () {
    video.play();
  };
};

function closeVideoStream(stream) {
    return stream.getTracks().forEach(track => track.stop());
};

$(document).ready(function () {
    // Step 2: show error message if listener is offline
    socket.on("server-send-listener-is-offline", function () {
       alertify.notify("This user is currently offline", "error", 7); 
    });

    let getPeerId = "";
    const peer = new Peer({
        // debug: 3
    });

    peer.on("open", function (peerId) {
        getPeerId = peerId;
    });
    // Step 3: request peerId of listener
    socket.on("server-request-peer-id-of-listener", function (response) {
        let listenerName = $("#navbar-username").text();
        let dataToEmit = {
            callerId: response.callerId,
            listenerId: response.listenerId,
            callerName: response.callerName,
            listenerName: listenerName,
            listenerPeerId: getPeerId
        };

        // Step 4: listener send peerId to socket server
        socket.emit("listener-emit-peer-id-to-server", dataToEmit);

    });
    
    let timerInterval;

    // Step 5: server send peerId of listener to caller
    socket.on("server-send-peer-id-of-listener-to-caller", function (response) {
        let dataToEmit = {
            callerId: response.callerId,
            listenerId: response.listenerId,
            callerName: response.callerName,
            listenerName: response.listenerName,
            listenerPeerId: response.listenerPeerId
        };

        // Step 6: 
        socket.emit("caller-request-call-to-server", dataToEmit);

        Swal.fire({
            title: `Calling &nbsp; <span style="color: #2ecc71;">${response.listenerName}</span> &nbsp; <i class="fa fa-volume-control-phone"><i>`,
            html: `Thời gian: <strong style="color: #d43f3a;"></strong> giây <br/> <br/>
                    <button id="btn-cancel-call" class="btn-danger">
                        Hủy cuộc gọi
                    </button>
            `,
            backdrop: "rgba(85, 85, 85, 0.4)",
            width: "52rem",
            timer: 30000,
            allowOutsideClick: false,
            onBeforeOpen: () => {
                $("#btn-cancel-call").unbind("click").on("click", function () {
                    Swal.close();
                    clearInterval(timerInterval);
                    
                    // Step 7: Caller request cancel call
                    socket.emit("caller-cancel-request-call-to-server", dataToEmit); 
                });

                if (Swal.getContent().querySelector !== null) {
                    Swal.showLoading();
                    timerInterval = setInterval(() => {
                        Swal.getContent().querySelector("strong").textContent = Math.ceil(Swal.getTimerLeft() / 1000);
                    }, 1000);
                }
            },
            onOpen: () => {
                // Step 12: server send reject request to caller
                socket.on("server-send-reject-call-to-caller", function (response) {
                    Swal.close();
                    clearInterval(timerInterval);
                    
                    Swal.fire({
                        type: "info",
                        title: `<span style="color: #2ecc71;">${response.listenerName}</span> &nbsp; can not pickup the call`,
                        backdrop: "rgba(85, 85, 85, 0.4)",
                        width: "52rem",
                        allowOutsideClick: false,
                        confirmButtonColor: "#2ECC71",
                        confirmButtonText: "Xác nhận"
                    });
                });
            },
            onClose: () => {
                clearInterval(timerInterval);
            }
        }).then((result) => {
            return false;
        });
    });

    // Step 8:
    socket.on("server-send-request-call-to-listener", function (response) {
        let dataToEmit = {
            callerId: response.callerId,
            listenerId: response.listenerId,
            callerName: response.callerName,
            listenerName: response.listenerName,
            listenerPeerId: response.listenerPeerId
        };

        Swal.fire({
            title: `<span style="color: #2ecc71;">${response.callerName}</span> &nbsp; is calling &nbsp; <i class="fa fa-volume-control-phone"><i>`,
            html: `Thời gian: <strong style="color: #d43f3a;"></strong> giây <br/> <br/>
                    <button id="btn-reject-call" class="btn-danger">
                        Từ chối
                    </button>
                    <button id="btn-accept-call" class="btn-success">
                        Đồng ý
                    </button>
            `,
            backdrop: "rgba(85, 85, 85, 0.4)",
            width: "52rem",
            timer: 30000,
            allowOutsideClick: false,
            onBeforeOpen: () => {
                $("#btn-reject-call").unbind("click").on("click", function () {
                    Swal.close();
                    clearInterval(timerInterval);
                    
                    // Step 10: listener send reject request to server
                    socket.emit("listener-reject-request-call-to-server", dataToEmit);
                });

                $("#btn-accept-call").unbind("click").on("click", function () {
                    Swal.close();
                    clearInterval(timerInterval);
                    
                    // Step 11: listener send accept request to server
                    socket.emit("listener-accept-request-call-to-server", dataToEmit);
                });

                if (Swal.getContent().querySelector !== null) {
                    Swal.showLoading();
                    timerInterval = setInterval(() => {
                        Swal.getContent().querySelector("strong").textContent = Math.ceil(Swal.getTimerLeft() / 1000);
                    }, 1000);
                }
            },
            onOpen: () => {
                // Step 9: server send cancel request to listener
                socket.on("server-send-cancel-request-call-to-listener", function (response) {
                    Swal.close();
                    clearInterval(timerInterval);
                });
            },
            onClose: () => {
                clearInterval(timerInterval);
            }
        }).then((result) => {
            return false;
        });
    });

    // Step 13: server send accept request to caller
    socket.on("server-send-accept-call-to-caller", function (response) {
        Swal.close();
        clearInterval(timerInterval);

        let getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);

        getUserMedia({video: true, audio: true}, function(stream) {
            // Show streaming modal
            $("#streamModal").modal("show");

            // Play my stream in local
            playVideoStream("local-stream", stream);

            // Call listener
            let call = peer.call(response.listenerPeerId, stream);
            
            // Listen & play listener stream
            call.on("stream", function(remoteStream) {
                // Play listener stream
                playVideoStream("remote-stream", remoteStream);
            });

            // Close modal: remove stream
            $("#streamModal").on("hidden.bs.modal", function () {
                closeVideoStream(stream);
                Swal.fire({
                    type: "info",
                    title: `Call ended &nbsp; <span style="color: #2ecc71;">${response.listenerName}</span>`,
                    backdrop: "rgba(85, 85, 85, 0.4)",
                    width: "52rem",
                    allowOutsideClick: false,
                    confirmButtonColor: "#2ECC71",
                    confirmButtonText: "Xác nhận"
                });
            });
          }, function(err) {
            console.log("Failed to get local stream" ,err.toString());
            if (err.toString() === "NotAllowedError: Permission denied") {
                alertify.notify("Please allow camera and microphone access", "error", 7);
            }
            if (err.toString() === "NotFoundError: Requested device not found") {
                alertify.notify("Can not find camera on this computer", "error", 7);
            }
          });
    });

    // Step 14: server send accept request to listener
    socket.on("server-send-accept-call-to-listener", function (response) {
        Swal.close();
        clearInterval(timerInterval);

        let getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);
        
        peer.on("call", function(call) {
            getUserMedia({video: true, audio: true}, function(stream) {
                // Show streaming modal
                $("#streamModal").modal("show");

                // Play my stream in local (listener)
                playVideoStream("local-stream", stream);

                call.answer(stream); // Answer the call with an A/V stream.

                call.on("stream", function(remoteStream) {
                    // Play caller stream
                    playVideoStream("remote-stream", remoteStream);
                });

                // Close modal: remove stream
                $("#streamModal").on("hidden.bs.modal", function () {
                    closeVideoStream(stream);
                    Swal.fire({
                        type: "info",
                        title: `Call ended &nbsp; <span style="color: #2ecc71;">${response.callerName}</span>`,
                        backdrop: "rgba(85, 85, 85, 0.4)",
                        width: "52rem",
                        allowOutsideClick: false,
                        confirmButtonColor: "#2ECC71",
                        confirmButtonText: "Xác nhận"
                    });
                });
            }, function(err) {
              console.log("Failed to get local stream" ,err.toString());
                if (err.toString() === "NotAllowedError: Permission denied") {
                    alertify.notify("Please allow camera and microphone access", "error", 7);
                }
                if (err.toString() === "NotFoundError: Requested device not found") {
                    alertify.notify("Can not find camera on this computer", "error", 7);
                }
            });
        });          
    });
});