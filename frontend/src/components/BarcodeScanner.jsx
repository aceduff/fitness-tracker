import { useEffect, useRef, useState } from 'react';

export default function BarcodeScanner({ onScan, onError }) {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const html5QrCodeRef = useRef(null);

  async function loadCameras() {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);
      if (devices.length > 0) {
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

    await stopScanner();

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');

      const scanner = new Html5Qrcode('barcode-reader', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
        ],
        verbose: false
      });
      html5QrCodeRef.current = scanner;

      // Pass camera ID directly - do NOT pass videoConstraints.facingMode
      // as it overrides the specific camera selection
      await scanner.start(
        camToUse,
        {
          fps: 15,
          qrbox: { width: 300, height: 200 },
          disableFlip: false
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
        const state = html5QrCodeRef.current.getState();
        if (state === 2) { // SCANNING
          await html5QrCodeRef.current.stop();
        }
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

  function handleManualSubmit(e) {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
    }
  }

  // Cleanup on unmount (handles page navigation)
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().then(() => {
            html5QrCodeRef.current?.clear();
          }).catch(() => {});
        } catch {}
        html5QrCodeRef.current = null;
      }
    };
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
        Point your camera at a product barcode, or type the number below
      </p>
      <form onSubmit={handleManualSubmit} className="manual-barcode">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Enter barcode number"
          value={manualBarcode}
          onChange={e => setManualBarcode(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={!manualBarcode.trim()}>
          Look Up
        </button>
      </form>
    </div>
  );
}
