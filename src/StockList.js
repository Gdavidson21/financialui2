import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function StockList() {
  const [stocks, setStocks] = useState([
    { symbol: 'AAPL', price: 150.00 },
    { symbol: 'GOOGL', price: 2800.00 },
    { symbol: 'MSFT', price: 300.00 }
  ]);
  // hooks for form input and error handling
  const [symbol, setSymbol] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [inputError, setInputError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
  const saved = localStorage.getItem('trackedStocks');
  if (saved) setStocks(JSON.parse(saved));
}, []);

useEffect(() => {
  localStorage.setItem('trackedStocks', JSON.stringify(stocks));
}, [stocks]);

  const API_KEY = 'IANLUYPZ6DU0Q0R4'; // Replace with your actual Alpha Vantage key

  // Refresh prices for all tracked stocks
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

  // Auto-refresh every 20 seconds
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
    <div>
      <h2>Tracked Stocks</h2>
      {inputError && (
        <div style={{ color: 'red', marginBottom: '8px' }}>{inputError}</div>
      )}
      {errorMsg && (
        <div style={{ color: 'red', marginBottom: '8px' }}>{errorMsg}</div>
      )}
      {loading && <div style={{ color: 'blue', marginBottom: '12px' }}>Updating prices...</div>}
      {lastUpdated && <div style={{ marginBottom: '12px' }}>Last updated at: {lastUpdated}</div>}
      {<select
  value={selectedSymbol}
  onChange={e => setSelectedSymbol(e.target.value)}
  style={{ marginBottom: '16px' }}
>
  <option value="">Select a stock to view chart</option>
  {stocks.map(stock => (
    <option key={stock.symbol} value={stock.symbol}>
      {stock.symbol}
    </option>
  ))}
</select>}
      <button onClick={refreshPrices} style={{ marginBottom: '16px' }}>
        Refresh Prices
      </button>
      <ul>
        {stocks.map(stock => (
          <li key={stock.symbol}>
            {stock.symbol}
            {' - $'}
            {stock.price !== null && stock.price !== undefined ? Number(stock.price).toFixed(2) : 'N/A'}
            <button
              onClick={() => handleRemove(stock.symbol)}
              style={{ marginLeft: '12px', color: '#fff', background: '#d32f2f', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
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
    </div>
  );
}

export default StockList;