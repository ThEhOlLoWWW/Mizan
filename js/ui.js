import { convertOunceToGram } from "./calculator.js";
import { METAL_NAMES } from "./config.js";

export function setStatus(state, message = "") {
  const banner = document.getElementById("status-banner");
  const text = document.getElementById("status-message");
  const retry = document.getElementById("btn-retry");

  banner.dataset.state = state;
  banner.classList.remove("hidden");
  text.textContent = message;
  retry.classList.toggle("hidden", state !== "error");
}

export function setBusy(isBusy) {
  const elements = document.querySelectorAll("[data-busy]");
  elements.forEach((el) => {
    el.disabled = isBusy;
  });
}

export function renderSkeleton(count = 2) {
  const cards = document.getElementById("cards-container");
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

export function createChangeElement(changePct, changeValue, currency) {
  const p = document.createElement("p");

  if (changePct === undefined) {
    p.className = "change flat";
    p.textContent = "Variation indisponible";
    return p;
  }

  const trend = changePct > 0 ? "up" : changePct < 0 ? "down" : "flat";
  const arrow = changePct > 0 ? "▲" : changePct < 0 ? "▼" : "–";
  const sign = changePct > 0 ? "+" : "";

  p.className = `change ${trend}`;
  p.textContent = `${arrow} ${sign}${fmt.format(changeValue)} ${currency}/g (${sign}${fmt.format(changePct)} %)`;
  return p;
}

export function renderCards(spotData) {
  const cards = document.getElementById("cards-container");
  cards.replaceChildren();

  spotData.metals.forEach((metal) => {
    const name = METAL_NAMES[metal.symbol] || metal.symbol;
    const gramPrice = convertOunceToGram(metal.pricePerOunce);
    const changeValue = (gramPrice * metal.changePct) / (100 + metal.changePct);

    const article = document.createElement("article");
    article.className = `price ${metal.symbol.toLowerCase()}`;

    const coin = document.createElement("div");
    coin.className = "coin";
    coin.textContent = metal.symbol;

    const info = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = `${name} (${metal.symbol})`;

    const amount = createAmountElement(gramPrice, spotData.currency);
    const change = createChangeElement(
      metal.changePct,
      changeValue,
      spotData.currency,
    );

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = `${fmt.format(metal.pricePerOunce)} ${spotData.currency} / oz`;

    info.append(title, amount, change, meta);
    article.append(coin, info);
    cards.appendChild(article);
  });
}

export function formatTimestamp(isoString) {
  const date = new Date(isoString);
  if (!isoString || Number.isNaN(date.getTime())) {
    return "Dernière mise à jour : inconnue";
  }
  return `Mis à jour le ${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR")}`;
}

export function populateSelect(selectEl, items) {
  selectEl.replaceChildren();

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.label;
    selectEl.appendChild(option);
  });
}
