import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BarcodeScanner from '../components/BarcodeScanner.jsx';
import * as api from '../api.js';

export default function AddMeal() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const [mode, setMode] = useState('manual'); // 'manual' or 'barcode'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Manual entry state
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [date, setDate] = useState(today);

  // Barcode state
  const [scannedProduct, setScannedProduct] = useState(null);
  const [servings, setServings] = useState(1);
  const [scannerError, setScannerError] = useState('');

  async function handleManualSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.addMeal({
        name,
        calories: parseInt(calories),
        protein: protein ? parseFloat(protein) : undefined,
        carbs: carbs ? parseFloat(carbs) : undefined,
        fat: fat ? parseFloat(fat) : undefined,
        servings: 1,
        date
      });
      setSuccess('Meal added!');
      setName(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBarcodeScan(barcode) {
    setError('');
    setScannerError('');
    setLoading(true);
    try {
      const data = await api.lookupBarcode(barcode);
      setScannedProduct(data.product);
      setServings(1);
    } catch (err) {
      if (err.message === 'Product not found') {
        setScannerError(`Barcode "${barcode}" was not found in the Open Food Facts database. This product may not be listed. Try a different product or use manual entry.`);
      } else {
        setScannerError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleBarcodeSubmit() {
    if (!scannedProduct) return;
    setError('');
    setLoading(true);
    try {
      await api.addMeal({
        name: scannedProduct.name,
        calories: Math.round(scannedProduct.calories * servings),
        protein: Math.round(scannedProduct.protein * servings * 10) / 10,
        carbs: Math.round(scannedProduct.carbs * servings * 10) / 10,
        fat: Math.round(scannedProduct.fat * servings * 10) / 10,
        serving_size: scannedProduct.serving_size,
        servings,
        date
      });
      setSuccess('Meal added from barcode!');
      setScannedProduct(null);
      setServings(1);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Add Meal</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="tab-bar">
        <button
          className={`tab ${mode === 'manual' ? 'active' : ''}`}
          onClick={() => { setMode('manual'); setScannedProduct(null); setScannerError(''); }}
        >
          Manual Entry
        </button>
        <button
          className={`tab ${mode === 'barcode' ? 'active' : ''}`}
          onClick={() => setMode('barcode')}
        >
          Barcode Scan
        </button>
      </div>

      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="card">
          <div className="form-group">
            <label>Food Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Calories *</label>
            <input type="number" min="0" value={calories} onChange={e => setCalories(e.target.value)} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Protein (g)</label>
              <input type="number" min="0" step="0.1" value={protein} onChange={e => setProtein(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Carbs (g)</label>
              <input type="number" min="0" step="0.1" value={carbs} onChange={e => setCarbs(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Fat (g)</label>
              <input type="number" min="0" step="0.1" value={fat} onChange={e => setFat(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Adding...' : 'Add Meal'}
          </button>
        </form>
      )}

      {mode === 'barcode' && !scannedProduct && (
        <div className="card">
          {scannerError && <div className="alert alert-error">{scannerError}</div>}
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onError={(msg) => setScannerError(msg)}
          />
          {loading && <p className="loading">Looking up product...</p>}
        </div>
      )}

      {mode === 'barcode' && scannedProduct && (
        <div className="card">
          <h3>{scannedProduct.name}</h3>
          {scannedProduct.brand && <p className="text-muted">{scannedProduct.brand}</p>}
          {scannedProduct.serving_size && <p className="text-muted">Serving: {scannedProduct.serving_size}</p>}

          <div className="form-group">
            <label>Number of Servings</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={servings}
              onChange={e => setServings(parseFloat(e.target.value) || 1)}
            />
          </div>

          <div className="nutrition-grid">
            <div className="nutrition-item">
              <span className="nutrition-label">Calories</span>
              <span className="nutrition-value">{Math.round(scannedProduct.calories * servings)}</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">Protein</span>
              <span className="nutrition-value">{(scannedProduct.protein * servings).toFixed(1)}g</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">Carbs</span>
              <span className="nutrition-value">{(scannedProduct.carbs * servings).toFixed(1)}g</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">Fat</span>
              <span className="nutrition-value">{(scannedProduct.fat * servings).toFixed(1)}g</span>
            </div>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>

          <div className="button-row">
            <button onClick={handleBarcodeSubmit} className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add to Meals'}
            </button>
            <button onClick={() => { setScannedProduct(null); setScannerError(''); }} className="btn">
              Scan Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
