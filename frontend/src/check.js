import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  Grid
} from '@mui/material';

export default function CheckNPKImage() {
  const [data, setData] = useState({
    crop: '',
    temp: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });
  
  const [image, setImage] = useState('');
  const [filename, setFilename] = useState('');
  const [decoded, setDecoded] = useState('');

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

const handleGenerate = async () => {
  const { crop, temp, humidity, ph, rainfall } = data;

  if (!crop || !temp || !humidity || !ph || !rainfall) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await axios.get(`http://localhost:8000/get-npk-image/${crop}`, {
      params: {
        temp: parseFloat(temp),
        humidity: parseFloat(humidity),
        ph: parseFloat(ph),
        rainfall: parseFloat(rainfall)
      }
    });

    const imgPath = res.data.image;
    setImage(`http://localhost:8000/${imgPath}?t=${new Date().getTime()}`);
    setFilename(imgPath.split('/').pop());
    setDecoded('');
  } catch (err) {
    console.error(err.response?.data);
    alert("Error generating image. Check browser console (F12) for details.");
  }
};

  const handleDecode = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/decode/${filename}`);
      const formatted = res.data.hidden_data.replace(/,/g, "\n");
      setDecoded(formatted);
    } catch (err) {
      alert("Error decoding image");
    }
  };

  return (
    <Box sx={styles.page}>
      <Container maxWidth="sm">
        <Paper elevation={8} sx={styles.card}>
          <Typography variant="h5" sx={styles.title}>
             NPK Image Generator
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'gray' }}>
            Enter conditions to find specific NPK requirements
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="crop"
                label="Crop Name"
                fullWidth
                value={data.crop}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField name="temp" label="Temp (°C)" fullWidth onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField name="humidity" label="Humidity (%)" fullWidth onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField name="ph" label="pH Level" fullWidth onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField name="rainfall" label="Rainfall (mm)" fullWidth onChange={handleChange} />
            </Grid>
          </Grid>

          <Button
            variant="contained"
            fullWidth
            onClick={handleGenerate}
            sx={styles.btn}
          >
            Generate Stego Image
          </Button>

          {image && (
            <Box sx={{ mt: 3 }}>
              <img
                src={image}
                alt="result"
                style={{ width: '100%', borderRadius: '10px', border: '1px solid #ddd' }}
              />
              <Button
                variant="outlined"
                fullWidth
                onClick={handleDecode}
                sx={{ mt: 2 }}
              >
                Decode NPK Data
              </Button>
            </Box>
          )}

          {decoded && (
            <Paper sx={styles.resultBox}>
              <Typography sx={styles.resultText}>
                {decoded}
              </Typography>
            </Paper>
          )}
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
    background: 'linear-gradient(to right, #36d1dc, #5b86e5)',
    padding: '20px'
  },
  card: {
    padding: 4,
    borderRadius: '15px',
    textAlign: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#1a237e'
  },
  btn: {
    mt: 3,
    py: 1.5,
    fontWeight: 'bold',
    backgroundColor: '#1a237e'
  },
  resultBox: {
    mt: 3,
    p: 2,
    backgroundColor: '#f5f5f5',
    borderLeft: '5px solid #5b86e5'
  },
  resultText: {
    fontWeight: 'bold',
    whiteSpace: 'pre-line',
    textAlign: 'left'
  }
};
