// --- KONFIGURASI ---
const DEFAULT_CHECK_INTERVAL_S = 30; // Default 30 detik
const LOCAL_STORAGE_KEY = 'hostMonitorData_v5'; // Versi baru untuk data
const CHART_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6', '#d946ef', '#14b8a6', '#64748b', '#eab308', '#06b6d4'];

// --- ELEMEN DOM ---
const hostInput = document.getElementById('hostInput');
const addHostBtn = document.getElementById('addHostBtn');
const hostListContainer = document.getElementById('hostList');
const chartContainer = document.getElementById('chartContainer');
const chartPlaceholder = document.getElementById('chartPlaceholder');
const webhookGeneralInput = document.getElementById('webhookGeneral');
const webhookIssuesInput = document.getElementById('webhookIssues');
const webhookReportInput = document.getElementById('webhookReport');
const enableReportToggle = document.getElementById('enableReportToggle');
const saveWebhooksBtn = document.getElementById('saveWebhooksBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importInput = document.getElementById('importInput');
const intervalInput = document.getElementById('intervalInput');
const applyIntervalBtn = document.getElementById('applyIntervalBtn');
const currentIntervalDisplay = document.getElementById('currentIntervalDisplay');
const timeFilterButtons = document.querySelectorAll('.time-filter-btn');
const discordSettingsHeader = document.getElementById('discordSettingsHeader');
const discordSettingsContent = document.getElementById('discordSettingsContent');
const discordChevron = document.getElementById('discordChevron');

// --- MANAJEMEN STATE ---
let appData = {
    hosts: {}, 
    history: {}, 
    webhooks: { general: '', issues: '', report: '' },
    settings: { 
        checkIntervalS: DEFAULT_CHECK_INTERVAL_S,
        enableReport: false
    }
};
let chart = null;
let monitoringInterval;
let currentTimeFilter = '24h';

// --- INISIALISASI ---
function main() {
    loadDataFromLocalStorage();
    setupListeners();
    renderHostList();
    renderChart();
    startMonitoring();
}

function setupListeners() {
    addHostBtn.addEventListener('click', addHost);
    hostInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') addHost();
    });

    saveWebhooksBtn.addEventListener('click', saveSettings);
    exportBtn.addEventListener('click', exportData);
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', importData);

    applyIntervalBtn.addEventListener('click', applyIntervalChange);

    timeFilterButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentTimeFilter = button.dataset.filter;
            timeFilterButtons.forEach(btn => btn.classList.remove('bg-blue-600', 'text-white'));
            button.classList.add('bg-blue-600', 'text-white');
            renderChart();
        });
    });
    
    discordSettingsHeader.addEventListener('click', () => {
        discordSettingsContent.classList.toggle('hidden');
        discordChevron.classList.toggle('rotate-180');
    });
}

// --- MANAJEMEN DATA LOKAL ---
function saveDataToLocalStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
}

function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            appData = {
                ...appData,
                ...parsedData,
                webhooks: { ...appData.webhooks, ...parsedData.webhooks },
                settings: { ...appData.settings, ...parsedData.settings },
            };
        } catch(e) {
            console.error("Gagal memuat data dari localStorage:", e);
        }
    }
    webhookGeneralInput.value = appData.webhooks.general || '';
    webhookIssuesInput.value = appData.webhooks.issues || '';
    webhookReportInput.value = appData.webhooks.report || '';
    enableReportToggle.checked = appData.settings.enableReport || false;
    intervalInput.value = appData.settings.checkIntervalS;
    currentIntervalDisplay.textContent = `${appData.settings.checkIntervalS} dtk`;
}

