
document.addEventListener('DOMContentLoaded', function () {
    function updateRow(row) {
        const unitLanded = parseFloat(row.dataset.unitLanded);
        const qtyInput = row.querySelector('.qty-input');
        const priceInput = row.querySelector('.sale-price-input');

        const qty = parseFloat(qtyInput.value) || 0;
        const salePrice = parseFloat(priceInput.value) || 0;

        // Elements to update
        const totalCostDisplay = row.querySelector('.total-cost-display');
        const profitUnitDisplay = row.querySelector('.profit-unit-display');
        const profitTotalDisplay = row.querySelector('.profit-total-display');
        const marginDisplay = row.querySelector('.margin-display');

        // 1. Update Total Cost = Qty * UnitLanded
        const totalCost = qty * unitLanded;
        totalCostDisplay.textContent = totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // 2. Calculate Profits if Price is set
        if (salePrice > 0) {
            const profitUnit = salePrice - unitLanded;
            const profitTotal = profitUnit * qty;
            const margin = (profitUnit / salePrice) * 100;

            profitUnitDisplay.textContent = profitUnit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            profitTotalDisplay.textContent = profitTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            marginDisplay.textContent = margin.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

            // Color coding
            const colorClass = profitUnit < 0 ? 'text-red-600' : 'text-green-600';
            const removeClass = profitUnit < 0 ? 'text-green-600' : 'text-red-600';

            profitUnitDisplay.classList.add(colorClass);
            profitUnitDisplay.classList.remove(removeClass);

            profitTotalDisplay.classList.add(colorClass);
            profitTotalDisplay.classList.remove(removeClass);

        } else {
            profitUnitDisplay.textContent = '-';
            profitTotalDisplay.textContent = '-';
            marginDisplay.textContent = '-';
            profitUnitDisplay.classList.remove('text-red-600', 'text-green-600');
            profitTotalDisplay.classList.remove('text-red-600', 'text-green-600');
        }
    }

    const rows = document.querySelectorAll('.product-row');
    rows.forEach(row => {
        const qtyInput = row.querySelector('.qty-input');
        const priceInput = row.querySelector('.sale-price-input');

        // Initialize on load
        // updateRow(row); 

        qtyInput.addEventListener('input', () => updateRow(row));
        priceInput.addEventListener('input', () => updateRow(row));
    });

    // Search Functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase();

            rows.forEach(row => {
                const productName = row.querySelector('.product-name').textContent.toLowerCase();
                if (productName.includes(searchTerm)) {
                    row.classList.remove('hidden');
                    row.classList.add('print:table-row'); // Ensure it stays printable if it was hidden then shown
                } else {
                    row.classList.add('hidden');
                    row.classList.remove('print:table-row'); // Optional: hide filtered items from print too
                }
            });
        });
    }

    // Formatting Coordinates to Uppercase
    const coordInputs = ['col_name', 'col_qty', 'col_unit_cost', 'col_total_cost'];
    coordInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function (e) {
                this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            });
        }
    });
});
