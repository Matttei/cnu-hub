let chatInput;
let sendChat;
let chatMessages;
let chatOptions;
let chatStarted = false;
let currentStep = 0;
let aiMode = false;
let conversation = [];
let sessionId =  null;
const chatData = {
    name: "",
    email: "",
    category: "",
    content: "",
    category: "",
    important: true,
};
document.addEventListener("DOMContentLoaded", function(){
    chatInput = document.getElementById("chat-input");
    sendChat = document.getElementById("send-btn");
    sendChat.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", function(e){
        if(e.key == "Enter"){
            e.preventDefault();
            sendMessage();
        }
    });
    chatMessages = document.getElementById("chat-messages");
    chatOptions = document.getElementById("chat-options");

});
function sendMessage(){
    const message = chatInput.value.trim();
    if (message.length == 0){
        return;
    }
    addUserMessage(message);
    chatInput.value = "";
    if (aiMode){
        conversation.push({
            role: "user",
            content: message
        });
        sendConversation();
        return;
    }
    console.log(message);
    switch(currentStep){

        case 0:
            chatData.name = message;
            currentStep = 1;

            addBotMessage(`Încântat de cunoștință! 😊`);
            setTimeout(() =>{
                addBotMessage("Care este adresa ta de email?");
            }, 800);
            break;

        case 1:
            chatData.email = message;
            currentStep = 2;

            showCategories();
            break;

        case 3:
            chatData.content = message;

            sendToServer();

            break;
    }
}
function closeChat() {
    const menu = document.getElementById('chatbot-menu');
    if (menu) {
        menu.classList.remove('show');
        setTimeout(() => {
            menu.classList.add('hidden');
        }, 200);
    }
}
function togglechat(){
    const chatmenu = document.getElementById("chatbot-menu");

    if(!chatmenu) return;
    if(!chatStarted){
        startChat();
        chatStarted = true;
    }
    if(chatmenu.classList.contains('hidden')){
        chatmenu.classList.remove('hidden');
        setTimeout(() =>{
            chatmenu.classList.add('show');
        }, 10);
    }
    else{
        chatmenu.classList.remove("show");
        setTimeout(() =>{
            chatmenu.classList.add("hidden");
        }, 200);
    }
}
function startChat(){
    addBotMessage("👋 Bună! Sunt asistentul AI al Colegiului Național „Unirea”.");
    setTimeout(() =>{
        addBotMessage("Te pot ajuta cu informații despre admitere, burse, examene, cereri și alte aspecte legate de activitatea colegiului.");
    }, 1200);
    setTimeout(() =>{
        addBotMessage("Înainte să începem, am nevoie de câteva informații pentru a-ți putea oferi asistență cât mai eficientă.");
    }, 1600);
    setTimeout(() =>{
        addBotMessage("Cum te numești?");
    }, 2000);
}
function addBotMessage(text){
    const message = document.createElement("div");
    message.classList.add("chat-message", "bot-message");

    message.innerHTML = `
        <img src="${CHATBOT_ICON}"
            class="chat-bot-logo img-fluid"
            alt="AI"
            style="height: 32px; width: 32px;"
            >
             

        <div class="message-content">
            ${text}
        </div>
    `;

    chatMessages.appendChild(message);
    scrollToBottom();
}
function showCategories(){

    addBotMessage("Alege categoria solicitării:");

    const categories = [
        ["basic_info", "📚 General"],
        ["admitere", "🎓 Admitere"],
        ["examen", "📝 Examene"],
        ["burse", "💰 Burse"],
        ["cereri-tip", "📄 Cereri"],
        ["others", "❓ Altă problemă"]
    ];

    chatOptions.innerHTML = "";

    categories.forEach(([value, text]) => {

        const btn = document.createElement("button");

        btn.classList.add("chat-option", "btn");
        btn.textContent = text;

        btn.onclick = function(){

            chatData.category = value;

            addUserMessage(text);

            chatOptions.innerHTML = "";

            currentStep = 3;

            addBotMessage("Descrie problema cât mai detaliat.");

        }

        chatOptions.appendChild(btn);

    });

}
function sendToServer(){
    console.log(chatData);
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    conversation.push({
        role: "user",
        content: chatData.content
    });
    fetch("/chatbot/", {
        method: "POST",
        headers:{
            "Content-Type":"application/json",
            "X-CSRFToken": csrfToken // CSRF la inceput
        },
        body: JSON.stringify(chatData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        sessionId = data.session_id;
        addBotMessage("Solicitarea ta a fost înregistrată.");
        aiMode = true;
        addBotMessage(data.response);
        conversation.push({
            role: "assistant",
            content: data.response
        });
    })
    .catch(err =>{
        showMessage(`Problema: ${err}`);
    })
}
function addUserMessage(text){
    const message = document.createElement("div");
    message.classList.add("chat-message", "user-message");
    message.innerHTML = `
        <div class="message-content">
            ${text}
        </div>
    `;
    chatMessages.appendChild(message);
    scrollToBottom();
}
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
function sendConversation(){

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const lastMessage = conversation[conversation.length - 1].content;
    fetch("/chatbot/message/",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "X-CSRFToken":csrfToken
        },
        body: JSON.stringify({
            content: conversation,
            message: lastMessage,
            name: chatData.name,
            email: chatData.email,
            category: chatData.category,
            session_id: sessionId,
        })
    })
    .then(r=>r.json())
    .then(data=>{

        addBotMessage(data.response);

        conversation.push({
            role:"assistant",
            content:data.response
        });
        
    })
    .catch(err=>{
        showMessage(err);
    });

}