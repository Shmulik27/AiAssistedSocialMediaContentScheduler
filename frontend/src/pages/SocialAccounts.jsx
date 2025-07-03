import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, List, ListItem, ListItemText, Alert } from '@mui/material';
import { useAuth } from '../AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import { useToast } from '../ToastContext';

function SocialAccounts() {
  const [platform, setPlatform] = useState('instagram');
  const [token, setToken] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');
  const { token: jwt } = useAuth();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!jwt) return;
    setLoading(true);
    fetch('/social/accounts', {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setAccounts(data);
        setLoading(false);
      })
      .catch(() => {
        setAccounts([]);
        setLoading(false);
        setError('Failed to fetch accounts');
      });
  }, [jwt]);

  const handleConnect = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/social/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ platform, access_token: token }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to connect');
      setAccounts([...accounts, { platform, created_at: new Date().toISOString() }]);
      setToken('');
      showToast('Account connected!');
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    }
  };

  return (
    <Box maxWidth={500} mx="auto">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>Connect Social Account</Typography>
        <Box component="form" onSubmit={handleConnect} sx={{ mb: 3 }}>
          <TextField
            select
            label="Platform"
            value={platform}
            onChange={e => setPlatform(e.target.value)}
            SelectProps={{ native: true }}
            fullWidth
            sx={{ mb: 2 }}
          >
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
          </TextField>
          <TextField
            label="Access Token"
            value={token}
            onChange={e => setToken(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            required
          />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Connect
          </Button>
        </Box>
        <Typography variant="h6" gutterBottom>Connected Accounts</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <List>
            {accounts.map((acc, idx) => (
              <ListItem key={idx}>
                <ListItemText primary={acc.platform} secondary={new Date(acc.created_at).toLocaleString()} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}

export default SocialAccounts; 