import React from 'react';
import { Container, Box, Typography, TextField, Button, Alert } from '@mui/material';

function SignInForm({ email, password, authError, setEmail, setPassword, handleSignIn }) {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, border: '1px solid #ccc', borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>Sign In</Typography>
        {authError && <Alert severity="error" sx={{ mb: 2 }}>{authError}</Alert>}
        <form onSubmit={handleSignIn}>
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
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Sign In
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default SignInForm;