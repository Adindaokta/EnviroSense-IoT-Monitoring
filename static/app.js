const $ = (id) => document.getElementById(id);
let climateChart, analogChart;
let toastTimer;
let tempThreshold = Number(localStorage.getItem("enviro_temp_threshold") || 35);
let humidityThreshold = Number(localStorage.getItem("enviro_humidity_threshold") || 80);

function formatTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "medium" });
}
function number(value, digits = 1) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString("id-ID", { maximumFractionDigits: digits }) : "--";
}
function showToast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}
function setConnection(online) {
  $("connection-pill").classList.toggle("online", online);
  $("connection-pill").classList.toggle("offline", !online);
  $("connection-text").textContent = online ? "Server terhubung" : "Server terputus";
  $("side-device-status").textContent = online ? "Terhubung ke backend" : "Tidak terhubung";
}
function getCondition(row) {
  const alerts = [];
  if (Number(row.temperature) >= tempThreshold) alerts.push("Suhu tinggi");
  if (Number(row.humidity) >= humidityThreshold) alerts.push("Kelembapan udara tinggi");
  return alerts;
}
function renderLatest(row) {
  $("temperature").textContent = number(row.temperature);
  $("humidity").textContent = number(row.humidity);
  $("light").textContent = number(row.light, 0);
  $("moisture").textContent = number(row.moisture, 0);
  $("last-update").textContent = "Pembaruan: " + formatTime(row.timestamp);

  const temp = Number(row.temperature);
  const hum = Number(row.humidity);
  $("temperature-note").textContent = temp >= tempThreshold ? `Melewati ambang ${number(tempThreshold)} °C` : "Dalam ambang suhu normal";
  $("humidity-note").textContent = hum >= humidityThreshold ? `Melewati ambang ${number(humidityThreshold)}%` : "Dalam ambang kelembapan normal";

  const alerts = getCondition(row);
  const banner = $("alert-banner");
  banner.classList.toggle("warning", alerts.length > 0);
  banner.classList.remove("offline");
  $("alert-title").textContent = alerts.length ? "Peringatan kondisi lingkungan" : "Kondisi lingkungan normal";
  $("alert-description").textContent = alerts.length ? alerts.join(" dan ") + ". Periksa kondisi lingkungan." : "Tidak ada parameter yang melewati ambang peringatan yang ditetapkan.";
  $("banner-icon").textContent = alerts.length ? "!" : "✓";
}
function renderHistory(rows) {
  const body = $("history-body");
  $("record-count").textContent = `${rows.length} data`;
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="6" class="empty-state">Belum ada data sensor.</td></tr>';
    return;
  }
  body.innerHTML = rows.slice(0, 12).map(row => {
    const alerts = getCondition(row);
    const status = alerts.length
      ? '<span class="status-chip warning">Perlu perhatian</span>'
      : '<span class="status-chip">Normal</span>';
    return `<tr>
      <td>${formatTime(row.timestamp)}</td>
      <td>${number(row.temperature)} °C</td>
      <td>${number(row.humidity)}%</td>
      <td>${number(row.light, 0)}</td>
      <td>${number(row.moisture, 0)}</td>
      <td>${status}</td>
    </tr>`;
  }).join("");
}
function chartOptions() {
  return {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 7, padding: 18, font: { family: "DM Sans", size: 10 } } } },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 7, color: "#98a3b3", font: { size: 9 } } },
      y: { beginAtZero: true, grid: { color: "#eef1f5" }, ticks: { color: "#98a3b3", font: { size: 9 } } }
    }
  };
}
function createCharts(rows) {
  const ordered = [...rows].reverse();
  const labels = ordered.map(r => {
    const d = new Date(r.timestamp);
    return Number.isNaN(d.getTime()) ? r.timestamp : d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  });
  const climateData = {
    labels,
    datasets: [
      { label: "Suhu (°C)", data: ordered.map(r => Number(r.temperature)), borderColor: "#ed8a5b", backgroundColor: "#ed8a5b18", tension: .35, pointRadius: 2, fill: false },
      { label: "Kelembapan (%)", data: ordered.map(r => Number(r.humidity)), borderColor: "#5389ed", backgroundColor: "#5389ed18", tension: .35, pointRadius: 2, fill: false }
    ]
  };
  const analogData = {
    labels,
    datasets: [
      { label: "Cahaya (ADC)", data: ordered.map(r => Number(r.light)), borderColor: "#e0aa3e", tension: .35, pointRadius: 2 },
      { label: "Tanah simulasi (ADC)", data: ordered.map(r => Number(r.moisture)), borderColor: "#35a77c", tension: .35, pointRadius: 2 }
    ]
  };
  if (!climateChart) {
    climateChart = new Chart($("climateChart"), { type: "line", data: climateData, options: chartOptions() });
    analogChart = new Chart($("analogChart"), { type: "line", data: analogData, options: chartOptions() });
  } else {
    climateChart.data = climateData; climateChart.update("none");
    analogChart.data = analogData; analogChart.update("none");
  }
}
async function loadDashboard(showMessage = false) {
  try {
    const [latestResponse, historyResponse] = await Promise.all([
      fetch("/api/latest", { cache: "no-store" }),
      fetch(`/api/history?limit=${$("chart-range").value}`, { cache: "no-store" })
    ]);
    if (!latestResponse.ok) throw new Error("Data terbaru belum tersedia");
    if (!historyResponse.ok) throw new Error("Riwayat data tidak dapat dibaca");
    const latest = await latestResponse.json();
    const history = await historyResponse.json();
    setConnection(true);
    renderLatest(latest);
    renderHistory(history);
    createCharts(history);
    if (showMessage) showToast("Data dashboard berhasil diperbarui.");
  } catch (error) {
    setConnection(false);
    $("alert-banner").classList.add("offline");
    $("alert-banner").classList.remove("warning");
    $("banner-icon").textContent = "!";
    $("alert-title").textContent = "Belum dapat terhubung ke data sensor";
    $("alert-description").textContent = "Pastikan backend Flask aktif dan ESP32 sudah mengirim data.";
    if (showMessage) showToast(error.message);
  }
}
function setupThresholdControls() {
  $("temp-threshold").value = tempThreshold;
  $("humidity-threshold").value = humidityThreshold;
  $("save-thresholds").addEventListener("click", () => {
    const t = Number($("temp-threshold").value);
    const h = Number($("humidity-threshold").value);
    if (!Number.isFinite(t) || t < -20 || t > 100 || !Number.isFinite(h) || h < 0 || h > 100) {
      showToast("Masukkan suhu -20–100 °C dan kelembapan 0–100%.");
      return;
    }
    tempThreshold = t;
    humidityThreshold = h;
    localStorage.setItem("enviro_temp_threshold", String(t));
    localStorage.setItem("enviro_humidity_threshold", String(h));
    showToast("Batas peringatan berhasil disimpan.");
    loadDashboard();
  });
}
setupThresholdControls();

$("refresh-btn").addEventListener("click", () => loadDashboard(true));
$("chart-range").addEventListener("change", () => loadDashboard());
loadDashboard();
setInterval(() => loadDashboard(), 5000);
