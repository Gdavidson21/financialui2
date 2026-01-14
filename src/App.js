import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { auth } from './firebase';
import StockList from './StockList';
import './App.css';
import Sidebar from './Sidebar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [mode, setMode] = useState('light');
const theme = createTheme({ palette: { mode } });
const toggleMode = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));

function Dashboard() {
  return <h2>Welcome to the Dashboard</h2>;
}

  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSignedIn(true);
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setSignedIn(false);
    setEmail('');
    setPassword('');
  };

  if (!signedIn) {
    return (
      <form onSubmit={handleSignIn} style={{ maxWidth: 400, margin: '80px auto', padding: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <h2>Sign In</h2>
        {authError && <div style={{ color: 'red', marginBottom: 8 }}>{authError}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 12, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 12, padding: 8 }}
        />
        <button type="submit" style={{ width: '100%', padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold' }}>
          Sign In
        </button>
      </form>
    );
  }

  return (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
    <div style={{ display: 'flex' }}>
      <Sidebar
        userEmail={email}
        handleSignOut={handleSignOut}
        toggleMode={toggleMode}
        mode={mode}
      />
      <div style={{ flexGrow: 1 }}>
        <div className="header">
          Financial Dashboard
          <button className="signout-btn" onClick={handleSignOut}>
            SIGN OUT
          </button>
        </div>
        <div className="card">
          <Routes>
                <Route path="/" element={<StockList />} />
                <Route path="/tracked" element={<StockList />} />
                {/* Add more routes here */}
              </Routes>
          <StockList />
        </div>
        <div className="footer">
          &copy; 2026 Financial Dashboard. All rights reserved.
        </div>
      </div>
    </div>
    </BrowserRouter>
  </ThemeProvider>
);
}

export default App;