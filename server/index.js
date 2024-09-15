const express = require('express');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Fetch data from WazirX API and store in database
async function fetchAndStoreData() {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const tickers = Object.values(response.data).slice(0, 10);

    for (const ticker of tickers) {
      await prisma.ticker.upsert({
        where: { name: ticker.name },
        update: {
          last: ticker.last,
          buy: ticker.buy,
          sell: ticker.sell,
          volume: ticker.volume,
          base_unit: ticker.base_unit,
        },
        create: {
          name: ticker.name,
          last: ticker.last,
          buy: ticker.buy,
          sell: ticker.sell,
          volume: ticker.volume,
          base_unit: ticker.base_unit,
        },
      });
    }
    console.log('Data fetched and stored successfully');
  } catch (error) {
    console.error('Error fetching and storing data:', error);
  }
}

// Route to get stored data
app.get('/api/tickers', async (req, res) => {
  try {
    const tickers = await prisma.ticker.findMany();
    res.json(tickers);
  } catch (error) {
    console.error('Error fetching tickers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch and store data every 5 minutes
setInterval(fetchAndStoreData, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  fetchAndStoreData(); // Initial fetch when server starts
});