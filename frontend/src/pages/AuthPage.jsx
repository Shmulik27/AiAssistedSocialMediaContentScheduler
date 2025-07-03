import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Tabs, Tab, Alert } from '@mui/material';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ToastContext';

function AuthPage() {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = tab === 0 ? '/auth/login' : '/auth/register';
      const body = tab === 0
        ? new URLSearchParams({ username: email, password })
        : JSON.stringify({ email, password });
      const headers = tab === 0
        ? { 'Content-Type': 'application/x-www-form-urlencoded' }
        : { 'Content-Type': 'application/json' };
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Auth failed');
      const data = await res.json();
      if (tab === 0) {
        login(data.access_token);
        showToast('Login successful!');
        navigate('/');
      } else {
        // After register, auto-login
        const loginRes = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ username: email, password }),
        });
        if (!loginRes.ok) throw new Error('Registration succeeded but login failed');
        const loginData = await loginRes.json();
        login(loginData.access_token);
        showToast('Registration successful!');
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    }
  };

  return (
    <Box maxWidth={400} mx="auto">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            {tab === 0 ? 'Login' : 'Register'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default AuthPage; 