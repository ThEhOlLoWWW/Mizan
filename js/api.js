import { API_BASE_URL } from "./config.js";

export const networkLogs = [];

export function clearNetworkLogs() {
  networkLogs.length = 0;
}

export function classifyError(error, status = 0) {
  if (!navigator.onLine) {
    return "Vous êtes hors-ligne. Vérifiez votre connexion Internet.";
  }
  if (status === 429) {
    return "Quota dépassé (429) : trop de requêtes. Veuillez patienter une minute.";
  }
  if (status >= 400 && status < 500) {
    return `Erreur requête (${status}) : ressource ou paramètre invalide.`;
  }
  if (status >= 500) {
    return `Erreur serveur (${status}) : le service XAUS est temporairement indisponible.`;
  }
  if (error instanceof SyntaxError) {
    return "Erreur de format : la réponse du serveur n'est pas un JSON valide.";
  }
  return "Impossible de contacter le serveur. Vérifiez votre connexion.";
}

async function fetchWithLogging(endpoint) {
  const url = `${API_BASE_URL}${endpoint}`;
  const startTime = performance.now();
  let status = 0;

  try {
    const response = await fetch(url);
    status = response.status;

    if (!response.ok) {
      throw new Error(`HTTP ${status}`);
    }
    const data = await response.json();

    const durationMs = Math.round(performance.now() - startTime);
    networkLogs.unshift({
      method: "GET",
      url,
      status,
      durationMs,
      timestamp: new Date().toLocaleTimeString("fr-FR"),
    });
    return data;
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);
    networkLogs.unshift({
      method: "GET",
      url,
      status: status || "ERR",
      durationMs,
      timestamp: new Date().toLocaleTimeString("fr-FR"),
    });
    const userMessage = classifyError(error, status);
    throw new Error(userMessage);
  }
}

export async function fetchSpotPrices(currency = "MAD") {
  return await fetchWithLogging(
    `/spot?currency=${encodeURIComponent(currency)}`,
  );
}
export async function fetchPriceHistory() {
  return await fetchWithLogging("/history");
}
