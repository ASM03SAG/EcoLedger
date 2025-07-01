import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './UploadCert.css';

const UploadCert = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsLoading(true);
    setOutput('');
    setRedirecting(false);

    // Simulate file upload + redirecting
    setTimeout(() => {
      setIsLoading(false);
      setOutput(`✅ File "${selectedFile.name}" uploaded successfully.`);

      setTimeout(() => {
        setRedirecting(true);
        navigate("/authentication"); // 👈 Make sure this matches your actual route name
      }, 2000);
    }, 2000);
  };

  return (
    <div className="upload-container">
      <motion.h2
        className="upload-title"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        Upload Carbon Certificate
      </motion.h2>

      <motion.form
        className="upload-form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <label htmlFor="certificate" className="file-label">
          <input
            type="file"
            id="certificate"
            accept=".pdf"
            onChange={handleFileChange}
            required
          />
          {selectedFile ? selectedFile.name : 'Choose PDF file'}
        </label>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
      </motion.form>

      {isLoading && (
        <motion.div
          className="upload-spinner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="spinner" />
          <p>Uploading file, please wait...</p>
        </motion.div>
      )}

      {output && (
        <motion.div
          className="upload-output"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {output}
        </motion.div>
      )}

      {redirecting && (
        <motion.div
          className="redirecting-box"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Redirecting to authentication. Please wait...
        </motion.div>
      )}
    </div>
  );
};

export default UploadCert;
