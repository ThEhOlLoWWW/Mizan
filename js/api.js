import { API_BASE_URL } from "./config.js";

export const networkLogs = [];
const MAX_LOGS = 20;

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
  if (error?.name === "TimeoutError") {
    return "Le serveur met trop de temps à répondre. Réessayez dans un instant.";
  }
  return "Impossible de contacter le serveur. Vérifiez votre connexion.";
}

async function fetchWithLogging(endpoint) {
  const url = `${API_BASE_URL}${endpoint}`;
  const startTime = performance.now();
  let status = 0;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    status = response.status;

    if (!response.ok) {
      throw new Error(`HTTP ${status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(classifyError(error, status));
  } finally {
    networkLogs.unshift({
      method: "GET",
      url,
      status: status || "ERR",
      durationMs: Math.round(performance.now() - startTime),
      timestamp: new Date().toLocaleTimeString("fr-FR"),
    });
    networkLogs.length = Math.min(networkLogs.length, MAX_LOGS);
  }
}

function buildSpotData(raw) {
  return {
    currency: raw.xau.currency,
    updatedAt: raw.updated_at,
    isStale: raw.stale,
    metals: [
      { symbol: "XAU", pricePerOunce: raw.xau.price },
      { symbol: "XAG", pricePerOunce: raw.silver_usd_oz * raw.fx_rate },
    ],
  };
}

export async function fetchSpotPrices(currency = "MAD") {
  const raw = await fetchWithLogging(
    `/spot?currency=${encodeURIComponent(currency)}`,
  );
  return buildSpotData(raw);
}

export async function fetchPriceHistory(days = 7) {
  const raw = await fetchWithLogging("/history");
  return raw.points.slice(-days);
}
