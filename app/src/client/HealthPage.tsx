// src/client/HealthPage.tsx
import { useEffect, useState } from 'react';
import { healthAction } from 'wasp/client/operations';

export default function Health() {
  const [data, setData] = useState<string>('Loading...');

  useEffect(() => {
    healthAction()
      .then(result => setData(JSON.stringify(result, null, 2)))
      .catch(error => setData(`Error: ${error.message}`));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Health Check</h1>
      <pre>{data}</pre>
    </div>
  );
}
