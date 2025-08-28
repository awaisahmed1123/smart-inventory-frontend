import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../api/axiosConfig';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiInfo, FiEdit, FiRefreshCw, FiDollarSign, FiArchive } from 'react-icons/fi';

function Scanner() {
  const [scanResult, setScanResult] = useState(null);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (scanResult || isLoading) return;

    // html5-qrcode library ko safe tareeqe se access karna
    let scanner;
    if (document.getElementById('reader')) {
      scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 250, height: 250 },
        fps: 5,
        supportedScanTypes: [0] // 0 for camera
      });

      const success = (result) => {
        setIsLoading(true);
        scanner.clear().catch(err => console.error("Scanner clear failed.", err));
        setScanResult(result);
        fetchProductBySku(result);
      };

      const error = (err) => { /* Ignore errors */ };
      scanner.render(success, error);
    }
    
    return () => {
      if (scanner && scanner.getState() === 2) { // 2 means SCANNING state
          scanner.clear().catch(err => console.error("Scanner cleanup failed.", err));
      }
    };
  }, [scanResult, isLoading]);

  const fetchProductBySku = async (sku) => {
    try {
      const response = await api.get(`/api/products?sku=${sku}`);
      if (response.data.length > 0) {
        setProduct(response.data[0]);
        setError('');
      } else {
        setProduct(null);
        setError(`Product with SKU "${sku}" not found in your inventory.`);
      }
    } catch (err) {
      setProduct(null);
      setError('Failed to fetch product. Please check your connection.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleRescan = () => {
    setScanResult(null);
    setProduct(null);
    setError('');
    setIsLoading(false);
  }

  const renderResult = () => {
      if (isLoading) {
          return <span className="loading loading-dots loading-lg"></span>;
      }
      if (product) {
          return (
              <div className="card w-full max-w-md bg-base-200 text-base-content shadow-lg animate-fade-in">
                  <div className="card-body">
                      <div className="flex items-center gap-4">
                          <FiCheckCircle className="text-success w-12 h-12"/>
                          <div>
                              <h2 className="card-title text-2xl">{product.name}</h2>
                              <p className="text-success font-bold">Product Found!</p>
                          </div>
                      </div>
                      <div className="divider"></div>
                      <div className="space-y-2 text-left text-lg">
                          <p className="flex items-center gap-2"><FiDollarSign/> <strong>Price:</strong> Rs. {product.price}</p>
                          <p className="flex items-center gap-2"><FiArchive/> <strong>Stock:</strong> {product.quantity} units</p>
                      </div>
                      <div className="card-actions justify-end mt-4">
                          <Link to={`/products?edit=${product.id}`} className="btn btn-outline">
                              <FiEdit/> Edit Product
                          </Link>
                      </div>
                  </div>
              </div>
          );
      }
      if (error) {
          return (
              <div className="card w-full max-w-md bg-error text-error-content shadow-lg animate-fade-in">
                  <div className="card-body">
                      <div className="flex items-center gap-4">
                          <FiXCircle className="w-12 h-12"/>
                          <div>
                              <h2 className="card-title text-2xl">Error</h2>
                              <p>{error}</p>
                          </div>
                      </div>
                  </div>
              </div>
          );
      }
      return null;
  };

  return (
    <div className="card w-full max-w-2xl mx-auto bg-base-100 shadow-xl">
      <div className="card-body items-center text-center">
        <h1 className="card-title text-3xl font-bold mb-4 font-display">Barcode Scanner</h1>
        
        {scanResult ? (
          <div className='flex flex-col items-center gap-6 w-full'>
            {renderResult()}
            <button onClick={handleRescan} className="btn btn-primary btn-lg mt-4" disabled={isLoading}>
              <FiRefreshCw/> Scan Again
            </button>
          </div>
        ) : (
          <>
            {/* VVIP Scanner Frame */}
            <div className="relative w-72 h-72 rounded-lg overflow-hidden border-2 border-dashed border-base-300 p-2 my-4">
                <div id="reader" className="w-full h-full"></div>
                {/* Corner Brackets for VVIP Look */}
                <div className="absolute top-0 left-0 border-l-4 border-t-4 border-primary h-8 w-8"></div>
                <div className="absolute top-0 right-0 border-r-4 border-t-4 border-primary h-8 w-8"></div>
                <div className="absolute bottom-0 left-0 border-l-4 border-b-4 border-primary h-8 w-8"></div>
                <div className="absolute bottom-0 right-0 border-r-4 border-b-4 border-primary h-8 w-8"></div>
            </div>
            {/* VVIP Instructions Box */}
            <div className="alert bg-base-200 text-base-content/80 text-left">
              <FiInfo className="stroke-info shrink-0 w-6 h-6"/>
              <span>
                <h3 className='font-bold'>How to Use:</h3>
                <ul className='list-disc list-inside text-sm'>
                  <li>Center a product's barcode inside the scanning box.</li>
                  <li>Ensure good lighting for quick detection.</li>
                  <li>The system will automatically find the product.</li>
                </ul>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Scanner;

// Note: Aapko apni main CSS file (jaise index.css) mein
// yeh choti si animation class add karni hogi:
/*
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
*/