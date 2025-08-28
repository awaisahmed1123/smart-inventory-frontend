import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

// Yeh component 'onScanSuccess' naam ka function lega
// Jab scan kamyab hoga, to yeh function call karega
function BarcodeScanner({ onScanSuccess }) {

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('modal-reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    const success = (result) => {
      // Kamyab scan ke baad, result ko wapas bhejo
      onScanSuccess(result);
    };

    const error = (err) => {
      // Error ko ignore karen
    };

    scanner.render(success, error);

    // Cleanup function
    return () => {
      // Check karen ke scanner element mojood hai ya nahi
      if (document.getElementById('modal-reader')) {
          scanner.clear().catch(error => console.error("Scanner cleanup failed.", error));
      }
    };
  }, [onScanSuccess]);

  return (
    <div id="modal-reader" style={{ width: '100%' }}></div>
  );
}

export default BarcodeScanner;