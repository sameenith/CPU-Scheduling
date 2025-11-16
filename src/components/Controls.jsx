import React from "react";

// All 8 algorithm options
const ALGORITHMS = [
  "FCFS",
  "SJF (Non-Preemptive)",
  "SJF (Preemptive)",
  "Priority (Non-Preemptive)",
  "Priority (Preemptive)",
  "Round Robin (RR)",
  "Multilevel Queue (MLQ)",
  "Multilevel Feedback Queue (MLFQ)",
];

export default function Controls({
  selectedAlgorithm,
  setSelectedAlgorithm,
  timeQuantum,
  setTimeQuantum,
  onRun, // This will be for "Instant Result"
  onVisualize, // This is for our new "Animation"
  onReset, // To clear the simulation
  isVisualizing, // To disable buttons
}) {
  const showTimeQuantum =
    selectedAlgorithm === "Round Robin (RR)" ||
    selectedAlgorithm === "Multilevel Queue (MLQ)" ||
    selectedAlgorithm === "Multilevel Feedback Queue (MLFQ)";

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
          disabled={isVisualizing}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {ALGORITHMS.map((algo) => (
            <option key={algo} value={algo}>
              {algo}
            </option>
          ))}
        </select>
      </div>

      {/* DYNAMIC INPUT: Show Time Quantum only for RR MLQ and MLFQ */}
      {showTimeQuantum && (
        <div className="animate-fade-in">
          {/* 👇 This is the part I filled in 👇 */}
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
            disabled={isVisualizing}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
      )}

      {/* --- NEW BUTTON LAYOUT --- */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onRun}
          disabled={isVisualizing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
        >
          Run (Result)
        </button>
        <button
          onClick={onVisualize}
          disabled={isVisualizing}
          className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
        >
          Visualize
        </button>
      </div>
      <button
        onClick={onReset}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 disabled:opacity-50"
      >
        Reset Simulation
      </button>
    </div>
  );
}
