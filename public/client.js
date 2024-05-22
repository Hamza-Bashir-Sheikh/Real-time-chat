const socket = io();
let name;
let textarea = document.querySelector("#textarea");
let sendButton = document.querySelector("#sendButton");
let attachButton = document.querySelector("#attachButton");
let fileInput = document.querySelector("#fileInput");
let emojiButton = document.querySelector("#emojiButton");
let messageArea = document.querySelector(".message__area");

do {
    name = prompt("Please enter your name: ");
} while (!name);

textarea.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        sendMessage(e.target.value);
    }
});

sendButton.addEventListener("click", () => {
    sendMessage(textarea.value);
});

attachButton.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    let file = fileInput.files[0];
    if (file) {
        sendFile(file);
    }
});

// Initialize Emoji Button
const picker = new EmojiButton();
emojiButton.addEventListener("click", () => {
    picker.togglePicker(emojiButton);
});

picker.on("emoji", emoji => {
    textarea.value += emoji;
});

function sendMessage(message) {
    let msg = {
        user: name,
        message: message.trim(),
    };

    // Append
    appendMessage(msg, "outgoing");
    textarea.value = "";
    scrollToBottom();

    // Send to server
    socket.emit("message", msg);
}

function sendFile(file) {
    let reader = new FileReader();
    reader.onload = function (e) {
        let msg = {
            user: name,
            file: e.target.result,
            fileName: file.name
        };

        // Append
        appendFileMessage(msg, "outgoing");
        scrollToBottom();

        // Send to server
        socket.emit("file", msg);
    };
    reader.readAsDataURL(file);
}

function appendMessage(msg, type) {
    let mainDiv = document.createElement("div");
    let className = type;
    mainDiv.classList.add(className, "message");

    let markup = `
        <h4>${msg.user}</h4>
        <p>${msg.message}</p>
    `;
    mainDiv.innerHTML = markup;
    messageArea.appendChild(mainDiv);
}

function appendFileMessage(msg, type) {
    let mainDiv = document.createElement("div");
    let className = type;
    mainDiv.classList.add(className, "message");

    let markup = `
        <h4>${msg.user}</h4>
        <p><a href="${msg.file}" download="${msg.fileName}">${msg.fileName}</a></p>
    `;
    mainDiv.innerHTML = markup;
    messageArea.appendChild(mainDiv);
}

socket.on("message", (msg) => {
    appendMessage(msg, "incoming");
    scrollToBottom();
});

socket.on("file", (msg) => {
    appendFileMessage(msg, "incoming");
    scrollToBottom();
});

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight;
}
