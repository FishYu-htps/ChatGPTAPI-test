// 表单的提交按钮
const submitButton = document.querySelector("button");
// 表单的 model 和 prompt 字段
const modelInput = document.querySelector("#model");
const promptInput = document.querySelector("#prompt");
// 图片展示区域
const imageContainer = document.querySelector("#image-container");
const messageContainer =document.querySelector("#message-container");
const image = document.querySelector("#image");
//聊天紀錄顯示
function getChatMessages() {
  // 使用 Fetch API 从后端获取数据
  fetch('/api/getChatMessages')
    .then(response => response.json())
    .then(data => {
      displayChatMessages(data);
      // 等待新数据并再次请求
      getChatMessages();
    })
    .catch(error => console.error('Failed to get chat messages:', error));
}
function displayChatMessages(messages) {
  const chatContainer = document.getElementById('chat-container');
  chatContainer.innerHTML = ''; // 清空之前的聊天记录
  messages.forEach(function(message) {
    const chatMessage = document.createElement('div');
    chatMessage.className = 'chat-message';
    chatMessage.innerHTML = `
      <span class="user_name">${message.user_name}</span>
      <span class="message">${message.message}</span>
      <span class="time">${message.timestamp}</span>
	  <br />
	  <br />
    `;
    chatContainer.appendChild(chatMessage);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // 首次获取聊天记录
  getChatMessages();
});

// 绑定表单提交事件
submitButton.addEventListener("click", async (event) => {
    event.preventDefault(); // 阻止表单的默认提交行为

    // 获取用户输入的 model 和 prompt
    //const model = modelInput.value;
    const prompt = promptInput.value;

	const messageElement1 = document.createElement("p");
	messageElement1.textContent = "User: "+prompt;
    messageContainer.appendChild(messageElement1);

    // 调用 API 生成图片
    //const response = await fetch("/api/generate-image", {
    //    method: "POST",
    //    headers: {
    //        "Content-Type": "application/json",
    //    },
    //    body: JSON.stringify({ model, prompt }),
    //});
    //const data = await response.json();
	
	

    // 将生成的图片展示在页面上
    //imageContainer.style.display = "block";
    //image.src = data.url;
	
	const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
    });
	const message = await response.json();
	

	
	
	const messageElement = document.createElement("p");
	messageElement.textContent ="BOT: "+ message.content;
    messageContainer.appendChild(messageElement);
	
	
});