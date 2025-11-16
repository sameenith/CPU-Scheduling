
import React from 'react';

// A small, reusable pill for process IDs
function ProcessPill({ pid, color, size = 'normal' }) {
  const colors = color || 'bg-gray-600 text-gray-200';
  const padding = size === 'normal' ? 'px-3 py-1' : 'px-4 py-2';
  const textSize = size === 'normal' ? 'text-sm' : 'text-lg';

  return (
    <div
      className={`font-mono ${padding} ${textSize} font-semibold ${colors} rounded-full shadow-md flex-shrink-0`}
    >
      {pid}
    </div>
  );
}

export default function LiveStatus({
  currentTime,
  runningProcess,
  readyQueue,
}) {
  return (
    // Use a 3-column grid layout for the status dashboard
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* --- Column 1: Current Time --- */}
      <div className="bg-gray-700 p-4 rounded-lg shadow-inner text-center">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Current Time
        </h4>
        <p className="font-mono text-5xl font-bold text-white mt-1">
          {currentTime}
          <span className="text-3xl text-gray-500">ms</span>
        </p>
      </div>

      {/* --- Column 2: Running Process --- */}
      <div className="bg-gray-700 p-4 rounded-lg shadow-inner flex flex-col items-center">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Running Process
        </h4>
        {/* Placeholder box to maintain height */}
        <div className="h-16 flex items-center justify-center">
          {runningProcess ? (
            <ProcessPill
              pid={`P${runningProcess.pid}`}
              color="bg-gradient-to-r from-green-400 to-teal-500 text-white"
              size="large"
            />
          ) : (
            <ProcessPill
              pid="IDLE"
              color="bg-gray-500 text-white"
              size="large"
            />
          )}
        </div>
      </div>

      {/* --- Column 3: Ready Queue --- */}
      <div className="bg-gray-700 p-4 rounded-lg shadow-inner">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider text-center">
          Ready Queue
        </h4>
        {/* Placeholder box to maintain height */}
        <div className="h-16 flex items-center justify-center">
          {readyQueue.length > 0 ? (
            // Horizontally scrolling container
            <div className="flex w-full space-x-2 overflow-x-auto pb-2">
              {readyQueue.map((proc) => (
                <ProcessPill key={proc.id} pid={`P${proc.pid}`} />
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-500 italic">
              Queue is empty...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}