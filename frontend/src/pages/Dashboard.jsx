import React, { useEffect, useState } from 'react';
import { Typography, Paper, Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../AuthContext';

function Dashboard() {
  const { token: jwt } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({ totalLikes: 0, totalComments: 0, bestPost: null });

  useEffect(() => {
    if (!jwt) return;
    setLoading(true);
    fetch('/posts/', {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setPosts(data);
        // Aggregate analytics
        let totalLikes = 0, totalComments = 0, bestPost = null, bestLikes = -1;
        data.forEach(post => {
          if (post.analytics) {
            try {
              const a = JSON.parse(post.analytics);
              totalLikes += a.likes || 0;
              totalComments += a.comments || 0;
              if ((a.likes || 0) > bestLikes) {
                bestLikes = a.likes || 0;
                bestPost = post;
              }
            } catch {}
          }
        });
        setSummary({ totalLikes, totalComments, bestPost });
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch posts');
        setLoading(false);
      });
  }, [jwt]);

  return (
    <Box maxWidth={600} mx="auto">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to AI-Assisted Social Media Scheduler
        </Typography>
        <Typography>
          Use the navigation bar to manage your social accounts, schedule posts, and generate AI-powered content.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Analytics Summary</Typography>
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
              <Typography>Total Likes: {summary.totalLikes}</Typography>
              <Typography>Total Comments: {summary.totalComments}</Typography>
              {summary.bestPost && (
                <Typography>
                  Best Post: "{summary.bestPost.content}" ({summary.bestPost.analytics && (() => { try { return JSON.parse(summary.bestPost.analytics).likes; } catch { return 0; } })()} likes)
                </Typography>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default Dashboard; 