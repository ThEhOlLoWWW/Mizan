export function setStatus(state, message) {
  const stat = document.getElementById("status");
  const statText = document.getElementById("status-text");
  const retry = document.getElementById("retry");

  stat.dataset.state = state;
  statText.textContent = message;
  retry.hidden = state !== "error";
}

export function setBusy(isBusy) {
  const elements = document.querySelectorAll("[data-busy]");
  elements.forEach((el) => {
    el.disabled = isBusy;
  });
}

export function renderSkeleton(count = 2) {
  const cards = document.getElementById("cards");
  cards.replaceChildren();
  for (let i = 0; i < count; i++) {
    const card = document.createElement("article");
    card.className = "price skeleton";
    card.setAttribute("aria-hidden", "true");
    cards.appendChild(card);
  }
}
