import { TRACKED_METALS } from "./config.js";
import { convertOunceToGram } from "./calculator.js";

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

const fmt = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function createAmountElement(value, currency) {
  const p = document.createElement("p");
  p.className = "amount";
  p.textContent = `${fmt.format(value)} `;

  const span = document.createElement("span");
  span.className = "unit";
  span.textContent = `${currency}/g`;

  p.appendChild(span);

  return p;
}

export function createChangeElement(changePct) {
  const p = document.createElement("p");
  const trend = changePct > 0 ? "up" : changePct < 0 ? "down" : "flat";
  p.className = `change ${trend}`;
  p.textContent = `${changePct > 0 ? "+" : ""}${fmt.format(changePct)} % (24h)`;

  return p;
}

export function renderCards(spotData) {
  const cards = document.getElementById("cards");
  cards.replaceChildren();
  TRACKED_METALS.forEach((metal) => {
    const metalData = spotData.prices[metal.symbol];
    const gramPrice = convertOunceToGram(metalData.ounce);

    const article = document.createElement("article");
    article.className = `price ${metal.symbol.toLowerCase()}`;

    const coin = document.createElement("div");
    coin.className = "coin";
    coin.textContent = metal.symbol === "XAU" ? "Au" : "Ag";

    const info = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = `${metal.name} (${metal.symbol})`;

    const amount = createAmountElement(gramPrice, spotData.currency);
    const change = createChangeElement(metalData.change_24h);

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = `${fmt.format(metalData.ounce)} ${spotData.currency} / oz`;

    info.append(title, amount, change, meta);
    article.append(coin, info);
    cards.appendChild(article);
  });
}

export function formatTimestamp(isoString) {
  const date = isoString ? new Date(isoString) : new Date();
  const validDate = Number.isNaN(date.getTime()) ? new Date() : date;
  return `Mis à jour à ${validDate.toLocaleTimeString("fr-FR")}`;
}
