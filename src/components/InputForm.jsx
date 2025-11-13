import { useState } from 'react';

export default function InputForm({ onAddProcess, selectedAlgorithm }) {
  // Local state for all possible inputs
  const [arrivalTime, setArrivalTime] = useState('');
  const [burstTime, setBurstTime] = useState('');
  const [priority, setPriority] = useState('');
  const [queueLevel, setQueueLevel] = useState('');

  // Check which extra fields to show based on the algorithm
  const showPriority =
    selectedAlgorithm.includes('Priority');
  const showQueueLevel =
    selectedAlgorithm.includes('MLQ') || selectedAlgorithm.includes('MLFQ');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!burstTime || !arrivalTime) {
      alert('Please fill in at least Arrival Time and Burst Time.');
      return;
    }
    
    // Build the process object dynamically
    const newProcess = {
      arrivalTime: Number(arrivalTime),
      burstTime: Number(burstTime),
    };

    if (showPriority) {
      if (!priority) {
        alert('Please enter a Priority value.');
        return;
      }
      newProcess.priority = Number(priority);
    }
    
    if (showQueueLevel) {
       if (!queueLevel) {
        alert('Please enter a Queue Level.');
        return;
      }
      newProcess.queueLevel = Number(queueLevel);
    }

    onAddProcess(newProcess);

    // Clear all fields
    setArrivalTime('');
    setBurstTime('');
    setPriority('');
    setQueueLevel('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold mb-4 text-white">Add New Process</h3>
      <div>
        <label
          htmlFor="arrival-time"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Arrival Time (ms)
        </label>
        <input
          type="number"
          id="arrival-time"
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
          placeholder="e.g., 0"
          min="0"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="burst-time"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Burst Time (ms)
        </label>
        <input
          type="number"
          id="burst-time"
          value={burstTime}
          onChange={(e) => setBurstTime(e.target.value)}
          placeholder="e.g., 5"
          min="1"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* DYNAMIC INPUT: Priority */}
      {showPriority && (
        <div className="animate-fade-in">
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Priority (Lower number = Higher priority)
          </label>
          <input
            type="number"
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            placeholder="e.g., 1"
            min="0"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
      
      {/* DYNAMIC INPUT: Queue Level */}
      {showQueueLevel && (
        <div className="animate-fade-in">
          <label
            htmlFor="queue-level"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Queue Level (e.g., 1, 2, 3)
          </label>
          <input
            type="number"
            id="queue-level"
            value={queueLevel}
            onChange={(e) => setQueueLevel(e.target.value)}
            placeholder="e.g., 1"
            min="1"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 transform hover:scale-102"
      >
        + Add Process
      </button>
    </form>
  );
}