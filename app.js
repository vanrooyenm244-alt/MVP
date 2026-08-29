const form = document.querySelector("#chatForm");
const input = document.querySelector("#message");
const conversation = document.querySelector("#conversation");
const status = document.querySelector("#status");
const feedback = document.querySelector("#feedback");

let lastIntervention = null;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  addUser(message);
  input.value = "";
  status.textContent = "Thinking…";
  feedback.classList.add("hidden");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    addEngine(data);
    lastIntervention = data.intervention;
    feedback.classList.remove("hidden");

  } catch (err) {
    status.textContent = err.message;
  } finally {
    if (status.textContent === "Thinking…") {
      status.textContent = "";
    }
  }
});

function addUser(text) {
  const el = document.createElement("div");
  el.className = "bubble user";
  el.textContent = text;

  conversation.appendChild(el);

  el.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

function addEngine(data) {
  const el = document.createElement("div");
  el.className = "bubble engine";

  el.innerHTML = `
    <h3>${escapeHtml(data.intervention || "Perspective")}</h3>
    <div class="response">${escapeHtml(data.response || "")}</div>
    <div class="next">Next: ${escapeHtml(data.next_step || "")}</div>
  `;

  conversation.appendChild(el);

  el.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
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
