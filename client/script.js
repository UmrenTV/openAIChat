import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const isDev = false;
const fetchLink = isDev
  ? "http://localhost:5000"
  : "https://openaichatserver.onrender.com";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat-container");

let loadInterval;

const hardcodedMessages = [
  { prompt: "whozurdaddy", response: "I am THE Daddy!" },
  { prompt: "whozurmommy", response: "Ollie is THE Mommy!" },
  { prompt: "whozurgod", response: "Umren is THE God!" },
];
const randomDelayForHardcodedMessage = Math.floor(Math.random() * 1000) + 1000;

function loader(element) {
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
  <div class="wrapper ${isAi && "ai"}">
    <div class="chat">
      <div class="profile">
        <img src="${isAi ? bot : user}" alt="${isAi ? "bot" : "user"}" />
      </div>
      <div class="message" id=${uniqueId}>${value}</div>
    </div>
  </div>
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  // user's chatStripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  // bot's chatStripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);
  const newPrompt = data.get("prompt").trim();

  // hardcoded messages
  let isThereAHardcodedMessage = false;
  for (let i = 0; i < hardcodedMessages.length; i++) {
    if (newPrompt === hardcodedMessages[i].prompt) {
      isThereAHardcodedMessage = true;
      setTimeout(() => {
        clearInterval(loadInterval);
        messageDiv.innerHTML = "";
        typeText(messageDiv, hardcodedMessages[i].response);
      }, randomDelayForHardcodedMessage);
    }
  }

  // fetch data from server
  if (!isThereAHardcodedMessage) {
    const response = await fetch(fetchLink, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: data.get("prompt"),
      }),
    });
    clearInterval(loadInterval);
    messageDiv.innerHTML = "";

    if (response.ok) {
      const data = await response.json();
      const parsedData = data.bot.trim();

      typeText(messageDiv, parsedData);
    } else {
      const err = await response.text();

      messageDiv.innerHTML = "Something went wrong. Please try again later.";

      alert(err);
    }
  }
};

form.addEventListener("submit", handleSubmit);

// handle enter key, but only if there is a prompt in the textarea

form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13 && form.elements.prompt.value.trim().length > 0) {
    handleSubmit(e);
  } else if (e.keyCode === 13) {
    form.elements.prompt.value = "";
  }
});

// form.addEventListener("keyup", (e) => { if (e.keyCode === 13 && chatContainer.innerHTML.length > 0) {
//     handleSubmit(e);
//   } else {
//     chatContainer.innerHTML = "";
//   }
// });
