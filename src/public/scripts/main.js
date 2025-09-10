const API_BASE = "http://localhost:3000";

async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();

  if (!message) return;

  addMessageToChat("user", message);
  input.value = "";
  showLoading();

  try {
    const response = await fetch(`${API_BASE}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: message }),
    });

    const data = await response.json();
    addMessageToChat("ai", data.response);
  } catch (error) {
    addMessageToChat(
      "ai",
      "Sorry, I encountered an error. Please make sure the server is running."
    );
    console.error("Error:", error);
  } finally {
    hideLoading();
  }
}

function quickQuestion(question) {
  document.getElementById("userInput").value = question;
  sendMessage();
}

function addMessageToChat(sender, message) {
  const chatContainer = document.getElementById("chatContainer");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}-message`;

  const senderLabel = sender === "user" ? "You" : "AI Assistant";
  messageDiv.innerHTML = `<strong>${senderLabel}:</strong> ${message}`;

  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showLoading() {
  document.getElementById("loading").style.display = "block";
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

async function loadRules() {
  const rulesDisplay = document.getElementById("rulesDisplay");
  rulesDisplay.textContent = "Loading rules from Neo4j...";

  try {
    const response = await fetch(`${API_BASE}/rules`);
    const data = await response.json();
    rulesDisplay.textContent = data.rules;
  } catch (error) {
    rulesDisplay.textContent =
      "Error loading rules. Please make sure the server is running.";
    console.error("Error:", error);
  }
}

async function addNewChoice() {
  const name = document.getElementById("newChoiceName").value.trim();
  const defeats1 = document.getElementById("defeats1").value.trim();
  const defeats2 = document.getElementById("defeats2").value.trim();
  const reason1 = document.getElementById("reason1").value.trim();
  const reason2 = document.getElementById("reason2").value.trim();

  if (!name || !defeats1 || !defeats2 || !reason1 || !reason2) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/add-choice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        defeats: [defeats1, defeats2],
        reasons: [reason1, reason2],
      }),
    });

    const data = await response.json();
    alert(`Success! ${name} has been added to the game.`);

    // Clear form
    document.getElementById("newChoiceName").value = "";
    document.getElementById("defeats1").value = "";
    document.getElementById("defeats2").value = "";
    document.getElementById("reason1").value = "";
    document.getElementById("reason2").value = "";

    // Refresh rules display
    loadRules();
  } catch (error) {
    alert("Error adding new choice. Please check the server.");
    console.error("Error:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Allow Enter key to send messages
  document
    .getElementById("userInput")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        sendMessage();
      }
    });

  // Load initial rules
  setTimeout(loadRules, 1000);
});
