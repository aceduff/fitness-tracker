import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import BarcodeScanner from '../components/BarcodeScanner.jsx';
import * as api from '../api.js';
import { card, alertError, alertSuccess, btnPrimary, btnDanger, btn, input, select } from '../styles.js';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function AddMeal() {
  const today = new Date().toISOString().split('T')[0];
  const [mode, setMode] = useState('manual');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState('snack');
  const [date, setDate] = useState(today);

  const [scannedProduct, setScannedProduct] = useState(null);
  const [servings, setServings] = useState(1);
  const [barcodeMealType, setBarcodeMealType] = useState('snack');
  const [scannerError, setScannerError] = useState('');

  const [favorites, setFavorites] = useState([]);
  const [favServings, setFavServings] = useState({});
  const [macros, setMacros] = useState(null);

  // Dynamic pie chart primary color from palette
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');

  useEffect(() => {
    function updateColor() {
      const color = getComputedStyle(document.documentElement).getPropertyValue('--palette-primary').trim();
      if (color) setPrimaryColor(color);
    }
    updateColor();
    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-palette', 'class'] });
    return () => observer.disconnect();
  }, []);

  const PIE_COLORS = [primaryColor, '#f59e0b', '#ef4444'];

  useEffect(() => { loadFavoritesAndMacros(); }, []);

  async function loadFavoritesAndMacros() {
    try {
      const [favRes, macroRes] = await Promise.all([
        api.getFavorites(),
        api.getMacros()
      ]);
      setFavorites(favRes.favorites);
      setMacros(macroRes);
      const initial = {};
      favRes.favorites.forEach(f => { initial[f.id] = f.default_servings || 1; });
      setFavServings(initial);
    } catch {}
  }

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
        meal_type: mealType,
        servings: 1,
        date
      });
      setSuccess('Meal added!');
      setName(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
      setTimeout(() => setSuccess(''), 2000);
      loadFavoritesAndMacros();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAsFavorite() {
    if (!name || !calories) return;
    setError('');
    try {
      await api.addFavorite({
        name,
        calories: parseInt(calories),
        protein: protein ? parseFloat(protein) : undefined,
        carbs: carbs ? parseFloat(carbs) : undefined,
        fat: fat ? parseFloat(fat) : undefined,
        default_servings: 1
      });
      setSuccess('Saved to favorites!');
      setTimeout(() => setSuccess(''), 2000);
      loadFavoritesAndMacros();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddFavorite(fav) {
    setError('');
    setLoading(true);
    const s = favServings[fav.id] || 1;
    try {
      await api.addMeal({
        name: fav.name,
        calories: Math.round(fav.calories * s),
        protein: fav.protein ? Math.round(fav.protein * s * 10) / 10 : undefined,
        carbs: fav.carbs ? Math.round(fav.carbs * s * 10) / 10 : undefined,
        fat: fav.fat ? Math.round(fav.fat * s * 10) / 10 : undefined,
        serving_size: fav.serving_size,
        servings: s,
        meal_type: mealType,
        date
      });
      setSuccess(`${fav.name} added!`);
      setTimeout(() => setSuccess(''), 2000);
      loadFavoritesAndMacros();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFavorite(id) {
    try {
      await api.deleteFavorite(id);
      loadFavoritesAndMacros();
    } catch (err) {
      setError(err.message);
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
        meal_type: barcodeMealType,
        date
      });
      setSuccess('Meal added from barcode!');
      setScannedProduct(null);
      setServings(1);
      setTimeout(() => setSuccess(''), 2000);
      loadFavoritesAndMacros();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function buildPieData(data) {
    if (!data) return [];
    const total = data.protein + data.carbs + data.fat;
    if (total === 0) return [];
    return [
      { name: 'Protein', value: data.protein },
      { name: 'Carbs', value: data.carbs },
      { name: 'Fat', value: data.fat }
    ];
  }

  const recentPie = macros ? buildPieData(macros.recent) : [];
  const weeklyPie = macros ? buildPieData(macros.weekly) : [];

  const tabBase = 'px-4 py-2 border border-[var(--palette-border)] rounded-lg bg-[var(--palette-card)] text-sm cursor-pointer transition-colors';
  const tabActive = `${tabBase} bg-[var(--palette-primary)] text-white border-[var(--palette-primary)]`;
  const tabInactive = `${tabBase} text-[var(--palette-text)] hover:bg-[var(--palette-bg)]`;

  const mealTabBase = 'flex-1 px-2 py-1.5 border border-[var(--palette-border)] rounded-lg text-sm capitalize cursor-pointer transition-colors';
  const mealTabActive = `${mealTabBase} bg-[var(--palette-primary)] text-white border-[var(--palette-primary)]`;
  const mealTabInactive = `${mealTabBase} bg-[var(--palette-card)] text-[var(--palette-text)] hover:bg-[var(--palette-bg)]`;

  return (
    <div className="animate-[fadeIn_0.2s_ease]">
      <h1 className="mb-4 text-2xl font-bold">Meals</h1>
      {error && <div className={alertError}>{error}</div>}
      {success && <div className={alertSuccess}>{success}</div>}

      {/* MACRO PIE CHARTS */}
      {macros && (recentPie.length > 0 || weeklyPie.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {recentPie.length > 0 && (
            <div className={card}>
              <h3 className="mb-3 text-base font-semibold">Last 5 Meals - Macros</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={recentPie} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}g`}>
                    {recentPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {weeklyPie.length > 0 && (
            <div className={card}>
              <h3 className="mb-3 text-base font-semibold">Last 7 Days - Macros</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={weeklyPie} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}g`}>
                    {weeklyPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* FAVORITES */}
      {favorites.length > 0 && (
        <div className={card}>
          <h3 className="mb-3 text-base font-semibold">Favorites</h3>
          <ul className="flex flex-col gap-2">
            {favorites.map(fav => (
              <li key={fav.id} className="flex items-center justify-between flex-wrap gap-2 p-2 px-3 border border-[var(--palette-border)] rounded-lg text-sm">
                <div className="flex flex-col gap-0.5">
                  <strong>{fav.name}</strong>
                  <span className="text-xs text-[var(--palette-text-muted)]">{fav.calories} cal{fav.serving_size ? ` / ${fav.serving_size}` : ''}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={favServings[fav.id] ?? 1}
                    onChange={e => setFavServings(prev => ({ ...prev, [fav.id]: parseFloat(e.target.value) || 1 }))}
                    className="w-14 px-1.5 py-0.5 border border-[var(--palette-border)] rounded-lg text-sm text-center bg-[var(--palette-card)] text-[var(--palette-text)]"
                    title="Servings"
                  />
                  <button onClick={() => handleAddFavorite(fav)} className="px-2 py-1 rounded-lg bg-[var(--palette-primary)] text-white text-xs hover:bg-[var(--palette-primary-hover)] transition-colors">Add</button>
                  <button onClick={() => handleRemoveFavorite(fav.id)} className={btnDanger}>X</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-1 mb-4">
        <button
          className={mode === 'manual' ? tabActive : tabInactive}
          onClick={() => { setMode('manual'); setScannedProduct(null); setScannerError(''); }}
        >
          Manual Entry
        </button>
        <button
          className={mode === 'barcode' ? tabActive : tabInactive}
          onClick={() => setMode('barcode')}
        >
          Barcode Scan
        </button>
      </div>

      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} className={card}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Meal Type</label>
            <div className="flex gap-1">
              {MEAL_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  className={mealType === t ? mealTabActive : mealTabInactive}
                  onClick={() => setMealType(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Food Name *</label>
            <input className={input} value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Calories *</label>
            <input className={input} type="number" min="0" value={calories} onChange={e => setCalories(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Protein (g)</label>
              <input className={input} type="number" min="0" step="0.1" value={protein} onChange={e => setProtein(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Carbs (g)</label>
              <input className={input} type="number" min="0" step="0.1" value={carbs} onChange={e => setCarbs(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Fat (g)</label>
              <input className={input} type="number" min="0" step="0.1" value={fat} onChange={e => setFat(e.target.value)} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Date</label>
            <input className={input} type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="flex gap-2 mt-3">
            <button type="submit" className={`${btnPrimary} flex-1`} disabled={loading}>
              {loading ? 'Adding...' : 'Add Meal'}
            </button>
            <button type="button" className={btn} onClick={handleSaveAsFavorite} disabled={!name || !calories}>
              Save to Favorites
            </button>
          </div>
        </form>
      )}

      {mode === 'barcode' && !scannedProduct && (
        <div className={card}>
          {scannerError && <div className={alertError}>{scannerError}</div>}
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onError={(msg) => setScannerError(msg)}
          />
          {loading && <p className="text-center p-8 text-[var(--palette-text-muted)]">Looking up product...</p>}
        </div>
      )}

      {mode === 'barcode' && scannedProduct && (
        <div className={card}>
          <h3 className="mb-3 text-base font-semibold">{scannedProduct.name}</h3>
          {scannedProduct.brand && <p className="text-[var(--palette-text-muted)] text-sm">{scannedProduct.brand}</p>}
          {scannedProduct.serving_size && <p className="text-[var(--palette-text-muted)] text-sm">Serving: {scannedProduct.serving_size}</p>}

          <div className="mb-4 mt-3">
            <label className="block text-sm font-medium mb-1">Meal Type</label>
            <div className="flex gap-1">
              {MEAL_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  className={barcodeMealType === t ? mealTabActive : mealTabInactive}
                  onClick={() => setBarcodeMealType(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Number of Servings</label>
            <input
              className={input}
              type="number"
              min="0.1"
              step="0.1"
              value={servings}
              onChange={e => setServings(parseFloat(e.target.value) || 1)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4">
            <div className="text-center p-2 bg-[var(--palette-bg)] rounded-lg">
              <span className="block text-[0.7rem] text-[var(--palette-text-muted)] uppercase">Calories</span>
              <span className="block text-lg font-bold">{Math.round(scannedProduct.calories * servings)}</span>
            </div>
            <div className="text-center p-2 bg-[var(--palette-bg)] rounded-lg">
              <span className="block text-[0.7rem] text-[var(--palette-text-muted)] uppercase">Protein</span>
              <span className="block text-lg font-bold">{(scannedProduct.protein * servings).toFixed(1)}g</span>
            </div>
            <div className="text-center p-2 bg-[var(--palette-bg)] rounded-lg">
              <span className="block text-[0.7rem] text-[var(--palette-text-muted)] uppercase">Carbs</span>
              <span className="block text-lg font-bold">{(scannedProduct.carbs * servings).toFixed(1)}g</span>
            </div>
            <div className="text-center p-2 bg-[var(--palette-bg)] rounded-lg">
              <span className="block text-[0.7rem] text-[var(--palette-text-muted)] uppercase">Fat</span>
              <span className="block text-lg font-bold">{(scannedProduct.fat * servings).toFixed(1)}g</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Date</label>
            <input className={input} type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>

          <div className="flex gap-2 mt-3">
            <button onClick={handleBarcodeSubmit} className={btnPrimary} disabled={loading}>
              {loading ? 'Adding...' : 'Add to Meals'}
            </button>
            <button onClick={() => { setScannedProduct(null); setScannerError(''); }} className={btn}>
              Scan Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
