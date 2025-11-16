import { useState, useEffect, useRef } from "react";
import InputForm from "./InputForm";
import Controls from "./Controls";
import ProcessList from "./ProcessList";
import GanttChart from "./GanttChart";
import ResultsTable from "./ResultsTable";
import LiveStatus from "./LiveStatus";
import {
  calculateFCFS,
  calculateSJF,
  calculateSRTF,
  calculatePriority,
  calculatePriorityPreemptive,
  calculateRR,
  calculateMLQ,
  calculateMLFQ, 
} from "../logic"; 

// This hook will be our timer.
function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default function Layout() {
  // --- STATE ---
  const [processList, setProcessList] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("FCFS");
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(200);
  const [currentTime, setCurrentTime] = useState(0);

  // --- REFS ---
  const runningProcessRef = useRef(null);
  const simulationProcessesRef = useRef([]);
  const ganttDataRef = useRef([]);
  const statsDataRef = useRef([]);
  const currentSliceRef = useRef(0);
  
  // Queues
  const readyQueueRef = useRef([]); // For simple algos
  const readyQueue1Ref = useRef([]); // For MLQ/MLFQ
  const readyQueue2Ref = useRef([]); // For MLQ/MLFQ
  const readyQueue3Ref = useRef([]); // For MLQ/MLFQ

  // --- OUTPUT STATE ---
  const [ganttData, setGanttData] = useState([]);
  const [liveReadyQueue, setLiveReadyQueue] = useState([]);
  const [liveRunningProcess, setLiveRunningProcess] = useState(null);
  const [finalResults, setFinalResults] = useState(null);

  // --- CONTROLS (Add, Delete, Update) ---
  const addProcess = (process) => {
    setProcessList((prevList) => [
      ...prevList,
      { ...process, id: Date.now(), pid: Date.now().toString().slice(-4) },
    ]);
  };
  const deleteProcess = (id) => {
    setProcessList((prevList) => prevList.filter((p) => p.id !== id));
  };
  const updateProcess = (id, data) => {
    setProcessList((prevList) => prevList.map((p) => (p.id === id ? data : p)));
  };

  // --- SIMULATION HANDLERS ---
  const handleRun = () => {
    if (processList.length === 0) {
      alert("Please add at least one process to run the simulation.");
      return;
    }
    handleReset();
    let results;

    // --- 👇 2. UPDATE 'handleRun' SWITCH ---
    switch (selectedAlgorithm) {
      case "FCFS":
        results = calculateFCFS(processList);
        break;
      case "SJF (Non-Preemptive)":
        results = calculateSJF(processList);
        break;
      case "SJF (Preemptive)":
        results = calculateSRTF(processList);
        break;
      case "Priority (Non-Preemptive)":
        results = calculatePriority(processList);
        break;
      case "Priority (Preemptive)":
        results = calculatePriorityPreemptive(processList);
        break;
      case "Round Robin (RR)":
        results = calculateRR(processList, timeQuantum);
        break;
      case "Multilevel Queue (MLQ)":
        results = calculateMLQ(processList, timeQuantum);
        break;
      case "Multilevel Feedback Queue (MLFQ)": // 👈 ADD THIS CASE
        results = calculateMLFQ(processList, timeQuantum);
        break;
      default:
        alert("This algorithm is not implemented yet.");
        return;
    }
    // --- 👆 END OF SWITCH UPDATE ---

    setFinalResults(results);
    setGanttData(results.ganttChart);
  };

  // 3. handleReset is already correct (it clears all 4 queues)
  const handleReset = () => {
    setIsVisualizing(false);
    setCurrentTime(0);
    runningProcessRef.current = null;
    simulationProcessesRef.current = [];
    ganttDataRef.current = [];
    statsDataRef.current = [];
    currentSliceRef.current = 0;
    readyQueueRef.current = [];
    readyQueue1Ref.current = [];
    readyQueue2Ref.current = [];
    readyQueue3Ref.current = [];
    setGanttData([]);
    setLiveReadyQueue([]);
    setLiveRunningProcess(null);
    setFinalResults(null);
  };

  const handleVisualize = () => {
    if (processList.length === 0) {
      alert("Please add at least one process to visualize.");
      return;
    }
    handleReset();

    // --- 👇 4. UPDATE VISUALIZE LOGIC for MLFQ ---
    const isMLFQ = selectedAlgorithm === "Multilevel Feedback Queue (MLFQ)";
    simulationProcessesRef.current = processList.map((p) => ({
      ...p,
      remainingBurst: p.burstTime,
      hasArrived: false,
      // For MLQ, use assigned level. For MLFQ, everyone starts in Q1.
      currentQueue: isMLFQ ? 1 : (p.queueLevel || 3), 
    }));
    // --- 👆 END OF CHANGE ---

    statsDataRef.current = simulationProcessesRef.current.map((p) => ({
      ...p,
      completionTime: "N/A",
      turnaroundTime: "N/A",
      waitingTime: 0,
    }));

    setIsVisualizing(true);
  };

  // --- THE SIMULATION ENGINE (Main Timer Loop) ---
  useInterval(
    () => {
      if (!isVisualizing) return;

      let currentTick = currentTime;
      const isMLQ = selectedAlgorithm === "Multilevel Queue (MLQ)";
      // --- 👇 5. ADD MLFQ FLAG ---
      const isMLFQ = selectedAlgorithm === "Multilevel Feedback Queue (MLFQ)";
      // --- 👆 END OF CHANGE ---

      // 1. Check for new arrivals
      simulationProcessesRef.current.forEach((proc) => {
        if (!proc.hasArrived && currentTick >= proc.arrivalTime) {
          proc.hasArrived = true;
          // --- 👇 6. UPDATE ARRIVAL LOGIC ---
          if (isMLQ || isMLFQ) {
            // MLFQ processes *always* start in Q1
            if (isMLFQ) {
              proc.currentQueue = 1;
              readyQueue1Ref.current.push(proc);
            } else {
              // MLQ processes go to their assigned queue
              switch (proc.currentQueue) { // use currentQueue
                case 1: readyQueue1Ref.current.push(proc); break;
                case 2: readyQueue2Ref.current.push(proc); break;
                case 3:
                default: readyQueue3Ref.current.push(proc); break;
              }
            }
          } else {
            // Old logic: add to single queue
            readyQueueRef.current.push(proc);
          }
          // --- 👆 END OF CHANGE ---
        }
      });

      // 2. Check for Preemption
      if (runningProcessRef.current) {
        let shouldPreempt = false;
        
        // --- 👇 7. UPDATE PREEMPTION LOGIC ---
        if (isMLQ || isMLFQ) {
          const runningQueue = runningProcessRef.current.currentQueue; 
          
          // Rule 1: Q1 process arrives, preempts Q2 or Q3
          if (runningQueue > 1 && readyQueue1Ref.current.length > 0) {
            shouldPreempt = true;
          }
          // Rule 2: Q2 process arrives, preempts Q3
          else if (runningQueue > 2 && readyQueue2Ref.current.length > 0) {
            shouldPreempt = true;
          }
          
          // --- Time Slice Preemption/Demotion ---
          const TQ1 = timeQuantum;
          const TQ2 = timeQuantum * 2; // Q2 gets double the time

          if (isMLQ && runningQueue === 1 && currentSliceRef.current >= TQ1) {
            // MLQ: Q1 RR time slice expires
            shouldPreempt = true; 
          } else if (isMLFQ) {
            // MLFQ: Check for demotion
            if (runningQueue === 1 && currentSliceRef.current >= TQ1) {
              shouldPreempt = true; // Demote from Q1 -> Q2
            } else if (runningQueue === 2 && currentSliceRef.current >= TQ2) {
              shouldPreempt = true; // Demote from Q2 -> Q3
            }
          }
        } 
        // Old Preemption Logic (SRTF, Prio-P)
        else if (readyQueueRef.current.length > 0) {
          if (selectedAlgorithm === "SJF (Preemptive)") {
            const shortestJobInQueue = [...readyQueueRef.current].sort((a, b) => a.remainingBurst - b.remainingBurst)[0];
            if (shortestJobInQueue.remainingBurst < runningProcessRef.current.remainingBurst) {
              shouldPreempt = true;
            }
          } else if (selectedAlgorithm === "Priority (Preemptive)") {
            const highestPrioInQueue = [...readyQueueRef.current].sort((a, b) => a.priority - b.priority)[0];
            if (highestPrioInQueue.priority < runningProcessRef.current.priority) {
              shouldPreempt = true;
            }
          }
        }

        if (shouldPreempt) {
          // Put the process back in the correct queue
          if (isMLQ || isMLFQ) {
            // --- 👇 8. UPDATE 'PUT BACK' LOGIC ---
            const proc = runningProcessRef.current;
            if (isMLFQ) {
              // MLFQ Demotion logic
              const TQ1 = timeQuantum;
              const TQ2 = timeQuantum * 2;
              
              // Check if preemption was due to demotion
              if (proc.currentQueue === 1 && currentSliceRef.current >= TQ1) {
                proc.currentQueue = 2; // Demote to Q2
                readyQueue2Ref.current.push(proc);
              } else if (proc.currentQueue === 2 && currentSliceRef.current >= TQ2) {
                proc.currentQueue = 3; // Demote to Q3
                readyQueue3Ref.current.push(proc);
              } else {
                 // Preempted by higher priority, put back in *own* queue
                if (proc.currentQueue === 1) readyQueue1Ref.current.push(proc);
                else if (proc.currentQueue === 2) readyQueue2Ref.current.push(proc);
                else readyQueue3Ref.current.push(proc);
              }
            } else {
              // MLQ simple 'put back' logic (it's just RR preemption)
              if (proc.currentQueue === 1) readyQueue1Ref.current.push(proc);
              else if (proc.currentQueue === 2) readyQueue2Ref.current.push(proc);
              else readyQueue3Ref.current.push(proc);
            }
            // --- 👆 END OF CHANGE ---
          } else {
            readyQueueRef.current.push(runningProcessRef.current);
          }
          runningProcessRef.current = null;
          currentSliceRef.current = 0;
        }
        // --- 👆 END OF CHANGE (BLOCK 2) ---
      }

      // 3. Check if CPU is IDLE (Scheduling Logic)
      if (runningProcessRef.current === null) {
        
        // --- 👇 9. UPDATE SCHEDULING LOGIC (Already correct for MLFQ) ---
        if (isMLQ || isMLFQ) {
          // Check Queues in order of priority (same for both)
          if (readyQueue1Ref.current.length > 0) {
            runningProcessRef.current = readyQueue1Ref.current.shift(); // Q1
          } else if (readyQueue2Ref.current.length > 0) {
            runningProcessRef.current = readyQueue2Ref.current.shift(); // Q2
          } else if (readyQueue3Ref.current.length > 0) {
            runningProcessRef.current = readyQueue3Ref.current.shift(); // Q3
          }
          currentSliceRef.current = 0; // Reset slice for new process
        
        } else {
          // Old Scheduling Logic (no changes here)
          if (readyQueueRef.current.length > 0) {
            switch (selectedAlgorithm) {
              case "SJF (Preemptive)":
                readyQueueRef.current.sort((a, b) => a.remainingBurst - b.remainingBurst);
                break;
              case "SJF (Non-Preemptive)":
                readyQueueRef.current.sort((a, b) => a.burstTime - b.burstTime);
                break;
              case "Priority (Preemptive)":
              case "Priority (Non-Preemptive)":
                readyQueueRef.current.sort((a, b) => a.priority - b.priority);
                break;
              case "Round Robin (RR)":
              case "FCFS":
              default:
                // No sorting needed
                break;
            }
            runningProcessRef.current = readyQueueRef.current.shift();
            currentSliceRef.current = 0;
          }
        }
        // --- 👆 END OF CHANGE ---
      }

      // 4. Update Gantt Chart Data (No changes needed)
      const lastBlock = ganttDataRef.current[ganttDataRef.current.length - 1];
      const currentPID = runningProcessRef.current
        ? `P${runningProcessRef.current.pid}`
        : "IDLE";
      if (lastBlock && lastBlock.pid === currentPID) {
        lastBlock.end = currentTick + 1;
        lastBlock.duration = lastBlock.end - lastBlock.start;
      } else {
        ganttDataRef.current.push({
          pid: currentPID,
          start: currentTick,
          end: currentTick + 1,
          duration: 1,
        });
      }


      // 5. Update Running Process
      if (runningProcessRef.current) {
        
        // --- 👇 10. UPDATE SLICE/BURST LOGIC ---
        const runningQueue = isMLQ || isMLFQ ? runningProcessRef.current.currentQueue : 0;
        
        // Increment slice timer for RR-based algorithms
        if (selectedAlgorithm === "Round Robin (RR)" || 
            (isMLQ && runningQueue === 1) ||
            (isMLFQ && runningQueue < 3) // Q1 and Q2 in MLFQ are RR
           ) {
           currentSliceRef.current += 1;
        }
        
        runningProcessRef.current.remainingBurst -= 1;

        // Check for process completion
        if (runningProcessRef.current.remainingBurst <= 0) {
          // Process finished
          const finishedProcess = runningProcessRef.current;
          const completionTime = currentTick + 1;

          // Update stats
          const statIndex = statsDataRef.current.findIndex( (p) => p.id === finishedProcess.id );
          if (statIndex > -1) {
            const stats = statsDataRef.current[statIndex];
            stats.completionTime = completionTime;
            stats.turnaroundTime = completionTime - stats.arrivalTime;
            stats.waitingTime = stats.turnaroundTime - stats.burstTime;
          }

          runningProcessRef.current = null;
          currentSliceRef.current = 0; 
        }
        // --- MLFQ DEMOTION LOGIC ---
        else if (isMLFQ) {
          const TQ1 = timeQuantum;
          const TQ2 = timeQuantum * 2;
          const proc = runningProcessRef.current;
          
          if (proc.currentQueue === 1 && currentSliceRef.current >= TQ1) {
            // Demote from Q1 -> Q2
            proc.currentQueue = 2;
            readyQueue2Ref.current.push(proc);
            runningProcessRef.current = null;
            currentSliceRef.current = 0;
          } else if (proc.currentQueue === 2 && currentSliceRef.current >= TQ2) {
            // Demote from Q2 -> Q3
            proc.currentQueue = 3;
            readyQueue3Ref.current.push(proc);
            runningProcessRef.current = null;
            currentSliceRef.current = 0;
          }
          // If in Q3, it's FCFS, so no time slice preemption
        }
        // --- MLQ / RR TIME QUANTUM EXPIRY ---
        else if (
          (selectedAlgorithm === "Round Robin (RR)" || (isMLQ && runningProcessRef.current.currentQueue === 1)) &&
          currentSliceRef.current >= timeQuantum
        ) {
          // Time's up! Preempt.
          if (isMLQ) {
            readyQueue1Ref.current.push(runningProcessRef.current); // Add to back of Q1
          } else {
            readyQueueRef.current.push(runningProcessRef.current); // Add to back of main queue
          }
          runningProcessRef.current = null;
          currentSliceRef.current = 0;
        }
        // --- 👆 END OF CHANGE ---
      }

      // --- 👇 11. UPDATE WAITING TIME LOGIC ---
      // 6. Update waiting time for all processes in ready queue(s)
      if (isMLQ || isMLFQ) {
        // Iterate over all 3 queues
        [...readyQueue1Ref.current, ...readyQueue2Ref.current, ...readyQueue3Ref.current].forEach((proc) => {
          const statIndex = statsDataRef.current.findIndex((p) => p.id === proc.id);
          if (statIndex > -1) {
            statsDataRef.current[statIndex].waitingTime += 1;
          }
        });
      } else {
        // Old logic: iterate over single queue
         readyQueueRef.current.forEach((proc) => {
          const statIndex = statsDataRef.current.findIndex((p) => p.id === proc.id);
          if (statIndex > -1) {
            statsDataRef.current[statIndex].waitingTime += 1;
          }
        });
      }
      // --- 👆 END OF CHANGE ---

      // 7. Update states for re-render
      setCurrentTime(currentTick + 1);
      setGanttData([...ganttDataRef.current]);
      
      // --- 👇 12. UPDATE LIVE QUEUE STATE ---
      if (isMLQ || isMLFQ) {
         // Combine all 3 queues to show in the UI
         setLiveReadyQueue([...readyQueue1Ref.current, ...readyQueue2Ref.current, ...readyQueue3Ref.current]);
      } else {
         setLiveReadyQueue([...readyQueueRef.current]);
      }
      // --- 👆 END OF CHANGE ---
      
      setLiveRunningProcess(runningProcessRef.current);

      // 8. Check for completion
      const simulationHasProcesses = simulationProcessesRef.current.length > 0;
      const allArrivedFinished = simulationProcessesRef.current
        .filter((p) => p.hasArrived)
        .every((p) => p.remainingBurst <= 0);
      const allProcessesArrived = simulationProcessesRef.current.every(
        (p) => p.hasArrived
      );
      
      // --- 👇 13. UPDATE COMPLETION CHECK ---
      const allQueuesEmpty = (isMLQ || isMLFQ)
        ? (readyQueue1Ref.current.length === 0 && readyQueue2Ref.current.length === 0 && readyQueue3Ref.current.length === 0)
        : (readyQueueRef.current.length === 0);
      // --- 👆 END OF CHANGE ---

      // Stop condition:
      if (
        simulationHasProcesses &&
        allProcessesArrived &&
        allArrivedFinished &&
        allQueuesEmpty && // Use new variable
        runningProcessRef.current === null
      ) {
        setIsVisualizing(false); // Stop the timer

        // Calculate and set the final average stats
        const totalWT = statsDataRef.current.reduce((sum, p) => sum + p.waitingTime, 0);
        const totalTT = statsDataRef.current.reduce((sum, p) => sum + p.turnaroundTime, 0);
        const avgWT = (totalWT / processList.length).toFixed(2);
        const avgTT = (totalTT / processList.length).toFixed(2);

        setFinalResults({
          processStats: statsDataRef.current,
          averages: { waitingTime: avgWT, turnaroundTime: avgTT },
        });
      }
    },
    isVisualizing ? simulationSpeed : null
  ); 

  return (
    // This is the main layout JSX
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
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
                onRun={handleRun}
                onVisualize={handleVisualize}
                onReset={handleReset}
                isVisualizing={isVisualizing}
              />
            </div>
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
              <InputForm
                onAddProcess={addProcess}
                selectedAlgorithm={selectedAlgorithm}
                isVisualizing={isVisualizing}
              />
            </div>
          </div>

          {/* COLUMN 2: PROCESS LIST & OUTPUTS */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-semibold mb-6 text-white">
                Process Pool
              </h2>
              <ProcessList
                processList={processList}
                onDelete={deleteProcess}
                onUpdate={updateProcess}
                selectedAlgorithm={selectedAlgorithm}
                isVisualizing={isVisualizing}
              />
            </div>

            {/* --- THIS IS THE NEW/UPDATED OUTPUT AREA --- */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl min-h-[300px]">
              <h2 className="text-2xl font-semibold mb-6 text-white">
                Simulation Results
              </h2>

              {/* --- NEW LIVE STATUS PANEL --- */}
              <div className="mb-8">
                <LiveStatus
                  currentTime={currentTime}
                  runningProcess={liveRunningProcess}
                  readyQueue={liveReadyQueue}
                />
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Gantt Chart</h3>
                  {/* This wrapper makes the chart scrollable */}
                  <div className="overflow-x-auto w-full pb-4">
                    <GanttChart data={ganttData} currentTime={currentTime} />
                  </div>
                </div>

                {/* Final results table (only show when done) */}
                {finalResults && (
                  <div className="animate-fade-in">
                    <h3 className="text-xl font-semibold mb-4">
                      Final Statistics
                    </h3>
                    <ResultsTable
                      stats={finalResults.processStats}
                      averages={finalResults.averages}
                    />
                  </div>
                )}

                {/* Show this message if no sim has been run */}
                {!finalResults && !isVisualizing && ganttData.length === 0 && (
                  <p className="text-gray-500 text-center py-10">
                    Run or Visualize the simulation to see the output.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}