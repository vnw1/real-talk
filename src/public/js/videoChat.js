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

$(document).ready(function () {
    // Step 2: show error message if listener is offline
    socket.on("server-send-listener-is-offline", function () {
       alertify.notify("This user is currently offline", "error", 7); 
    });

    let getPeerId = "";
    const peer = new Peer();
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

        let timerInterval;
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
                Swal.showLoading();
                timerInterval = setInterval(() => {
                    Swal.getContent().querySelector("strong").textContent = Math.ceil(Swal.getTimerLeft() / 1000);
                }, 1000);
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

                // Step 13: server send accept request to caller
                socket.on("server-send-accept-call-to-caller", function (response) {
                    Swal.close();
                    clearInterval(timerInterval);
                    console.log("caller ok");
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

        let timerInterval;
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

                Swal.showLoading();
                timerInterval = setInterval(() => {
                    Swal.getContent().querySelector("strong").textContent = Math.ceil(Swal.getTimerLeft() / 1000);
                }, 1000);
            },
            onOpen: () => {
                // Step 9: server send cancel request to listener
                socket.on("server-send-cancel-request-call-to-listener", function (response) {
                    Swal.close();
                    clearInterval(timerInterval);
                });

                // Step 14: server send accept request to listener
                socket.on("server-send-accept-call-to-listener", function (response) {
                    Swal.close();
                    clearInterval(timerInterval);
                    console.log("listener ok");
                });
            },
            onClose: () => {
                clearInterval(timerInterval);
            }
        }).then((result) => {
            return false;
        });
    });
});