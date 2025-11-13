
// import { useState } from "react";
// import InputForm from "./components/InputForm";
// import Controls from "./components/Controls";

// // We will create these two components next
// // import GanttChart from './components/GanttChart';
// // import ResultsTable from './components/ResultsTable';

// export default function App() {
//   const [processList, setProcessList] = useState([]);
//   const [selectedAlgorithm, setSelectedAlgorithm] = useState("FCFS");
//   const [timeQuantum, setTimeQuantum] = useState(2); // Default for RR
//   const [results, setResults] = useState(null); // Will hold our final data

//   const addProcess = (process) => {
//     setProcessList((prevList) => [
//       ...prevList,
//       {
//         ...process,
//         id: prevList.length + 1,
//       },
//     ]);
//   };

//   // THIS IS THE MASTER FUNCTION
//   const handleRunSimulation = () => {
//     // We will build the logic for this in the next step
//     // For now, it just prints to the console
//     console.log("Running simulation for:", selectedAlgorithm);
//     console.log("Process List:", processList);
//     if (selectedAlgorithm === "RR") {
//       console.log("Time Quantum:", timeQuantum);
//     }

//     // In the future, this will call the correct algorithm function
//     // and then setResults(calculatedData);

//     // For testing, let's clear results
//     setResults(null);
//     // TODO: setResults(runAlgorithm(processList, selectedAlgorithm, timeQuantum));
//   };

//   return (
//     <main className="min-h-screen bg-gray-900 text-white p-8">
//       <div className="max-w-7xl mx-auto">
//         <header className="text-center mb-12">
//           <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
//             CPU Scheduler
//           </h1>
//           <p className="text-lg text-gray-400 mt-2">
//             Visualize complex algorithms with an interactive simulator
//           </p>
//         </header>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* COLUMN 1: CONTROLS & INPUTS */}
//           <div className="lg:col-span-1 space-y-8">
//             <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
//               <Controls
//                 selectedAlgorithm={selectedAlgorithm}
//                 setSelectedAlgorithm={setSelectedAlgorithm}
//                 timeQuantum={timeQuantum}
//                 setTimeQuantum={setTimeQuantum}
//                 onRun={handleRunSimulation}
//               />
//             </div>
//             <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
//               <InputForm
//                 onAddProcess={addProcess}
//                 selectedAlgorithm={selectedAlgorithm}
//               />
//             </div>
//           </div>

//           {/* COLUMN 2: PROCESS LIST & OUTPUTS */}
//           <div className="lg:col-span-2 space-y-8">
//             <div className="bg-gray-800 p-6 rounded-xl shadow-2xl min-h-[200px]">
//               <h2 className="text-2xl font-semibold mb-6 text-white">
//                 Process Pool
//               </h2>
//               <ul className="space-y-3">
//                 {processList.map((proc) => (
//                   <li
//                     key={proc.id}
//                     className="flex flex-wrap justify-between items-center bg-gray-700 p-3 rounded-md shadow"
//                   >
//                     <span className="font-mono bg-blue-900 text-blue-200 px-2 py-0.5 rounded text-sm">
//                       PID: {proc.id}
//                     </span>
//                     <span className="text-gray-300">
//                       <strong>Arrival:</strong> {proc.arrivalTime}ms
//                     </span>
//                     <span className="text-gray-300">
//                       <strong>Burst:</strong> {proc.burstTime}ms
//                     </span>
//                     {/* Dynamically show priority/queue */}
//                     {proc.priority !== undefined && (
//                       <span className="text-gray-300">
//                         <strong>Priority:</strong> {proc.priority}
//                       </span>
//                     )}
//                     {proc.queueLevel !== undefined && (
//                       <span className="text-gray-300">
//                         <strong>Queue:</strong> {proc.queueLevel}
//                       </span>
//                     )}
//                   </li>
//                 ))}
//                 {processList.length === 0 && (
//                   <p className="text-gray-500 text-center py-4">
//                     Add processes using the form to begin.
//                   </p>
//                 )}
//               </ul>
//             </div>

//             {/* THIS IS WHERE THE OUTPUTS WILL GO */}
//             <div className="bg-gray-800 p-6 rounded-xl shadow-2xl min-h-[300px]">
//               <h2 className="text-2xl font-semibold mb-6 text-white">
//                 Simulation Results
//               </h2>
//               {/* We'll render GanttChart and ResultsTable here based on `results` state */}
//               {!results && (
//                 <p className="text-gray-500 text-center py-10">
//                   Run the simulation to see the output.
//                 </p>
//               )}
//               {/* Example: {results && <GanttChart data={results.gantt} />} */}
//             </div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }


import { useState } from 'react';
import InputForm from './components/InputForm';
import Controls from './components/Controls';
import ProcessList from './components/ProcessList'; // Import new component

// We will create these two components next
// import GanttChart from './components/GanttChart';
// import ResultsTable from './components/ResultsTable';

export default function App() {
  const [processList, setProcessList] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('FCFS');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [results, setResults] = useState(null);

  const addProcess = (process) => {
    setProcessList((prevList) => [
      ...prevList,
      {
        ...process,
        // Using Date.now() for a more unique and safe ID
        id: Date.now(), 
      },
    ]);
  };

  // --- NEW FUNCTION ---
  // Deletes a process by filtering it out of the list
  const deleteProcess = (processId) => {
    setProcessList((prevList) =>
      prevList.filter((process) => process.id !== processId)
    );
  };

  // --- NEW FUNCTION ---
  // Updates a process by mapping the list and replacing the old one
  const updateProcess = (processId, updatedProcess) => {
    setProcessList((prevList) =>
      prevList.map((process) =>
        process.id === processId ? updatedProcess : process
      )
    );
  };

  const handleRunSimulation = () => {
    console.log('Running simulation for:', selectedAlgorithm);
    console.log('Process List:', processList);
    // ... (rest of the function)
    setResults(null);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          {/* ... (header code remains the same) ... */}
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            CPU Scheduler
          </h1>
          <p className="text-lg text-gray-400 mt-2">
            Visualize complex algorithms with an interactive simulator
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMN 1: CONTROLS & INPUTS */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
              <Controls
                selectedAlgorithm={selectedAlgorithm}
                setSelectedAlgorithm={setSelectedAlgorithm}
                timeQuantum={timeQuantum}
                setTimeQuantum={setTimeQuantum}
                onRun={handleRunSimulation}
              />
            </div>
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
              <InputForm
                onAddProcess={addProcess}
                selectedAlgorithm={selectedAlgorithm}
              />
            </div>
          </div>

          {/* COLUMN 2: PROCESS LIST & OUTPUTS */}
          <div className="lg:col-span-2 space-y-8">
            {/* --- UPDATED PROCESS POOL --- */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl min-h-[200px]">
              <h2 className="text-2xl font-semibold mb-6 text-white">
                Process Pool
              </h2>
              <ProcessList
                processList={processList}
                onDelete={deleteProcess}
                onUpdate={updateProcess}
                selectedAlgorithm={selectedAlgorithm} // Pass this down
              />
            </div>

            {/* THIS IS WHERE THE OUTPUTS WILL GO */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl min-h-[300px]">
              {/* ... (output area remains the same) ... */}
              <h2 className="text-2xl font-semibold mb-6 text-white">
                Simulation Results
              </h2>
              {!results && (
                <p className="text-gray-500 text-center py-10">
                  Run the simulation to see the output.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}