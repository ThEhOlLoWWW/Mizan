export function setBanner(status, text) {
  const stat = document.getElementById("status");
  const statusText = document.getElementById("status-text");

  stat.dataset.state = status;
  statusText.textContent = text;
}

export function setBusyState(isBusy) {
  const datas = document.querySelectorAll("[data-busy]");
  datas.forEach((data) => {
    data.dataset.disabled = "isBusy";
  });
}

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
