export const calculateSRTF = (processes) => {
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

  // Loop until all processes are completed
  while (completedCount < processes.length) {
    
    // 2. Add newly arrived processes to the ready queue
    simProcesses.forEach(p => {
      if (!p.hasArrived && p.arrivalTime <= currentTime) {
        p.hasArrived = true;
        readyQueue.push(p);
      }
    });

    // --- PREEMPTION CHECK ---
    // If a process is running, check if a new, shorter job has arrived
    if (runningProcess) {
      // Sort ready queue by *remaining* burst time
      readyQueue.sort((a, b) => a.remainingBurst - b.remainingBurst);
      
      if (readyQueue.length > 0 && readyQueue[0].remainingBurst < runningProcess.remainingBurst) {
        // Preempt the running process
        readyQueue.push(runningProcess);
        runningProcess = null;
      }
    }
    
    // --- SCHEDULING ---
    // 3. Check if CPU is IDLE
    if (runningProcess === null) {
      if (readyQueue.length > 0) {
        // SRTF Policy: Sort ready queue by remaining burst time
        readyQueue.sort((a, b) => a.remainingBurst - b.remainingBurst);
        
        // Get the shortest remaining time job
        runningProcess = readyQueue.shift();
        
        // Set start time if it's the first time running
        const statIndex = processStats.findIndex(p => p.id === runningProcess.id);
        if (processStats[statIndex].startTime === -1) {
          processStats[statIndex].startTime = currentTime;
        }
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

    // 5. Update Running Process
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
        completedCount++; // Mark one process as done
      }
    }
    
    // 6. Update waiting time for all processes in ready queue
    readyQueue.forEach(proc => {
      const statIndex = processStats.findIndex(p => p.id === proc.id);
      processStats[statIndex].waitingTime += 1;
    });

    // 7. Increment time
    currentTime++;

    // Safety break
    if (currentTime > 20000) {
       console.error("SRTF Simulation stuck in a loop");
       break;
    }
    
    // If no processes are running and none are in queue, but not all are complete
    // (this means we must wait for the next arrival)
    if (runningProcess === null && readyQueue.length === 0 && completedCount < processes.length) {
       // Find the next arrival time
       const nextArrivalTime = Math.min(...simProcesses.filter(p => !p.hasArrived).map(p => p.arrivalTime));
       if (nextArrivalTime > currentTime && nextArrivalTime !== Infinity) {
           // Add an IDLE block until the next arrival
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