function applyIntervalChange() {
    const newInterval = parseInt(intervalInput.value, 10);
    if (isNaN(newInterval) || newInterval < 1) {
        showToast("Interval harus berupa angka dan minimal 1 detik.", "error");
        return;
    }

    const modal = document.getElementById('confirmModal');
    const modalText = document.getElementById('modalText');
    const modalConfirmBtn = document.getElementById('modalConfirmBtn');
    const modalCancelBtn = document.getElementById('modalCancelBtn');

    let warningMessage = `Anda yakin ingin mengubah interval menjadi ${newInterval} detik?`;
    if (newInterval < 10) {
        warningMessage += `\n\n<b>Peringatan:</b> Interval di bawah 10 detik dapat membebani jaringan Anda dan berisiko menyebabkan IP Anda diblokir oleh beberapa layanan.`;
    }
    modalText.innerHTML = warningMessage.replace(/\n/g, '<br>');
    modal.classList.remove('hidden');

    const handleConfirm = () => {
        appData.settings.checkIntervalS = newInterval;
        saveDataToLocalStorage();
        showToast(`Interval diubah menjadi ${newInterval} detik.`, "success");
        currentIntervalDisplay.textContent = `${newInterval} dtk`;
        clearInterval(monitoringInterval);
        startMonitoring();
        cleanup();
    };

    const handleCancel = () => {
        cleanup();
    };
    
    function cleanup() {
        modal.classList.add('hidden');
        modalConfirmBtn.removeEventListener('click', handleConfirm);
        modalCancelBtn.removeEventListener('click', handleCancel);
    }

    modalConfirmBtn.addEventListener('click', handleConfirm);
    modalCancelBtn.addEventListener('click', handleCancel);
}

function saveSettings() {
    appData.webhooks.general = webhookGeneralInput.value.trim();
    appData.webhooks.issues = webhookIssuesInput.value.trim();
    appData.webhooks.report = webhookReportInput.value.trim();
    appData.settings.enableReport = enableReportToggle.checked;
    saveDataToLocalStorage();
    showToast("Pengaturan webhook dan laporan disimpan!", "success");
}

function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `host_monitor_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Data berhasil diekspor!", "success");
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.hosts && importedData.history) {
                appData = importedData;
                saveDataToLocalStorage();
                showToast("Data berhasil diimpor! Memuat ulang...", "success");
                setTimeout(() => window.location.reload(), 1500);
            } else { throw new Error("Struktur file tidak valid."); }
        } catch (err) {
            showToast("Gagal mengimpor file. Pastikan file valid.", "error");
        }
    };
    reader.readAsText(file);
}

// --- FUNGSI INTI ---
function addHost() {
    let hostName = hostInput.value.trim().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    if (!hostName) {
        showToast("Nama host tidak boleh kosong.", "error");
        return;
    }
    if (appData.hosts[hostName]) {
        showToast(`Host '${hostName}' sudah dimonitor.`, "info");
        return;
    }

    appData.hosts[hostName] = { id: hostName, lastStatus: "Pending", responseTime: null, lastCheck: null };
    appData.history[hostName] = [];
    
    saveDataToLocalStorage();
    renderHostList();
    showToast(`Host '${hostName}' ditambahkan.`, "success");
    checkHostStatusAndUpdate(hostName);
}

function removeHost(hostName) {
    delete appData.hosts[hostName];
    delete appData.history[hostName];
    saveDataToLocalStorage();
    renderHostList();
    renderChart();
    showToast(`Host '${hostName}' dihapus.`, "success");
}

function startMonitoring() {
    const intervalMs = appData.settings.checkIntervalS * 1000;
    if (monitoringInterval) clearInterval(monitoringInterval);
    updateAllHostStatuses();
    monitoringInterval = setInterval(updateAllHostStatuses, intervalMs);
}

async function updateAllHostStatuses() {
    const hostsToCheck = Object.keys(appData.hosts);
    if (hostsToCheck.length === 0) return;
    
    console.log("Menjalankan pengecekan status terjadwal...");
    const checkPromises = hostsToCheck.map(hostName => checkHostStatus(hostName));
    const results = await Promise.all(checkPromises);

    results.forEach(result => {
        if (!result) return;
        const { hostName, status, responseTime, lastCheck, hasChanged } = result;
        const hostData = appData.hosts[hostName];
        hostData.lastStatus = status;
        hostData.responseTime = responseTime;
        hostData.lastCheck = lastCheck;
        appData.history[hostName].push({ timestamp: lastCheck, status, responseTime });
        
        if (hasChanged) {
             const message = status === "Offline" 
                ? `🔴 **Host Down!**\nHost: \`${hostName}\` sekarang offline.`
                : `✅ **Host Pulih!**\nHost: \`${hostName}\` kembali online.`;
            const type = status === 'Offline' ? 'issues' : 'general';
            sendDiscordNotification(message, type, null);
        }
    });

    if (appData.settings.enableReport && appData.webhooks.report) {
        sendPeriodicReport(results);
    }
    
    saveDataToLocalStorage();
    renderHostList();
    renderChart();
}

