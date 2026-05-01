import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    confirm_password: ''  
  });

  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm_password) {
      setMessage("Passwords do not match");
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('photo', imageFile);

    try {
      await axios.post('http://127.0.0.1:8000/register', fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMessage(" Registered successfully!");
      navigate('/login');
    } catch (err) {
      setMessage(' Error: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <Box sx={styles.page}>
      <Container maxWidth="sm">
        <Paper elevation={8} sx={styles.card}>
          <Typography variant="h4" sx={styles.title}>
             Create Account
          </Typography>

          <Typography sx={styles.subtitle}>
            Fill your details below
          </Typography>

          <form onSubmit={submit}>
            <TextField
              fullWidth label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={styles.input}
            />

            <TextField
              fullWidth label="Email" type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              sx={styles.input}
            />

            <TextField
              fullWidth label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              sx={styles.input}
            />

            <TextField
              fullWidth label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              sx={styles.input}
            />

            <TextField
              fullWidth label="Password" type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              sx={styles.input}
            />

            <TextField
              fullWidth label="Confirm Password" type="password"
              value={form.confirm_password}
              onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
              sx={styles.input}
            />

            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={styles.uploadBtn}
            >
              Upload Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </Button>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={styles.registerBtn}
            >
              Register
            </Button>
          </form>

          {message && (
            <Typography align="center" sx={styles.message}>
              {message}
            </Typography>
          )}

          <Typography align="center" sx={{ mt: 2 }}>
            Already have an account?
          </Typography>

          <Button
            fullWidth
            onClick={() => navigate('/login')}
            sx={styles.loginBtn}
          >
            Login
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(to right, #56ab2f, #a8e063)',
  },
  card: {
    padding: 4,
    borderRadius: '15px',
    textAlign: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 1
  },
  subtitle: {
    color: '#666',
    marginBottom: 2
  },
  input: {
    mt: 2
  },
  uploadBtn: {
    mt: 2,
    borderColor: '#56ab2f',
    color: '#56ab2f'
  },
  registerBtn: {
    mt: 3,
    py: 1.5,
    fontWeight: 'bold',
    backgroundColor: '#56ab2f'
  },
  loginBtn: {
    mt: 1,
    color: '#56ab2f',
    fontWeight: 'bold'
  },
  message: {
    mt: 2,
    fontWeight: 'bold'
  }
};
