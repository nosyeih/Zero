// operations.js
document.addEventListener('DOMContentLoaded', () => {
    const { rawTransactions, chartDataPEN, chartDataUSD } = window.appData;

    const allTransactions = rawTransactions.map(t => {
        let montoVal = t._parsed_monto;
        if (montoVal === undefined) {
            let montoStr = String(t.MONTO || "0").replace(/,/g, '');
            montoVal = parseFloat(montoStr);
        }

        let dateStr = t._parsed_date;
        if (!dateStr) {
            dateStr = String(t.FECHA_INGRESO || "").substring(0, 10);
        }

        return {
            ...t,
            _montoVal: montoVal,
            _dateStr: dateStr,
            _tipo: montoVal >= 0 ? 'ingreso' : 'egreso'
        };
    }).reverse();

    // --- Flip Card Logic ---
    window.flipBalanceCard = function () {
        const card = document.getElementById('balanceFlipCard');
        if (card) {
            card.classList.toggle('is-flipped');
        }
    };

    // --- Tab Switching Logic ---
    const tabBtnHistory = document.getElementById('tabBtnHistory');
    const tabBtnCharts = document.getElementById('tabBtnCharts');
    const contentHistory = document.getElementById('tabContentHistory');
    const contentCharts = document.getElementById('tabContentCharts');

    function switchTab(tab) {
        if (tab === 'history') {
            contentHistory.classList.remove('hidden');
            contentHistory.classList.add('flex');
            contentCharts.classList.add('hidden');
            contentCharts.classList.remove('flex');

            if (tabBtnHistory) tabBtnHistory.className = "border-indigo-500 text-indigo-600 whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-colors";
            if (tabBtnCharts) tabBtnCharts.className = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors";
        } else {
            contentCharts.classList.remove('hidden');
            contentCharts.classList.add('flex');
            contentHistory.classList.add('hidden');
            contentHistory.classList.remove('flex');

            if (tabBtnCharts) tabBtnCharts.className = "border-indigo-500 text-indigo-600 whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-colors";
            if (tabBtnHistory) tabBtnHistory.className = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors";
        }
    }

    if (tabBtnHistory) tabBtnHistory.addEventListener('click', () => switchTab('history'));
    if (tabBtnCharts) tabBtnCharts.addEventListener('click', () => switchTab('charts'));

    // --- Table & Filters Logic ---
    const tableBody = document.getElementById('transactionTableBody');
    const filterEmpresa = document.getElementById('filterEmpresa');
    const filterTipo = document.getElementById('filterTipo');
    const filterMes = document.getElementById('filterMes');
    const filterHL = document.getElementById('filterHL');
    const uniqueHLCodes = new Set();
    const hlRegex = /HL\d{5,}/i;

    allTransactions.forEach(t => {
        const match = (t.CONCEPTO_PAGO || '').match(hlRegex);
        if (match) {
            uniqueHLCodes.add(match[0].toUpperCase());
            t._hlCode = match[0].toUpperCase();
        } else {
            t._hlCode = null;
        }
    });

    if (filterHL) {
        Array.from(uniqueHLCodes).sort().forEach(code => {
            const opt = document.createElement('option');
            opt.value = code;
            opt.textContent = code;
            filterHL.appendChild(opt);
        });
    }

    function renderTable(data) {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-12 text-center text-sm text-gray-400 bg-gray-50/30 rounded-lg border border-dashed border-gray-200 m-4 block">No se encontraron operaciones con los filtros actuales.</td></tr>`;
            return;
        }

        data.forEach(t => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-indigo-50/30 transition-colors group";

            const isIngreso = t._montoVal >= 0;
            const colorClass = isIngreso ? 'text-emerald-600' : 'text-rose-600';
            const iconBg = isIngreso ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600';
            const iconPath = isIngreso
                ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />'
                : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />';

            const moneda = t.MONEDA || (t._parsed_moneda ? t._parsed_moneda : '');
            const sign = isIngreso ? '+' : '';
            const montoFormatted = t._montoVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            let dateObj = new Date(t._dateStr + 'T00:00:00');
            let dateDisplay = isNaN(dateObj) ? t._dateStr : dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

            tr.innerHTML = `
                <td class="px-4 py-3 whitespace-nowrap w-24">
                    <span class="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200/60 shadow-sm">${dateDisplay}</span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8 rounded-full ${iconBg} flex items-center justify-center mr-3 shadow-sm group-hover:scale-110 transition-transform">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">${iconPath}</svg>
                        </div>
                        <div class="min-w-0">
                            <p class="text-[13px] font-bold text-gray-900 truncate">${t.CONCEPTO_PAGO || '-'}</p>
                            <p class="text-[11px] font-medium text-gray-500 truncate flex items-center gap-1 mt-0.5">
                                <svg class="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                ${t.EMPRESA || '-'}
                            </p>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-right">
                    <div class="text-[13px] font-black tracking-tight ${colorClass}">
                        ${sign}${montoFormatted} <span class="text-[10px] font-bold opacity-75">${moneda}</span>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function applyFilters() {
        const term = filterEmpresa ? filterEmpresa.value.toLowerCase() : '';
        const tipoVal = filterTipo ? filterTipo.value : 'all';
        const mesVal = filterMes ? filterMes.value : '';
        const hlVal = filterHL ? filterHL.value : 'all';

        const filtered = allTransactions.filter(t => {
            const m1 = (t.EMPRESA || '').toLowerCase().includes(term) || (t.CONCEPTO_PAGO || '').toLowerCase().includes(term);
            const m2 = tipoVal === 'all' || t._tipo === tipoVal;
            const m3 = !mesVal || t._dateStr.startsWith(mesVal);
            const m4 = hlVal === 'all' || t._hlCode === hlVal;
            return m1 && m2 && m3 && m4;
        });

        let totalPEN = 0;
        let totalUSD = 0;
        filtered.forEach(t => {
            const mon = (t.MONEDA || t._parsed_moneda || 'USD').toUpperCase();
            if (mon.includes('PEN') || mon.includes('SOL')) totalPEN += t._montoVal;
            else totalUSD += t._montoVal;
        });

        let pText = [];
        if (totalPEN !== 0) pText.push(`S/ ${totalPEN.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
        if (totalUSD !== 0) pText.push(`$ ${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);

        const mp = document.getElementById('mainProfitDisplay');
        if (mp) mp.textContent = pText.length > 0 ? pText.join(' | ') : 'S/ 0.00';

        renderTable(filtered);
    }

    if (filterEmpresa) filterEmpresa.addEventListener('input', applyFilters);
    if (filterTipo) filterTipo.addEventListener('change', applyFilters);
    if (filterMes) filterMes.addEventListener('change', applyFilters);
    if (filterHL) filterHL.addEventListener('change', applyFilters);

    applyFilters();

    // --- Charts Logic ---
    let chartInstancePEN = null;
    let chartInstanceUSD = null;

    function createChart(canvasId, labels, inc, exp, colorTheme) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        Chart.register(ChartDataLabels);

        // Colors
        let incColor, incBorder, expColor, expBorder;
        if (colorTheme === 'PEN') {
            incColor = 'rgba(16, 185, 129, 0.2)'; incBorder = '#10B981'; // Emerald
            expColor = 'rgba(244, 63, 94, 0.2)'; expBorder = '#F43F5E';  // Rose
        } else {
            incColor = 'rgba(59, 130, 246, 0.2)'; incBorder = '#3B82F6'; // Blue
            expColor = 'rgba(244, 63, 94, 0.2)'; expBorder = '#F43F5E';  // Rose
        }

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Ingresos', data: inc, backgroundColor: incColor, borderColor: incBorder, borderWidth: 2, borderRadius: 6 },
                    { label: 'Egresos', data: exp, backgroundColor: expColor, borderColor: expBorder, borderWidth: 2, borderRadius: 6 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false }, ticks: { font: { family: "'Inter', sans-serif" } } },
                    y: { border: { display: false }, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { family: "'Inter', sans-serif" }, callback: (v) => v.toLocaleString() } }
                },
                plugins: {
                    legend: { display: true, position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8, font: { family: "'Inter', sans-serif", size: 12, weight: 'bold' } } },
                    tooltip: { backgroundColor: 'rgba(17, 24, 39, 0.9)', cornerRadius: 8, titleFont: { family: "'Inter', sans-serif" }, bodyFont: { family: "'Inter', sans-serif" } },
                    datalabels: {
                        color: '#4B5563', anchor: 'end', align: 'top', offset: 2,
                        font: { weight: 'bold', size: 10, family: "'Inter', sans-serif" },
                        formatter: (v) => v === 0 ? '' : (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toLocaleString())
                    }
                }
            }
        });
    }

    if (chartDataPEN) chartInstancePEN = createChart('chartPEN', chartDataPEN.labels, chartDataPEN.income, chartDataPEN.expense, 'PEN');
    if (chartDataUSD) chartInstanceUSD = createChart('chartUSD', chartDataUSD.labels, chartDataUSD.income, chartDataUSD.expense, 'USD');

    // Filter Charts
    const cm = document.getElementById('chartFilterMonth');
    const cc = document.getElementById('clearChartFilter');

    function filterCharts(month) {
        function flt(dt) {
            if (!dt) return null;
            if (!month) return { l: dt.labels, i: dt.income, e: dt.expense };
            const idx = dt.labels.indexOf(month);
            if (idx === -1) return { l: [month], i: [0], e: [0] };
            return { l: [month], i: [dt.income[idx]], e: [dt.expense[idx]] };
        }

        if (chartInstancePEN && chartDataPEN) {
            let res = flt(chartDataPEN);
            chartInstancePEN.data.labels = res.l;
            chartInstancePEN.data.datasets[0].data = res.i;
            chartInstancePEN.data.datasets[1].data = res.e;
            chartInstancePEN.update();
        }
        if (chartInstanceUSD && chartDataUSD) {
            let res = flt(chartDataUSD);
            chartInstanceUSD.data.labels = res.l;
            chartInstanceUSD.data.datasets[0].data = res.i;
            chartInstanceUSD.data.datasets[1].data = res.e;
            chartInstanceUSD.update();
        }
    }

    if (cm) cm.addEventListener('change', (e) => filterCharts(e.target.value));
    if (cc) cc.addEventListener('click', () => { if (cm) cm.value = ''; filterCharts(''); });

    // --- Toast / Form Submissions Logic ---
    const toast = document.getElementById('connectionToast');
    if (toast) {
        toast.style.display = 'block';
        setTimeout(() => toast.style.opacity = '1', 50);
        const isSuccess = toast.querySelector('.bg-green-50\\/80, .bg-green-50\\/90') !== null || toast.className.includes('bg-green'); // safe check
        if (isSuccess) {
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.style.display = 'none', 500);
            }, 3000);
        }
    }

    const form = document.getElementById('transactionForm');
    if (form) {
        const fi = document.getElementById('fecha_ingreso');
        if (fi && !fi.value) fi.value = new Date().toLocaleDateString('en-CA');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const origText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline-block" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Registrando...';

            const fd = new FormData(form);
            const data = Object.fromEntries(fd.entries());
            data.monto = parseFloat(data.monto);
            if (data.tipo === 'egreso') data.monto = -Math.abs(data.monto);
            else data.monto = Math.abs(data.monto);

            const newTx = {
                ...data, MONEDA: data.moneda, MONTO: data.monto, CONCEPTO_PAGO: data.concepto_pago,
                EMPRESA: data.empresa, FECHA_INGRESO: data.fecha_ingreso,
                _montoVal: data.monto, _dateStr: data.fecha_ingreso, _tipo: data.tipo
            };

            const m = (newTx.CONCEPTO_PAGO || '').match(/HL\d{5,}/i);
            newTx._hlCode = m ? m[0].toUpperCase() : null;
            if (newTx._hlCode && !uniqueHLCodes.has(newTx._hlCode)) {
                uniqueHLCodes.add(newTx._hlCode);
                if (filterHL) filterHL.add(new Option(newTx._hlCode, newTx._hlCode));
            }

            allTransactions.unshift(newTx);
            applyFilters();

            fetch(form.action, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify(data)
            }).then(r => r.json()).then(res => {
                if (res.status === 'success') {
                    // Update main UI reload
                    window.location.reload(); // Simple refresh to accurately fetch new sum totals from server
                } else throw new Error(res.message);
            }).catch(err => {
                console.error(err);
                allTransactions.shift(); applyFilters();
                alert("Error: " + err.message);
            }).finally(() => {
                btn.disabled = false; btn.innerHTML = origText;
            });
        });
    }
});
