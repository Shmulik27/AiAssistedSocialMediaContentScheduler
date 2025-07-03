import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, List, ListItem, ListItemText, Alert, MenuItem } from '@mui/material';
import { useAuth } from '../AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import { useToast } from '../ToastContext';

function Posts() {
  const [socialAccountId, setSocialAccountId] = useState('');
  const [content, setContent] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [posts, setPosts] = useState([]);
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [error, setError] = useState('');
  const { token: jwt } = useAuth();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!jwt) return;
    setLoading(true);
    Promise.all([
      fetch('/social/accounts', {
        headers: { Authorization: `Bearer ${jwt}` },
      }).then(res => res.ok ? res.json() : Promise.reject(res)),
      fetch('/posts/', {
        headers: { Authorization: `Bearer ${jwt}` },
      }).then(res => res.ok ? res.json() : Promise.reject(res)),
    ])
      .then(([accounts, posts]) => {
        setSocialAccounts(accounts);
        setPosts(posts);
        setLoading(false);
      })
      .catch(() => {
        setSocialAccounts([]);
        setPosts([]);
        setLoading(false);
        setError('Failed to fetch data');
      });
  }, [jwt]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/posts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          social_account_id: Number(socialAccountId),
          content,
          scheduled_time: scheduledTime,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to create post');
      const newPost = await res.json();
      setPosts([newPost, ...posts]);
      setContent('');
      setScheduledTime('');
      showToast('Post scheduled!');
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    }
  };

  const handleGenerateAI = async () => {
    setError('');
    setAiResult('');
    showToast('Generating AI caption...', 'info');
    try {
      const res = await fetch('/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (!res.ok) throw new Error('AI generation failed');
      const data = await res.json();
      setAiResult(data.result);
      showToast('AI caption generated!');
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    }
  };

  return (
    <Box maxWidth={600} mx="auto">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>Schedule a Post</Typography>
        <Box component="form" onSubmit={handleCreatePost} sx={{ mb: 3 }}>
          <TextField
            select
            label="Social Account"
            value={socialAccountId}
            onChange={e => setSocialAccountId(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            required
          >
            {socialAccounts.map(acc => (
              <MenuItem key={acc.id} value={acc.id}>{acc.platform} (ID: {acc.id})</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Content"
            value={content}
            onChange={e => setContent(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="Scheduled Time"
            type="datetime-local"
            value={scheduledTime}
            onChange={e => setScheduledTime(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            required
          />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Schedule Post
          </Button>
        </Box>
        <Typography variant="h6" gutterBottom>AI Caption/Hashtag Generator</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Prompt"
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            fullWidth
          />
          <Button variant="outlined" onClick={handleGenerateAI}>Generate</Button>
        </Box>
        {aiResult && <Alert severity="success" sx={{ mb: 2 }}>{aiResult}</Alert>}
        <Typography variant="h6" gutterBottom>Scheduled Posts</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <List>
            {posts.map((post, idx) => (
              <ListItem key={idx}>
                <ListItemText
                  primary={post.content}
                  secondary={`Scheduled: ${post.scheduled_time} | Status: ${post.status}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}

export default Posts; 