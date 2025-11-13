import React from 'react';

// All 8 algorithm options
const ALGORITHMS = [
  'FCFS',
  'SJF (Non-Preemptive)',
  'SJF (Preemptive)',
  'Priority (Non-Preemptive)',
  'Priority (Preemptive)',
  'Round Robin (RR)',
  'Multilevel Queue (MLQ)',
  'Multilevel Feedback Queue (MLFQ)',
];

export default function Controls({
  selectedAlgorithm,
  setSelectedAlgorithm,
  timeQuantum,
  setTimeQuantum,
  onRun,
}) {
  const showTimeQuantum = selectedAlgorithm === 'Round Robin (RR)';

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="algorithm-select"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Select Algorithm
        </label>
        <select
          id="algorithm-select"
          value={selectedAlgorithm}
          onChange={(e) => setSelectedAlgorithm(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ALGORITHMS.map((algo) => (
            <option key={algo} value={algo}>
              {algo}
            </option>
          ))}
        </select>
      </div>

      {/* DYNAMIC INPUT: Show Time Quantum only for Round Robin */}
      {showTimeQuantum && (
        <div className="animate-fade-in">
          <label
            htmlFor="time-quantum"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Time Quantum (ms)
          </label>
          <input
            type="number"
            id="time-quantum"
            value={timeQuantum}
            onChange={(e) => setTimeQuantum(Number(e.target.value))}
            min="1"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <button
        onClick={onRun}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        Run Simulation
      </button>
    </div>
  );
}

// Add this to your `tailwind.config.js` for the fade-in animation:
/*
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
*/