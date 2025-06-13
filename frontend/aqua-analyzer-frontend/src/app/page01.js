'use client';

import { useEffect, useState } from 'react';

export default function AnalyzePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [frame, setFrame] = useState(null);
  const [totalFish, setTotalFish] = useState(0);
  const [speciesCount, setSpeciesCount] = useState({});
  const [geofenceCrossed, setGeofenceCrossed] = useState(false);

  const startAnalysis = async () => {
    setIsLoading(true);
    setFrame(null);
    setTotalFish(0);
    setSpeciesCount({});
    setGeofenceCrossed(false);

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.body) {
      console.error('No response body');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const messages = chunk
          .split('\n')
          .filter(line => line.startsWith('data: '))
          .map(line => line.replace('data: ', ''));

        messages.forEach(msg => {
          try {
            const parsed = JSON.parse(msg);
            if (parsed.frame !== undefined) setFrame(parsed.frame);
            if (parsed.total_fish !== undefined) setTotalFish(parsed.total_fish);
            if (parsed.species) setSpeciesCount(parsed.species);
            if (parsed.geofence_crossed !== undefined) setGeofenceCrossed(parsed.geofence_crossed);
          } catch (e) {
            console.warn('Could not parse JSON:', msg);
          }
        });
      }
    } catch (err) {
      console.error('Streaming error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 font-mono">
      <h1 className="text-2xl font-bold mb-6">🐟 AquaAnalyzer Live Monitor</h1>

      <button
        onClick={startAnalysis}
        disabled={isLoading}
        className="mb-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Analyzing...' : 'Start Analysis'}
      </button>

      {/* Main Layout: Flex Row */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Stats Card */}
        <div className="w-full lg:w-1/2 p-4 border rounded-lg bg-gray-50 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">📊 Live Stats</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Frame:</span>{' '}
              {frame !== null ? frame : '—'}
            </div>
            <div>
              <span className="font-medium">Total Fish:</span> {totalFish}
            </div>
            <div>
              <span className="font-medium">Geofence:</span>{' '}
              {geofenceCrossed ? (
                <span className="text-red-500 font-semibold">CROSSED</span>
              ) : (
                <span className="text-green-600">Safe</span>
              )}
            </div>
            <div>
              <span className="font-medium">Species:</span>
              <ul className="list-disc list-inside">
                {Object.keys(speciesCount).length === 0 && <li>—</li>}
                {Object.entries(speciesCount).map(([species, count]) => (
                  <li key={species}>
                    {species}: {count}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Video Feed */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-lg font-semibold mb-2">🎥 Live Video Feed</h2>
          <div className="border rounded overflow-hidden w-fit">
            <img
              src="http://127.0.0.1:5000/video_feed"
              alt="Live Video Stream"
              className="w-[720px] h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