async function checkHostStatus(hostName) {
    const hostData = appData.hosts[hostName];
    if (!hostData) return null;

    let status = "Offline";
    let responseTime = null;
    const startTime = performance.now();

    try {
        await fetch(`https://${hostName}`, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' });
        status = "Online";
    } catch (error) {
        status = "Offline";
    } finally {
        responseTime = Math.round(performance.now() - startTime);
    }

    const hasChanged = hostData.lastStatus && hostData.lastStatus !== "Pending" && hostData.lastStatus !== status;

    return { hostName, status, responseTime, lastCheck: new Date().toISOString(), hasChanged };
}

async function checkHostStatusAndUpdate(hostName) {
    const result = await checkHostStatus(hostName);
    if (!result) return;
    const { status, responseTime, lastCheck } = result;
    const hostData = appData.hosts[hostName];
    hostData.lastStatus = status;
    hostData.responseTime = responseTime;
    hostData.lastCheck = lastCheck;
    appData.history[hostName].push({ timestamp: lastCheck, status, responseTime });
    saveDataToLocalStorage();
    renderHostList();
    renderChart();
}

async function sendPeriodicReport(results) {
    const webhookUrl = appData.webhooks.report;
    if (!webhookUrl || results.length === 0) return;

    const onlineHosts = results.filter(r => r.status === 'Online').length;
    const offlineHosts = results.length - onlineHosts;

    const embed = {
        title: "Laporan Status Host Berkala",
        color: offlineHosts > 0 ? 15158332 : 3066993,
        fields: results.map(r => ({
            name: r.hostName,
            value: r.status === 'Online' ? `✅ Online (${r.responseTime} ms)` : '🔴 Offline',
            inline: true
        })),
        footer: {
            text: `Online: ${onlineHosts} | Offline: ${offlineHosts}`
        },
        timestamp: new Date().toISOString()
    };

    sendDiscordNotification(null, 'report', embed);
}

async function sendDiscordNotification(message, type, embed = null) {
    const webhookUrl = appData.webhooks[type];
    if (!webhookUrl) return;
    
    const payload = {
        username: "Host Monitor Bot",
        avatar_url: "https://i.imgur.com/fKL31aD.png",
    };
    if(message) payload.content = message;
    if(embed) payload.embeds = [embed];

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error(`Gagal mengirim notifikasi Discord (${type}):`, error);
    }
}

// --- RENDER & UI ---
function renderHostList() {
    const selectedHostIds = new Set(Array.from(document.querySelectorAll('.host-checkbox:checked')).map(cb => cb.dataset.host));
    hostListContainer.innerHTML = '';
    const sortedHosts = Object.values(appData.hosts).sort((a, b) => a.id.localeCompare(b.id));

    if (sortedHosts.length === 0) {
        hostListContainer.innerHTML = `<p class="text-center text-gray-500 p-4">Belum ada host.</p>`;
        return;
    }

    sortedHosts.forEach(host => {
        const isOnline = host.lastStatus === 'Online';
        const isPending = host.lastStatus === 'Pending';
        
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors';
        const isChecked = selectedHostIds.has(host.id) ? 'checked' : '';
        item.innerHTML = `
            <div class="flex items-center gap-3 min-w-0">
                <input type="checkbox" class="host-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" data-host="${host.id}" ${isChecked}>
                <span class="status-dot ${isOnline ? 'status-online' : 'status-offline'} ${isPending ? 'bg-gray-400' : ''}" title="${host.lastStatus || 'Pending'}"></span>
                <label class="font-medium text-gray-700 truncate cursor-pointer" for="cb-${host.id}">${host.id}</label>
            </div>
            <div class="flex items-center gap-4 flex-shrink-0">
                <span class="text-sm font-mono ${isOnline ? 'text-green-600' : 'text-red-600'}">
                    ${isPending ? '---' : host.responseTime !== null ? `${host.responseTime} ms` : 'N/A'}
                </span>
                <button class="remove-btn text-gray-400 hover:text-red-500 p-1" data-host="${host.id}">
                    <i class="ph ph-trash text-lg"></i>
                </button>
            </div>
        `;
        item.querySelector('input.host-checkbox').id = `cb-${host.id}`;

        item.querySelector('.remove-btn').addEventListener('click', () => removeHost(host.id));
        item.querySelector('.host-checkbox').addEventListener('change', renderChart);
        hostListContainer.appendChild(item);
    });
}

