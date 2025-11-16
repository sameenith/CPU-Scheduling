export const calculateRR = (processes, timeQuantum) => {
  // 1. Create deep copies with 'remaining' time
  let simProcesses = processes.map(p => ({
    ...p,
    pid: p.id.toString().slice(-4),
    remainingBurst: p.burstTime,
    hasArrived: false,
  }));

  const ganttChart = [];
  let processStats = simProcesses.map(p => ({ ...p, waitingTime: 0, startTime: -1 }));
  
  let currentTime = 0;
  let readyQueue = [];
  let runningProcess = null;
  let completedCount = 0;
  
  // ---  NEW LOGIC FOR RR ---
  // This tracks the time slice for the currently running process
  let currentSlice = 0; 


  // Loop until all processes are completed
  while (completedCount < processes.length) {
    
    // 2. Add newly arrived processes to the ready queue
    simProcesses.forEach(p => {
      if (!p.hasArrived && p.arrivalTime <= currentTime) {
        p.hasArrived = true;
        readyQueue.push(p); // Add to the *back* of the queue
      }
    });

    // --- NEW LOGIC FOR RR PREEMPTION ---
    // 3. Check for Time Quantum Preemption
    if (runningProcess) {
      currentSlice++; // Increment the time slice counter
      
      if (currentSlice >= timeQuantum) {
        // Time's up! Preempt the process.
        readyQueue.push(runningProcess); // Put it at the *back* of the queue
        runningProcess = null;
        currentSlice = 0; // Reset the slice counter
      }
    }
    
    // 4. Check if CPU is IDLE
    if (runningProcess === null) {
      if (readyQueue.length > 0) {
        
        // --- RR Policy: Always take from the front (FIFO) ---
        runningProcess = readyQueue.shift();
        currentSlice = 0; // Reset slice counter for new process
        
        // Set start time if it's the first time running
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
    
    // 7. Update waiting time for all processes in ready queue
    readyQueue.forEach(proc => {
      const statIndex = processStats.findIndex(p => p.id === proc.id);
      processStats[statIndex].waitingTime += 1;
    });

    // 8. Increment time
    currentTime++;

    // Safety break
    if (currentTime > 20000) {
       console.error("RR Simulation stuck in a loop");
       break;
    }
    
    // Jump time forward if idle
    if (runningProcess === null && readyQueue.length === 0 && completedCount < processes.length) {
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