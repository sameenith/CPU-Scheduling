/**
 * Calculates MLQ (Multilevel Queue) scheduling.
 * This is an "instant" calculation, not a live simulation.
 * Rules:
 * - Q1 (Level 1): Round Robin (uses timeQuantum)
 * - Q2 (Level 2): FCFS
 * - Q3 (Level 3): FCFS
 * - Preemption: Q1 > Q2 > Q3. A higher priority queue process will
 * preempt any lower priority queue process.
 *
 * @param {Array} processes - A list of process objects.
 * @param {number} timeQuantum - The time slice for Q1 (RR).
 * @returns {Object} - Contains gantt chart data, process stats, and averages.
 */
export const calculateMLQ = (processes, timeQuantum) => {
  // 1. Create deep copies
  let simProcesses = processes.map(p => ({
    ...p,
    pid: p.id.toString().slice(-4),
    remainingBurst: p.burstTime,
    hasArrived: false,
    // Default to lowest priority queue if not specified
    queueLevel: p.queueLevel || 3, 
  }));

  const ganttChart = [];
  let processStats = simProcesses.map(p => ({ ...p, waitingTime: 0, startTime: -1 }));
  
  let currentTime = 0;
  // --- 👇 MLQ CHANGE: 3 Ready Queues ---
  let readyQueue1 = []; // RR
  let readyQueue2 = []; // FCFS
  let readyQueue3 = []; // FCFS
  // --- 👆 END OF CHANGE ---
  
  let runningProcess = null;
  let completedCount = 0;
  let currentSlice = 0; // For Q1's RR

  // Loop until all processes are completed
  while (completedCount < processes.length) {
    
    // 2. Add newly arrived processes to their correct queue
    simProcesses.forEach(p => {
      if (!p.hasArrived && p.arrivalTime <= currentTime) {
        p.hasArrived = true;
        // --- 👇 MLQ CHANGE: Add to correct queue ---
        switch (p.queueLevel) {
          case 1: readyQueue1.push(p); break;
          case 2: readyQueue2.push(p); break;
          case 3:
          default: readyQueue3.push(p); break;
        }
        // --- 👆 END OF CHANGE ---
      }
    });

    // --- 👇 MLQ CHANGE: MLQ Preemption Logic ---
    // 3. Check for Preemption
    if (runningProcess) {
      // Rule 1: Q1 process arrives, preempts Q2 or Q3
      if (runningProcess.queueLevel > 1 && readyQueue1.length > 0) {
        if (runningProcess.queueLevel === 2) readyQueue2.push(runningProcess);
        else readyQueue3.push(runningProcess);
        runningProcess = null;
        currentSlice = 0;
      }
      // Rule 2: Q2 process arrives, preempts Q3
      else if (runningProcess.queueLevel > 2 && readyQueue2.length > 0) {
        readyQueue3.push(runningProcess);
        runningProcess = null;
        currentSlice = 0;
      }
      // Rule 3: Q1 (RR) Time Slice Expires
      else if (runningProcess.queueLevel === 1 && currentSlice >= timeQuantum) {
        readyQueue1.push(runningProcess); // Add to back of Q1
        runningProcess = null;
        currentSlice = 0;
      }
    }
    // --- 👆 END OF CHANGE ---
    
    // 4. Check if CPU is IDLE (Scheduling Logic)
    if (runningProcess === null) {
      // --- 👇 MLQ CHANGE: Check Queues in order of priority ---
      if (readyQueue1.length > 0) {
        // Q1 (RR) - take from front
        runningProcess = readyQueue1.shift();
        currentSlice = 0; // Reset slice for new Q1 process
      } else if (readyQueue2.length > 0) {
        // Q2 (FCFS) - take from front
        runningProcess = readyQueue2.shift();
        currentSlice = 0; // Not used, but good to reset
      } else if (readyQueue3.length > 0) {
        // Q3 (FCFS) - take from front
        runningProcess = readyQueue3.shift();
        currentSlice = 0; // Not used
      }
      // --- 👆 END OF CHANGE ---

      // Set start time if it's the first time running
      if (runningProcess) {
        const statIndex = processStats.findIndex(p => p.id === runningProcess.id);
        if (processStats[statIndex].startTime === -1) {
          processStats[statIndex].startTime = currentTime;
        }
      }
    }
    
    // 5. Update Gantt Chart
    const currentPID = runningProcess ? `P${runningProcess.pid}` : 'IDLE';
    const lastBlock = ganttChart[ganttChart.length - 1];

    if (lastBlock && lastBlock.pid === currentPID) {
      lastBlock.end = currentTime + 1;
      lastBlock.duration = lastBlock.end - lastBlock.start;
    } else {
      ganttChart.push({
        pid: currentPID,
        start: currentTime,
        end: currentTime + 1,
        duration: 1,
      });
    }

    // 6. Update Running Process
    if (runningProcess) {
      // Increment slice timer *only if* it's a Q1 process
      if (runningProcess.queueLevel === 1) {
        currentSlice++;
      }
      
      runningProcess.remainingBurst -= 1;

      // Check for process completion
      if (runningProcess.remainingBurst <= 0) {
        const completionTime = currentTime + 1;
        const statIndex = processStats.findIndex(p => p.id === runningProcess.id);
        
        processStats[statIndex].completionTime = completionTime;
        processStats[statIndex].turnaroundTime = completionTime - processStats[statIndex].arrivalTime;
        processStats[statIndex].waitingTime = processStats[statIndex].turnaroundTime - processStats[statIndex].burstTime;
        
        runningProcess = null; // CPU is now idle
        currentSlice = 0; // Reset slice counter
        completedCount++; // Mark one process as done
      }
    }
    
    // 7. Update waiting time for ALL processes in ALL ready queues
    [...readyQueue1, ...readyQueue2, ...readyQueue3].forEach(proc => {
      const statIndex = processStats.findIndex(p => p.id === proc.id);
      processStats[statIndex].waitingTime += 1;
    });

    // 8. Increment time
    currentTime++;

    // Safety break
    if (currentTime > 20000) {
       console.error("MLQ Simulation stuck in a loop");
       break;
    }
    
    // Jump time forward if idle
    if (runningProcess === null && readyQueue1.length === 0 && readyQueue2.length === 0 && readyQueue3.length === 0 && completedCount < processes.length) {
       const nextArrivalTime = Math.min(...simProcesses.filter(p => !p.hasArrived).map(p => p.arrivalTime));
       if (nextArrivalTime > currentTime && nextArrivalTime !== Infinity) {
           ganttChart.push({
             pid: 'IDLE',
             start: currentTime,
             end: nextArrivalTime,
             duration: nextArrivalTime - currentTime,
           });
           currentTime = nextArrivalTime; // Jump time forward
       }
    }
  }

  // 9. Calculate averages
  const totalWT = processStats.reduce((sum, p) => sum + p.waitingTime, 0);
  const totalTT = processStats.reduce((sum, p) => sum + p.turnaroundTime, 0);
  const avgWT = (totalWT / processes.length) || 0;
  const avgTT = (totalTT / processes.length) || 0;

  return {
    ganttChart,
    processStats,
    averages: {
      waitingTime: avgWT.toFixed(2),
      turnaroundTime: avgTT.toFixed(2),
    },
  };
};