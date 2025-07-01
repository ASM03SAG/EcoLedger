import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './AuthenticateCredit.css';

const AuthenticateCredit = () => {
  const [formData, setFormData] = useState({
    creditId: 'AUTO-GEN-00123',
    ipfsCID: 'QmABC123XYZ...',
    owner: 'user123',
    score: '',
    registry: 'Verra',
    registryLink: '',
    projectType: '',
  });

  const [output, setOutput] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOutput(JSON.stringify(formData, null, 2));
  };

  return (
    <div className="auth-container">
      <motion.h2
        className="auth-title"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Authenticate Carbon Credit
      </motion.h2>

      <motion.form
        className="auth-form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {[
          { label: 'Credit ID', id: 'creditId', readOnly: true },
          { label: 'IPFS CID', id: 'ipfsCID', readOnly: true },
          { label: 'Owner', id: 'owner', readOnly: true },
          { label: 'Carbonmark Score', id: 'score', type: 'number', min: 0, max: 100 },
          { label: 'Registry', id: 'registry' },
          { label: 'Registry Link', id: 'registryLink', type: 'url', placeholder: 'https://registry.verra.org/...' },
          { label: 'Project Type', id: 'projectType', placeholder: 'Renewable Energy' },
        ].map(({ label, id, ...rest }) => (
          <div className="form-group" key={id}>
            <label htmlFor={id}>{label}</label>
            <input
              id={id}
              value={formData[id]}
              onChange={handleChange}
              {...rest}
              required={!rest.readOnly}
            />
          </div>
        ))}

        <button type="submit">Authenticate</button>
      </motion.form>

      {output && (
        <motion.pre
          className="auth-output"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {output}
        </motion.pre>
      )}
    </div>
  );
};

export default AuthenticateCredit;
