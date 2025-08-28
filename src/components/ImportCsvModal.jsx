import { useState } from 'react';
import Papa from 'papaparse';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

function ImportCsvModal({ isOpen, onClose, onImportSuccess }) {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) {
            toast.warn("Please select a file first.");
            return;
        }
        setIsUploading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    // PapaParse data ko 'data' property mein deta hai
                    const products = results.data;
                    await api.post('/api/products/bulk', products);
                    toast.success(`${products.length} products imported successfully!`);
                    onImportSuccess(); // Product list ko refresh karne ke liye
                } catch (error) {
                    toast.error("Failed to import products.");
                } finally {
                    setIsUploading(false);
                    onClose(); // Modal band karen
                }
            }
        });
    };

    if (!isOpen) return null;

    return (
        <dialog open className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Import Products from CSV</h3>
                <p className="py-2 text-sm">
                    Upload a CSV file with the headers: 
                    <code className="text-info">name, sku, quantity, price, cost_price, description</code>.
                </p>
                <div className="form-control">
                    <a href="/sample-products.csv" download className="link link-primary text-sm mb-4">Download Sample CSV Template</a>
                    <input type="file" accept=".csv" onChange={handleFileChange} className="file-input file-input-bordered w-full" />
                </div>
                <div className="modal-action">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleUpload} disabled={isUploading}>
                        {isUploading ? <span className="loading loading-spinner"></span> : "Upload & Import"}
                    </button>
                </div>
            </div>
        </dialog>
    );
}

export default ImportCsvModal;