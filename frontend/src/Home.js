import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🌾 Smart Agriculture</h1>
        <p style={styles.subtitle}>Choose an option below</p>

        <button style={styles.button} onClick={() => navigate('/predict')}>
           Predict Crop
        </button>

        <button style={styles.button} onClick={() => navigate('/check')}>
           Check Crop Condition
        </button>

        <button style={styles.secondaryButton} onClick={() => navigate('/dashboard')}>
           Go to Dashboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(to right, #56ab2f, #a8e063)',
  },
  card: {
    background: '#fff',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    textAlign: 'center',
    width: '320px'
  },
  title: {
    marginBottom: '10px',
    color: '#2e7d32'
  },
  subtitle: {
    marginBottom: '25px',
    color: '#666'
  },
  button: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    borderRadius: '8px',
    border: 'none',
    background: '#56ab2f',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s'
  },
  secondaryButton: {
    width: '100%',
    padding: '10px',
    marginTop: '15px',
    borderRadius: '8px',
    border: '2px solid #56ab2f',
    background: '#fff',
    color: '#56ab2f',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};