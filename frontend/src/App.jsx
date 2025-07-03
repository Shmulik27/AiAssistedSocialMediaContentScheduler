import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { AuthProvider, useAuth } from './AuthContext';
import jwt_decode from 'jwt-decode';
import { ToastProvider } from './ToastContext';

import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import SocialAccounts from './pages/SocialAccounts';
import Posts from './pages/Posts';

const theme = createTheme();

function Navbar() {
  const { token, user, logout } = useAuth();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AI Social Scheduler
        </Typography>
        {user && (
          <Typography sx={{ mr: 2 }}>{user.email}</Typography>
        )}
        <Button color="inherit" component={Link} to="/">Dashboard</Button>
        <Button color="inherit" component={Link} to="/social">Social Accounts</Button>
        <Button color="inherit" component={Link} to="/posts">Posts</Button>
        {token ? (
          <Button color="inherit" onClick={logout}>Logout</Button>
        ) : (
          <Button color="inherit" component={Link} to="/auth">Login/Register</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Navbar />
            <Container sx={{ mt: 4 }}>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/social" element={<ProtectedRoute><SocialAccounts /></ProtectedRoute>} />
                <Route path="/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
              </Routes>
            </Container>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 