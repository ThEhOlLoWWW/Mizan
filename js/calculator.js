export const TROY_OUNCE_IN_GRAMS = 31.1034768;

export function validateWeight(value) {
  if (value === "" || value === null || value === undefined) {
    return "Veuillez saisir un poids en grammes.";
  }
  const weight = Number(value);

  if (Number.isNaN(weight)) {
    return "Veuillez saisir un nombre valide.";
  }

  if (weight <= 0) {
    return "Veuillez saisir un poids positif.";
  }

  return null;
}

export function convertOunceToGram(pricePerOunce) {
  const price = Number(pricePerOunce);
  if (Number.isNaN(price) || price <= 0) {
    return 0;
  }
  return price / TROY_OUNCE_IN_GRAMS;
}

export function calculateJewelryValue(
  weightInGrams,
  pricePerGram,
  purityRatio = 1,
) {
  const weight = Number(weightInGrams);
  const price = Number(pricePerGram);
  const purity = Number(purityRatio);

  if (
    weight <= 0 ||
    price <= 0 ||
    purity <= 0 ||
    Number.isNaN(weight) ||
    Number.isNaN(price) ||
    Number.isNaN(purity)
  ) {
    return 0;
  }

  const total = weight * price * purity;
  return Math.round(total * 100) / 100;
}
