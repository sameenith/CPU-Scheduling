/**
 * Calculates SJF (Non-Preemptive) scheduling.
 * This is an "instant" calculation, not a live simulation.
 * @param {Array} processes - A list of process objects.
 * @returns {Object} - Contains gantt chart data, process stats, and averages.
 */
export const calculateSJF = (processes) => {
  // 1. Create deep copies with 'remaining' time
  let simProcesses = processes.map(p => ({
    ...p,
    pid: p.id.toString().slice(-4),
    remainingBurst: p.burstTime,
    hasArrived: false,
  }));

  const ganttChart = [];
  let processStats = simProcesses.map(p => ({ ...p, waitingTime: 0 }));
  
  let currentTime = 0;
  let readyQueue = [];
  let runningProcess = null;

  // Loop until all processes are completed
  while (processStats.some(p => p.remainingBurst > 0)) {
    
    // 2. Add newly arrived processes to the ready queue
    simProcesses.forEach(p => {
      if (!p.hasArrived && p.arrivalTime <= currentTime) {
        p.hasArrived = true;
        readyQueue.push(p);
      }
    });

    // 3. Check if CPU is IDLE
    if (runningProcess === null) {
      if (readyQueue.length > 0) {
        // --- SJF POLICY ---
        // Sort the ready queue by burst time (shortest first)
        readyQueue.sort((a, b) => a.burstTime - b.burstTime);
        
        // Get the shortest job
        runningProcess = readyQueue.shift();
        
        // Update stats for the process that is starting
        const statIndex = processStats.findIndex(p => p.id === runningProcess.id);
        processStats[statIndex].startTime = currentTime;

      } else {
        // No process running, and queue is empty
        // This is an IDLE block
      }
    }
    
    // 4. Update Gantt Chart
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

    // 5. Update Running Process (and increment time)
    if (runningProcess) {
      runningProcess.remainingBurst -= 1;

      // Check for process completion
      if (runningProcess.remainingBurst <= 0) {
        const completionTime = currentTime + 1;
        const statIndex = processStats.findIndex(p => p.id === runningProcess.id);
        
        processStats[statIndex].completionTime = completionTime;
        processStats[statIndex].turnaroundTime = completionTime - processStats[statIndex].arrivalTime;
        // Waiting time was calculated live
        
        runningProcess = null; // CPU is now idle
      }
    }
    
    // 6. Update waiting time for all processes in ready queue
    readyQueue.forEach(proc => {
      const statIndex = processStats.findIndex(p => p.id === proc.id);
      processStats[statIndex].waitingTime += 1;
    });

    // 7. Increment time
    currentTime++;

    // Safety break: If time gets too high (e.g., processes never arrive)
    if (currentTime > 10000) {
       console.error("Simulation stuck in a loop");
       break;
    }
  }

  // 8. Calculate averages
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