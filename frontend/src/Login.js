import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const submit = async (e) => {
  e.preventDefault();
  try {
  const response = await axios.post(
  "http://127.0.0.1:8000/login",
      {
        email: form.email,
        password: form.password,
      }
    );
    localStorage.setItem("userEmail", form.email);
    setMessage("Login successful!");
    navigate("/home");
  } catch (err) {
    setMessage(" Error: " + (err.response?.data?.detail || err.message));
  }
};

  return (
    <Box sx={styles.page}>
      <Container maxWidth="sm">
        <Paper elevation={8} sx={styles.card}>
          <Typography variant="h4" align="center" sx={styles.title}>
            Welcome Back
          </Typography>

          <Typography align="center" sx={styles.subtitle}>
            Sign in to continue
          </Typography>

          <form onSubmit={submit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              sx={styles.input}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              sx={styles.input}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={styles.loginBtn}
            >
              Login
            </Button>
          </form>

          <Typography align="center" sx={{ mt: 3 }}>
            Don’t have an account?
          </Typography>

          <Button
            variant="outlined"
            fullWidth
            sx={styles.registerBtn}
            onClick={() => navigate("/register")}
          >
            Register
          </Button>

          {message && (
            <Typography align="center" sx={styles.message}>
              {message}
            </Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to right, #56ab2f, #a8e063)",
  },
  card: {
    padding: 4,
    borderRadius: "15px",
    textAlign: "center",
  },
  title: {
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 1,
  },
  subtitle: {
    color: "#666",
    marginBottom: 2,
  },
  input: {
    mt: 3,
  },
  loginBtn: {
    mt: 4,
    py: 1.5,
    fontWeight: "bold",
    backgroundColor: "#56ab2f",
  },
  registerBtn: {
    mt: 1.5,
    py: 1.2,
    borderColor: "#56ab2f",
    color: "#56ab2f",
  },
  message: {
    mt: 3,
    fontWeight: "bold",
  },
};