const peer = new Peer(
    `${Math.floor(Math.random() * 2 ** 18)
        .toString(36)
        .padStart(4, 0)}`,
    {
        host: location.hostname,
        debug: 1,
        path: "/myapp",
    },
);

window.peer = peer;

/* global Peer */

/**
 * Gets the local audio stream of the current caller
 * @param callbacks - an object to set the success/error behavior
 * @returns {void}
 */

function getLocalStream() {
    navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
            window.localStream = stream; // A
            window.localAudio.srcObject = stream; // B
            window.localAudio.autoplay = true; // C
        })
        .catch((err) => {
            console.error(`you got an error: ${err}`);
        });
}

getLocalStream();

peer.on("open", () => {
    window.caststatus.textContent = `Your device ID is: ${peer.id}`;
});

const audioContainer = document.querySelector(".call-container");

// Displays the call button and peer ID
function showCallContent() {
    window.caststatus.textContent = `Your device ID is: ${peer.id}`;
    callBtn.hidden = false;
    audioContainer.hidden = true;
}

// Displays the audio controls and correct copy
function showConnectedContent() {
    window.caststatus.textContent = "You're connected";
    callBtn.hidden = true;
    audioContainer.hidden = false;
}

let code;
function getStreamCode() {
    code = window.prompt("Please enter the sharing code");
}

let conn;
function connectPeers() {
    conn = peer.connect(code);
}

peer.on("connection", (connection) => {
    conn = connection;
});

const callBtn = document.querySelector(".call-btn");

callBtn.addEventListener("click", () => {
    getStreamCode();
    connectPeers();
    console.log('window.localStream',window.localStream)
    const call = peer.call(code, window.localStream); // A
    console.log('call',call)

    call.on("stream", (stream) => {
        console.log('stream',stream)
        // B
        window.remoteAudio.srcObject = stream; // C
        window.remoteAudio.autoplay = true; // D
        window.peerStream = stream; //E
        showConnectedContent(); //F    });
    });
});

peer.on("call", (call) => {
    const answerCall = confirm("Do you want to answer?");

    if (answerCall) {
        call.answer(window.localStream); // A
        showConnectedContent(); // B
        call.on("stream", (stream) => {
            // C
            window.remoteAudio.srcObject = stream;
            window.remoteAudio.autoplay = true;
            window.peerStream = stream;
        });
    } else {
        console.log("call denied"); // D
    }
});

const hangUpBtn = document.querySelector(".hangup-btn");
hangUpBtn.addEventListener("click", () => {
    conn.close();
    showCallContent();
});

conn.on("close", () => {
    showCallContent();
});
