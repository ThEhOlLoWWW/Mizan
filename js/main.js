import {
  fetchSpotPrices,
  fetchPriceHistory,
  networkLogs,
  clearNetworkLogs,
} from "./api.js";
import { DEFAULT_CURRENCY } from "./config.js";
import {
  calculateChangePct,
  validateWeight,
  convertOunceToGram,
  calculateJewelryValue,
} from "./calculator.js";
import {
  setStatus,
  setBusy,
  renderSkeleton,
  renderCards,
  formatTimestamp,
  renderEstimate,
  showWeightError,
  renderLogs,
} from "./ui.js";

const currencySelect = document.getElementById("currency-select");
const lastUpdated = document.getElementById("last-updated-text");
const cardsContainer = document.getElementById("cards-container");
const estimatorForm = document.getElementById("estimator-form");
const weightInput = document.getElementById("input-weight");
const metalSelect = document.getElementById("estimator-metal-select");
const puritySelect = document.getElementById("estimator-purity-select");

let currentSpot = null;

currencySelect.value = localStorage.getItem("currency") || DEFAULT_CURRENCY;

async function loadPrices() {
  setBusy(true);
  setStatus("loading", "Chargement des prix...");
  renderSkeleton(2);

  try {
    const spot = await fetchSpotPrices(currencySelect.value);
    currentSpot = spot;

    const [previous, last] = await fetchPriceHistory(2);
    const gold = spot.metals.find((metal) => metal.symbol === "XAU");
    gold.changePct = calculateChangePct(previous.c, last.c);

    renderCards(spot);
    if (weightInput.value === "") {
      renderEstimate(0, spot.currency);
    } else {
      updateEstimate();
    }
    lastUpdated.textContent = formatTimestamp(spot.updatedAt);
    setStatus(
      "success",
      spot.isStale ? "Attention : données non à jour." : "Prix à jour.",
    );
  } catch (error) {
    cardsContainer.replaceChildren();
    setStatus("error", error.message);
    currentSpot = null;
  } finally {
    setBusy(false);
    renderLogs(networkLogs);
  }
}

document.getElementById("btn-refresh").addEventListener("click", loadPrices);
document.getElementById("btn-retry").addEventListener("click", loadPrices);
currencySelect.addEventListener("change", () => {
  localStorage.setItem("currency", currencySelect.value);
  loadPrices();
});

function updateEstimate() {
  const error = validateWeight(weightInput.value);
  showWeightError(error || "");

  if (error || !currentSpot) {
    renderEstimate(0, currencySelect.value);
    return;
  }

  const metal = currentSpot.metals.find((m) => m.symbol === metalSelect.value);
  const gramPrice = convertOunceToGram(metal.pricePerOunce);
  const value = calculateJewelryValue(
    weightInput.value,
    gramPrice,
    puritySelect.value,
  );
  renderEstimate(value, currentSpot.currency);
}

function updatePurityOptions() {
  const options = [...puritySelect.options];
  options.forEach((option) => {
    option.disabled = option.dataset.metal !== metalSelect.value;
  });
  if (puritySelect.options[puritySelect.selectedIndex].disabled) {
    puritySelect.value = options.find((option) => !option.disabled).value;
  }
}

weightInput.addEventListener("input", updateEstimate);
puritySelect.addEventListener("change", updateEstimate);
metalSelect.addEventListener("change", () => {
  updatePurityOptions();
  updateEstimate();
});
estimatorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  updateEstimate();
});

updatePurityOptions();

document.getElementById("btn-clear-logs").addEventListener("click", () => {
  clearNetworkLogs();
  renderLogs(networkLogs);
});

loadPrices();
