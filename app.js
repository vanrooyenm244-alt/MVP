const form = document.getElementById("chatForm");
const input = document.getElementById("message");
const conversation = document.getElementById("conversation");
const status = document.getElementById("status");
const feedback = document.getElementById("feedback");

let lastIntervention = null;

console.log("Perspective Engine app.js loaded");

if (!form) {
  console.error("ERROR: chatForm not found");
  status.textContent = "ERROR: The chat form was not found.";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();

  if (!message) {
    status.textContent = "Please tell me what's going on first.";
    return;
  }

  addUser(message);

  input.value = "";
  status.textContent = "Thinking...";
  feedback.classList.add("hidden");

  try {
    console.log("Sending request to /api/chat");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message
      })
    });

    console.log("Server response:", response.status);

    const text = await response.text();

    console.log("Server returned:", text);

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        "Server returned something that is not valid JSON: " + text
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error || `Server error: HTTP ${response.status}`
      );
    }

    addEngine(data);

    lastIntervention = data.intervention;
    feedback.classList.remove("hidden");

    status.textContent = "";

  } catch (error) {

    console.error("Perspective Engine error:", error);

    status.textContent =
      "ERROR: " + error.message;
  }
});

function addUser(text) {
  const element = document.createElement("div");

  element.className = "bubble user";

  element.textContent = text;

  conversation.appendChild(element);

  element.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

function addEngine(data) {
  const element = document.createElement("div");

  element.className = "bubble engine";

  element.innerHTML = `
    <h3>${escapeHtml(data.intervention || "Perspective")}</h3>

    <div class="response">
      ${escapeHtml(data.response || "")}
    </div>

    <div class="next">
      Next: ${escapeHtml(data.next_step || "")}
    </div>
  `;

  conversation.appendChild(element);

  element.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

document.querySelectorAll("#feedback button").forEach((button) => {

  button.addEventListener("click", async () => {

    const rating = button.dataset.rating;

    try {

      await fetch("/api/feedback", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          intervention: lastIntervention,
          rating: rating
        })
      });

      feedback.innerHTML =
        "<span>Thanks. That feedback will shape the next version.</span>";

    } catch (error) {

      console.error("Feedback error:", error);

    }
  });

});

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}  });
}

document.querySelectorAll("#feedback button").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const rating = btn.dataset.rating;

    await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        intervention: lastIntervention,
        rating
      })
    });

    feedback.innerHTML =
      "<span>Thanks. That feedback will shape the next version.</span>";
  });
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
    }
