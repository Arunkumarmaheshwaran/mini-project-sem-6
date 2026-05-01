import React, { useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";

export default function Predict() {

  const [soil, setSoil] = useState({
    N: '', P: '', K: '', ph: '',
    temperature: '', humidity: '', rainfall: ''
  });

  const [crop, setCrop] = useState('');
  const [error, setError] = useState('');
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [modelData, setModelData] = useState([]);
  const [metricData, setMetricData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [predictionGraph, setPredictionGraph] = useState([]);

  const handleChange = (e) => {
    setSoil({ ...soil, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    setImage(e.target.files[0]);
  };

  const extractText = async () => {
    setError('');
    setOcrText('');

    if (!image) {
      setError("Please upload image first");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("file", image);

      const response = await axios.post("http://localhost:8000/ocr", fd);
      const text = response.data.text || "";
      setOcrText(text);

      const values = {
        N: extractNumber(text, ["N"]),
        P: extractNumber(text, ["P"]),
        K: extractNumber(text, ["K"]),
        ph: extractNumber(text, ["ph", "pH"]),
        temperature: extractNumber(text, ["temp", "temperature"]),
        humidity: extractNumber(text, ["humidity"]),
        rainfall: extractNumber(text, ["rain", "rainfall"]),
      };

      setSoil(values);
    } catch (err) {
      setError("OCR extraction failed");
    }
  };

  const extractNumber = (text, keys) => {
    for (let key of keys) {
      const regex = new RegExp(`${key}\\s*:?\\s*(\\d+(\\.\\d+)?)`, "i");
      const match = text.match(regex);
      if (match) return match[1];
    }
    return "";
  };

  const submitData = async () => {
    setError('');
    setCrop('');
    setModelData([]);
    setMetricData([]);
    setComparisonData([]);
    setPredictionGraph([]);

    if (Object.values(soil).some(v => v === '')) {
      setError("Please fill all fields");
      return;
    }

    try {
      const formattedSoil = Object.fromEntries(
        Object.entries(soil).map(([k, v]) => [k, Number(v)])
      );

      const res = await axios.post('http://localhost:8000/upload/data', formattedSoil);

      setCrop(res.data.prediction);

      if (res.data.probabilities) {
        setPredictionGraph(
          Object.entries(res.data.probabilities).map(([name, prob]) => ({
            name, probability: prob
          }))
        );
      } else {
        setPredictionGraph([{ name: res.data.prediction, probability: 1 }]);
      }

      if (res.data.model_accuracy) {
        setModelData(
          Object.entries(res.data.model_accuracy).map(([name, acc]) => ({
            name, accuracy: acc
          }))
        );
      }

      if (res.data.metrics) {
        setMetricData(
          Object.entries(res.data.metrics).map(([name, val]) => ({
            name: name.toUpperCase(), value: val
          }))
        );
      }

      if (res.data.comparison_metrics) {
        setComparisonData(
          Object.entries(res.data.comparison_metrics).map(([model, metrics]) => ({
            model, ...metrics
          }))
        );
      }

    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

 return (
  <div style={styles.container}>
    {/* 1. THE INPUT CARD (Remains narrow) */}
    <div style={styles.card}>
      <h2>Crop Prediction</h2>

      {["N", "P", "K", "ph", "temperature", "humidity", "rainfall"].map((field) => (
        <input
          key={field}
          name={field}
          placeholder={field.toUpperCase()}
          value={soil[field]}
          onChange={handleChange}
          style={styles.input}
        />
      ))}

      <input type="file" accept="image/*" onChange={handleImage} style={{marginTop:'10px'}} />
      <button onClick={extractText} style={styles.ocrBtn}>Extract from Image</button>
      
      {ocrText && <textarea value={ocrText} readOnly style={styles.textArea} />}

      <button onClick={submitData} style={styles.button}>Predict</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {crop && (
        <div style={{marginTop: '20px'}}>
          <h3>🌾 Recommended Crop:</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>{crop}</p>
        </div>
      )}
    </div> {/* --- END OF CARD --- */}

    {/* 2. THE PARALLEL GRAPHS (Sits outside the card to be wider) */}
    {crop && (
      <div style={styles.graphRow}>
        
        {predictionGraph.length > 0 && (
          <div style={styles.graphItem}>
            <h4>Probabilities</h4>
            <BarChart width={280} height={220} data={predictionGraph}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="probability" fill="#ff7300" />
            </BarChart>
          </div>
        )}

        {modelData.length > 0 && (
          <div style={styles.graphItem}>
            <h4>Model Accuracy</h4>
            <BarChart width={280} height={220} data={modelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#82ca9d" />
            </BarChart>
          </div>
        )}

        {metricData.length > 0 && (
          <div style={styles.graphItem}>
            <h4>Performance</h4>
            <BarChart width={280} height={220} data={metricData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </div>
        )}

      </div>
    )}
  </div>
);
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column', 
    alignItems: 'center',
    padding: '40px 20px',
    background: 'linear-gradient(to right, #a8e063, #56ab2f)',
  },
  card: {
    background: '#fff',
    padding: '30px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    textAlign: 'center',
    marginBottom: '20px'
  },
  graphRow: {
    display: 'flex',          
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '15px',
    width: '100%',
    maxWidth: '1000px'       
  },
  graphItem: {
    background: '#fff',
    padding: '15px',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  input: { width: '100%', padding: '10px', margin: '6px 0', boxSizing: 'border-box' },
  button: { marginTop: '10px', padding: '10px', width: '100%', background: '#56ab2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  ocrBtn: { marginTop: '10px', padding: '10px', width: '100%', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  textArea: { width: '100%', height: '80px', marginTop: '10px' }
};
