
import React from 'react';

export default function ResultsTable({ stats, averages }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            {[
              'PID',
              'Arrival',
              'Burst',
              'Priority',
              'Queue',
              'Completion',
              'Turnaround',
              'Waiting',
            ].map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {stats.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                P{p.pid}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {p.arrivalTime}ms
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {p.burstTime}ms
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {p.priority !== undefined ? p.priority : 'N/A'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {p.queueLevel !== undefined ? p.queueLevel : 'N/A'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {p.completionTime} 
                {/* 'ms' removed - this might be "N/A" */ }
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {p.turnaroundTime}
                {/* 'ms' removed - this might be "N/A" */ }
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {p.waitingTime}ms
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Averages Section */}
      <div className="mt-6 flex flex-col sm:flex-row justify-end sm:gap-6 bg-gray-700 p-4 rounded-b-md">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-400">
            Avg. Waiting Time
          </p>
          <p className="text-xl font-semibold text-white">
            {averages.waitingTime} ms
          </p>
        </div>
        <div className="text-right mt-4 sm:mt-0">
          <p className="text-sm font-medium text-gray-400">
            Avg. Turnaround Time
          </p>
          <p className="text-xl font-semibold text-white">
            {averages.turnaroundTime} ms
          </p>
        </div>
      </div>
    </div>
  );
}