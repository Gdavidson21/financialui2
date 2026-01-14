import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Container, Typography, Paper } from '@mui/material';
import StockChart from './StockChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function StockList() {
  const [stocks, setStocks] = useState([
    { symbol: 'AAPL', price: 150.00 },
    { symbol: 'GOOGL', price: 2800.00 },
    { symbol: 'MSFT', price: 300.00 }
  ]);
  const [symbol, setSymbol] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [inputError, setInputError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('trackedStocks');
    if (saved) setStocks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('trackedStocks', JSON.stringify(stocks));
  }, [stocks]);

  const API_KEY = 'IANLUYPZ6DU0Q0R4'; // Replace with your actual Alpha Vantage key

  useEffect(() => {
    if (!selectedSymbol) {
      setChartData(null);
      return;
    }
    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${selectedSymbol}&apikey=${API_KEY}`
        );
        const timeSeries = response.data['Time Series (Daily)'];
        if (!timeSeries) {
          setChartData(null);
          return;
        }
        const labels = Object.keys(timeSeries).slice(0, 30).reverse();
        const data = labels.map(date => Number(timeSeries[date]['4. close']));
        setChartData({
          labels,
          datasets: [
            {
              label: `${selectedSymbol} Close Price`,
              data,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        });
      } catch {
        setChartData(null);
      }
    };
    fetchChartData();
  }, [selectedSymbol, API_KEY]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${selectedSymbol} Stock Price`,
      },
    },
  };

  const refreshPrices = useCallback(async () => {
    setErrorMsg('');
    setLoading(true);
    const currentStocks = [...stocks];
    for (const stock of currentStocks) {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.symbol}&apikey=${API_KEY}`
        );
        if (response.data['Note']) {
          setErrorMsg('API call frequency exceeded. Please wait a minute before refreshing again.');
          break;
        }
        const quote = response.data['Global Quote'];
        if (quote && quote['05. price']) {
          setStocks(prevStocks =>
            prevStocks.map(s =>
              s.symbol === stock.symbol
                ? { ...s, price: quote['05. price'] }
                : s
            )
          );
        }
      } catch (error) {
        setErrorMsg('Error fetching stock data.');
      }
      await new Promise(res => setTimeout(res, 15000)); // Wait 15s between requests
    }
    setLoading(false);
    setLastUpdated(new Date().toLocaleTimeString());
  }, [stocks, API_KEY]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshPrices();
    }, 20000);
    return () => clearInterval(interval);
  }, [refreshPrices, stocks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedSymbol = symbol.trim().toUpperCase();

    const symbolExists = stocks.some(
      stock => stock.symbol.toUpperCase() === trimmedSymbol
    );

    if (symbolExists) {
      setInputError('This stock symbol is already being tracked.');
      return;
    }
    if (trimmedSymbol) {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${trimmedSymbol}&apikey=${API_KEY}`
        );
        const quote = response.data['Global Quote'];
        if (quote && quote['05. price']) {
          setStocks([...stocks, { symbol: trimmedSymbol, price: quote['05. price'] }]);
        } else {
          alert('Stock not found.');
        }
      } catch (error) {
        setInputError('Error fetching stock data.');
      }
      setSymbol('');
    }
  };

  const handleRemove = (removeSymbol) => {
    setStocks(stocks.filter(stock => stock.symbol !== removeSymbol));
  };

  return (
    <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Tracked Stocks
        </Typography>
        {inputError && (
          <div style={{ color: 'red', marginBottom: '8px' }}>{inputError}</div>
        )}
        {errorMsg && (
          <div style={{ color: 'red', marginBottom: '8px' }}>{errorMsg}</div>
        )}
        {loading && (
          <Typography
            sx={{
              color: 'primary.main',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              marginBottom: '12px',
              fontSize: '1.1rem',
              letterSpacing: 1,
            }}
          >
            Updating prices...
          </Typography>
        )}
        {lastUpdated && <div style={{ marginBottom: '12px' }}>Last updated at: {lastUpdated}</div>}
        {/* Dropdown to select stock for chart */}
        <select
          value={selectedSymbol || ''}
          onChange={e => setSelectedSymbol(e.target.value)}
          style={{ marginBottom: '16px' }}
        >
          <option value="">Select a stock to view chart</option>
          {stocks.map(stock => (
            <option key={stock.symbol} value={stock.symbol}>
              {stock.symbol}
            </option>
          ))}
        </select>

        {/* Render the chart here */}
        <StockChart chartData={chartData} chartOptions={chartOptions} />

        <button onClick={refreshPrices} style={{ marginBottom: '16px' }}>
          Refresh Prices
        </button>
        <ul style={{ width: '100%', padding: 0, listStyle: 'none' }}>
          {stocks.map(stock => (
            <li key={stock.symbol} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, letterSpacing: 1, mr: 1 }}>
                {stock.symbol}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mr: 1,
                  fontFamily: 'monospace',
                  fontSize: '1.1rem'
                }}
              >
                {stock.price !== null && stock.price !== undefined
                  ? `$${Number(stock.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : 'N/A'}
              </Typography>
              <button
                onClick={() => handleRemove(stock.symbol)}
                style={{
                  marginLeft: '12px',
                  color: '#fff',
                  background: '#d32f2f',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
          <input
            type="text"
            placeholder="Symbol (e.g. TSLA)"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            required
          />
          <button
            type="submit"
            style={{ marginLeft: '8px' }}
            disabled={!symbol.trim()}
          >
            Add Stock
          </button>
        </form>
      </Paper>
    </Container>
  );
}

export default StockList;