function renderChart() {
    const selectedHosts = Array.from(document.querySelectorAll('.host-checkbox:checked')).map(cb => cb.dataset.host);

    if (selectedHosts.length === 0) {
        chartPlaceholder.classList.remove('hidden');
        chartContainer.classList.add('hidden');
        if (chart) {
            chart.destroy();
            chart = null;
        }
        return;
    }

    chartPlaceholder.classList.add('hidden');
    chartContainer.classList.remove('hidden');

    const datasets = selectedHosts.map((hostName, index) => {
        const hostHistory = appData.history[hostName] || [];
        return {
            label: hostName,
            data: hostHistory.map(d => ({
                x: new Date(d.timestamp),
                y: d.status === 'Online' ? d.responseTime : null
            })),
            borderColor: CHART_COLORS[index % CHART_COLORS.length],
            backgroundColor: CHART_COLORS[index % CHART_COLORS.length] + '1A',
            borderWidth: 2,
            tension: 0.1,
            fill: true,
            pointRadius: 1.5,
            pointHoverRadius: 5
        };
    });
    
    updateChart(datasets);
}

function updateChart(datasets) {
    const ctx = document.getElementById('pingChart').getContext('2d');
    
    const endDate = new Date();
    let startDate;
    let timeSettings = {};
    
    switch(currentTimeFilter) {
        case '1h':
            startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
            timeSettings = { unit: 'minute', stepSize: 5, tooltipFormat: 'HH:mm:ss' };
            break;
        case '24h':
            startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
            timeSettings = { unit: 'hour', stepSize: 1, tooltipFormat: 'dd MMM, HH:mm' };
            break;
        case '7d':
            startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            timeSettings = { unit: 'day', stepSize: 1, tooltipFormat: 'dd MMM yyyy' };
            break;
        case '30d':
            startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            timeSettings = { unit: 'day', stepSize: 2, tooltipFormat: 'dd MMM yyyy' };
            break;
        case 'all':
        default:
            startDate = null;
            timeSettings = { unit: undefined, stepSize: undefined, tooltipFormat: 'dd MMM yyyy, HH:mm' };
            break;
    }

    if (chart) {
        const scales = chart.options.scales.x;
        scales.min = startDate;
        scales.max = endDate;
        scales.time.unit = timeSettings.unit;
        scales.time.tooltipFormat = timeSettings.tooltipFormat;
        scales.time.displayFormats.minute = 'HH:mm';
        scales.time.displayFormats.hour = 'HH:00';
        scales.time.displayFormats.day = 'dd MMM';
        chart.data.datasets = datasets;
        chart.update('none');
    } else {
        chart = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 0 },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        title: { display: true, text: 'Waktu Respons (ms)' },
                        grid: { color: '#e5e7eb' }
                    },
                    x: {
                        type: 'time',
                        min: startDate,
                        max: endDate,
                        time: {
                            unit: timeSettings.unit,
                            tooltipFormat: timeSettings.tooltipFormat,
                            displayFormats: {
                                minute: 'HH:mm',
                                hour: 'HH:00',
                                day: 'dd MMM'
                            }
                        },
                        grid: { display: false },
                        ticks: {
                            source: 'auto',
                            maxRotation: 0,
                            autoSkip: true,
                        }
                    }
                },
                plugins: {
                    legend: { position: 'top' },
                    tooltip: { mode: 'index', intersect: false },
                }
            }
        });
    }
}

function showToast(message, type = "info") {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    const colors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' };
    const icons = { success: 'ph-check-circle', error: 'ph-x-circle', info: 'ph-info' };

    toast.className = `fixed bottom-5 right-5 text-white p-4 rounded-lg shadow-lg flex items-center gap-3 transform translate-y-20 transition-transform duration-300 ease-out z-50 ${colors[type]}`;
    toastIcon.className = `ph ${icons[type]} text-2xl`;
    toastMessage.textContent = message;

    setTimeout(() => { toast.classList.remove('translate-y-20'); }, 100);
    setTimeout(() => { toast.classList.add('translate-y-20'); }, 3000);
}

main();

