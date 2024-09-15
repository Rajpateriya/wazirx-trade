document.addEventListener('DOMContentLoaded', () => {
    const cryptoTable = document.getElementById('crypto-table');
    const tableBody = cryptoTable.querySelector('tbody');
    const timerElement = document.querySelector('.timer');
    const loader = document.getElementById('loader');
    const themeToggle = document.querySelector('.theme-toggle');
    const baseUnitDropdown = document.getElementById('base-unit-dropdown');
    const buyButton = document.getElementById('buy-button');
    let timeLeft = 60;

    function updateTimer() {
        timerElement.textContent = timeLeft;
        timeLeft--;
        if (timeLeft < 0) {
            timeLeft = 60;
            fetchTickers();
        }
    }

    function fetchTickers() {
        loader.style.display = 'flex';
        cryptoTable.style.display = 'none';

        fetch('http://localhost:3000/api/tickers')
            .then(response => response.json())
            .then(data => {
                setTimeout(() => {
                    updateTable(data);
                    updateBaseUnitDropdown(data);
                    loader.style.display = 'none';
                    cryptoTable.style.display = 'table';
                }, 2000);
            })
            .catch(error => {
                console.error('Error fetching tickers:', error);
                loader.style.display = 'none';
            });
    }

    function updateTable(data) {
        tableBody.innerHTML = '';
        data.forEach((ticker, index) => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${ticker.name}</td>
                <td>₹ ${ticker.last}</td>
                <td>₹ ${ticker.buy}</td>
                <td>₹ ${ticker.sell}</td>
                <td>${ticker.volume}</td>
                <td>${ticker.base_unit.toUpperCase()}</td>
            `;
        });
    }

    function updateBaseUnitDropdown(data) {
        const baseUnits = [...new Set(data.map(ticker => ticker.base_unit.toUpperCase()))];
        baseUnitDropdown.innerHTML = '';
        baseUnits.forEach(unit => {
            if (unit !== 'INR') {
                const option = document.createElement('option');
                option.value = unit;
                option.textContent = unit;
                baseUnitDropdown.appendChild(option);
            }
        });
        updateBuyButton();
    }

    function updateBuyButton() {
        const selectedBaseUnit = baseUnitDropdown.value;
        buyButton.textContent = `BUY ${selectedBaseUnit}`;
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
    });

    baseUnitDropdown.addEventListener('change', updateBuyButton);

    setInterval(updateTimer, 1000);
    fetchTickers();
});