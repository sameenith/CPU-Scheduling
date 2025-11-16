// import React from "react";

// // A simple hash function to get a consistent color for each PID
// const getColorForPID = (pid) => {
//   if (pid === "IDLE") return "bg-gray-500"; // Idle color
//   let hash = 0;
//   for (let i = 0; i < pid.length; i++) {
//     hash = pid.charCodeAt(i) + ((hash << 5) - hash);
//   }
//   const colors = [
//     "bg-blue-500",
//     "bg-green-500",
//     "bg-yellow-600",
//     "bg-purple-500",
//     "bg-pink-500",
//     "bg-indigo-500",
//     "bg-teal-500",
//     "bg-red-500",
//   ];
//   return colors[Math.abs(hash) % colors.length];
// };

// export default function GanttChart({ data }) {
//   if (!data || data.length === 0) {
//     return <p className="text-gray-500">Gantt chart data is empty.</p>;
//   }

//   const totalDuration = data[data.length - 1].end;

//   return (
//     <div className="w-full bg-gray-700 rounded-lg overflow-hidden border border-gray-600">
//       {/* The bars */}
//       <div className="flex h-12">
//         {data.map((block, index) => {
//           const blockWidthPercentage = (block.duration / totalDuration) * 100;
//           return (
//             <div
//               key={index}
//               style={{ width: `${blockWidthPercentage}%` }}
//               className={`flex items-center justify-center border-r border-gray-900 last:border-r-0 ${
//                 block.color || getColorForPID(block.pid)
//               }`}
//               title={`${block.pid} (${block.start}ms - ${block.end}ms)`}
//             >
//               <span className="text-xs font-bold text-white text-shadow-sm overflow-hidden whitespace-nowrap px-1">
//                 {block.pid}
//               </span>
//             </div>
//           );
//         })}
//       </div>

//       {/* Timeline Labels */}
//       <div className="flex text-xs text-gray-300 bg-gray-900">
//         <span className="pl-1">0</span>
//         {data.map((block, index) => {
//           const blockWidthPercentage = (block.duration / totalDuration) * 100;
//           return (
//             <div
//               key={index}
//               style={{ width: `${blockWidthPercentage}%` }}
//               className="text-right pr-1 border-r border-gray-700 last:border-r-0"
//             >
//               {block.end}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


import React from 'react';

// A simple hash function to get a consistent color for each PID
const getColorForPID = (pid) => {
  if (pid === 'IDLE') return 'bg-gray-500'; // Idle color
  let hash = 0;
  for (let i = 0; i < pid.length; i++) {
    hash = pid.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-600',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-red-500',
  ];
  return colors[Math.abs(hash) % colors.length];
};

export default function GanttChart({ data, currentTime }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-gray-500 text-center">
        Waiting for visualization...
      </p>
    );
  }

  // Find the last known time to set the width of the timeline
  const maxTime = Math.max(currentTime, data[data.length - 1]?.end || 0);
  
  // Calculate a dynamic width for the chart container.
  // Example: 10px per unit of time. Adjust '10' as needed for speed/look.
  const chartWidth = maxTime * 10;

  return (
    <div className="w-full bg-gray-700 rounded-lg overflow-hidden border border-gray-600">
      {/* The bars
        We set a min-width to ensure it fills the container, 
        but the style-width will make it grow and scroll
      */}
      <div className="flex h-12" style={{ width: `${chartWidth}px`, minWidth: '100%' }}>
        {data.map((block, index) => {
          // Each block's width is its duration in 'ms' * 10px
          const blockWidth = block.duration * 10;
          return (
            <div
              key={index}
              style={{ width: `${blockWidth}px` }}
              className={`flex items-center justify-center border-r border-gray-900 ${
                block.color || getColorForPID(block.pid)
              }`}
              title={`${block.pid} (${block.start}ms - ${block.end}ms)`}
            >
              <span className="text-xs font-bold text-white text-shadow-sm overflow-hidden whitespace-nowrap px-1">
                {block.pid}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* We can add a simple timeline marker later if needed */}
    </div>
  );
}