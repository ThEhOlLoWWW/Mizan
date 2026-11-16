import { fetchSpotPrices, fetchPriceHistory } from "./api.js";
import { calculateChangePct } from "./calculator.js";
import {
  setStatus,
  setBusy,
  renderSkeleton,
  renderCards,
  formatTimestamp,
} from "./ui.js";

const currencySelect = document.getElementById("currency-select");
const lastUpdated = document.getElementById("last-updated-text");
const cardsContainer = document.getElementById("cards-container");

async function loadPrices() {
  setBusy(true);
  setStatus("loading", "Chargement des prix...");
  renderSkeleton(2);

  try {
    const spot = await fetchSpotPrices(currencySelect.value);

    const [previous, last] = await fetchPriceHistory(2);
    const gold = spot.metals.find((metal) => metal.symbol === "XAU");
    gold.changePct = calculateChangePct(previous.c, last.c);

    renderCards(spot);
    lastUpdated.textContent = formatTimestamp(spot.updatedAt);
    setStatus(
      "success",
      spot.isStale ? "Attention : données non à jour." : "Prix à jour.",
    );
  } catch (error) {
    cardsContainer.replaceChildren();
    setStatus("error", error.message);
  } finally {
    setBusy(false);
  }
}

document.getElementById("btn-refresh").addEventListener("click", loadPrices);
document.getElementById("btn-retry").addEventListener("click", loadPrices);
currencySelect.addEventListener("change", loadPrices);

loadPrices();
