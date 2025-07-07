import React from 'react';

const ApiDocs = () => (
  <div className="max-w-3xl mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-4">CEA Rainfall Tracker API Documentation</h1>
    <p className="mb-6 text-gray-700">
      Use your API key to access rainfall data programmatically. Include your API key in the <code className="bg-gray-100 px-1 rounded">x-api-key</code> header for each request.
    </p>

    <h2 className="text-xl font-semibold mt-6 mb-2">Authentication</h2>
    <p className="mb-4 text-gray-700">
      Include your API key in the <code className="bg-gray-100 px-1 rounded">x-api-key</code> header:
    </p>
    <pre className="bg-gray-100 p-2 rounded mb-4 text-sm overflow-x-auto">
GET /api/rainfall/all
x-api-key: YOUR_API_KEY_HERE
    </pre>

    <h2 className="text-xl font-semibold mt-6 mb-2">Endpoints</h2>
    <ul className="list-disc ml-6 mb-6 text-gray-700">
      <li>
        <strong>All rainfall data:</strong>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">GET /api/rainfall/all</pre>
      </li>
      <li>
        <strong>Rainfall for a specific day (all locations):</strong>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">GET /api/rainfall/day/2023-10-01</pre>
      </li>
      <li>
        <strong>Rainfall for a specific location (all days):</strong>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">GET /api/rainfall/location/Erean</pre>
      </li>
      <li>
        <strong>Rainfall for a specific location and day:</strong>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">GET /api/rainfall/Erean/2023-10-01</pre>
      </li>
      <li>
        <strong>List of available areas:</strong>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">GET /api/areas</pre>
      </li>
      <li>
        <strong>System statistics:</strong>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">GET /api/stats</pre>
      </li>
    </ul>

    <h2 className="text-xl font-semibold mt-6 mb-2">Example Request (fetch)</h2>
    <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
{`fetch('http://localhost:5001/api/rainfall/all', {
  headers: {
    'x-api-key': 'YOUR_API_KEY_HERE'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));`}
    </pre>

    <h2 className="text-xl font-semibold mt-6 mb-2">Notes</h2>
    <ul className="list-disc ml-6 text-gray-700">
      <li>Do <strong>not</strong> share your API key publicly.</li>
      <li>Normal users <strong>cannot</strong> add, edit, or delete rainfall data.</li>
      <li>All requests are logged (IP, user-agent, date, time).</li>
      <li>Contact support if you need to regenerate your API key.</li>
    </ul>
  </div>
);

export default ApiDocs; 