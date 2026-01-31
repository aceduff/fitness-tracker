import { useEffect, useRef, useState } from 'react';

export default function BarcodeScanner({ onScan, onError }) {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const html5QrCodeRef = useRef(null);

  async function loadCameras() {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);
      if (devices.length > 0) {
        // Default to last camera (usually higher-quality rear camera)
        setSelectedCamera(devices[devices.length - 1].id);
      }
    } catch (err) {
      onError('Could not access cameras. Please allow camera permission and reload.');
    }
  }

  useEffect(() => { loadCameras(); }, []);

  async function startScanner(cameraId) {
    const camToUse = cameraId || selectedCamera;
    if (!camToUse) {
      onError('No camera selected');
      return;
    }

    // Stop existing scanner if running
    await stopScanner();

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('barcode-reader');
      html5QrCodeRef.current = scanner;

      await scanner.start(
        camToUse,
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777
        },
        (decodedText) => {
          stopScanner();
          onScan(decodedText);
        },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      const msg = err?.message || String(err);
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        onError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (msg.includes('NotFound') || msg.includes('device')) {
        onError('No camera found on this device.');
      } else {
        onError('Could not start camera: ' + msg);
      }
    }
  }

  async function stopScanner() {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch {}
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  }

  async function handleCameraChange(e) {
    const newCameraId = e.target.value;
    setSelectedCamera(newCameraId);
    if (scanning) {
      await startScanner(newCameraId);
    }
  }

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  return (
    <div className="barcode-scanner">
      {cameras.length > 1 && (
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label>Camera</label>
          <select value={selectedCamera} onChange={handleCameraChange}>
            {cameras.map(cam => (
              <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cam.id}`}</option>
            ))}
          </select>
        </div>
      )}
      <div id="barcode-reader" ref={scannerRef}></div>
      {!scanning ? (
        <button type="button" onClick={() => startScanner()} className="btn btn-primary">
          Open Camera to Scan
        </button>
      ) : (
        <button type="button" onClick={stopScanner} className="btn btn-danger">
          Stop Scanner
        </button>
      )}
      <p className="scanner-hint">
        Point your camera at a product barcode
      </p>
    </div>
  );
}
