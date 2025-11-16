export const calculateMLFQ = (processes, timeQuantum) => {
  const TQ1 = timeQuantum;
  const TQ2 = timeQuantum * 2;

  // 1. Create deep copies
  let simProcesses = processes.map(p => ({
    ...p,
    pid: p.id.toString().slice(-4),
    remainingBurst: p.burstTime,
    hasArrived: false,
    currentQueue: 1, 
  }));

  const ganttChart = [];
  let processStats = simProcesses.map(p => ({ ...p, waitingTime: 0, startTime: -1 }));
  
  let currentTime = 0;
  // 3 Ready Queues
  let readyQueue1 = [];
  let readyQueue2 = [];
  let readyQueue3 = [];
  
  let runningProcess = null;
  let completedCount = 0;
  let currentSlice = 0; 

  // Loop until all processes are completed
  while (completedCount < processes.length) {
    
    // 2. Add newly arrived processes to Q1
    simProcesses.forEach(p => {
      if (!p.hasArrived && p.arrivalTime <= currentTime) {
        p.hasArrived = true;
        p.currentQueue = 1; 
        readyQueue1.push(p);
      }
    });

    // 3. Check for Preemption
    if (runningProcess) {
      const runningQueue = runningProcess.currentQueue;

      // Rule 1: Q1 process arrives, preempts Q2 or Q3
      if (runningQueue > 1 && readyQueue1.length > 0) {
        if (runningQueue === 2) readyQueue2.push(runningProcess);
        else readyQueue3.push(runningProcess);
        runningProcess = null;
        currentSlice = 0;
      }
      // Rule 2: Q2 process arrives, preempts Q3
      else if (runningQueue > 2 && readyQueue2.length > 0) {
        readyQueue3.push(runningProcess);
        runningProcess = null;
        currentSlice = 0;
      }
    }
    
    // 4. Check if CPU is IDLE (Scheduling Logic)
    if (runningProcess === null) {
      // Check Queues in order of priority
      if (readyQueue1.length > 0) {
        runningProcess = readyQueue1.shift(); 
        currentSlice = 0;
      } else if (readyQueue2.length > 0) {
        runningProcess = readyQueue2.shift(); 
        currentSlice = 0;
      } else if (readyQueue3.length > 0) {
        runningProcess = readyQueue3.shift(); 
        currentSlice = 0; 
      }

      if (runningProcess && processStats.find(p => p.id === runningProcess.id).startTime === -1) {
        const statIndex = processStats.findIndex(p => p.id === runningProcess.id);
        processStats[statIndex].startTime = currentTime;
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
      currentSlice++;
      runningProcess.remainingBurst -= 1;

      // Check for process completion
      if (runningProcess.remainingBurst <= 0) {
        const completionTime = currentTime + 1;
        const statIndex = processStats.findIndex(p => p.id === runningProcess.id);
        
        processStats[statIndex].completionTime = completionTime;
        processStats[statIndex].turnaroundTime = completionTime - processStats[statIndex].arrivalTime;
        processStats[statIndex].waitingTime = processStats[statIndex].turnaroundTime - processStats[statIndex].burstTime;
        
        runningProcess = null;
        currentSlice = 0;
        completedCount++;
      }
      // --- 👇 MLFQ DEMOTION LOGIC ---
      // Check for Q1 Demotion
      else if (runningProcess.currentQueue === 1 && currentSlice >= TQ1) {
        runningProcess.currentQueue = 2; // Demote to Q2
        readyQueue2.push(runningProcess); // Add to back of Q2
        runningProcess = null;
        currentSlice = 0;
      }
      // Check for Q2 Demotion
      else if (runningProcess.currentQueue === 2 && currentSlice >= TQ2) {
        runningProcess.currentQueue = 3; // Demote to Q3
        readyQueue3.push(runningProcess); // Add to back of Q3
        runningProcess = null;
        currentSlice = 0;
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
       console.error("MLFQ Simulation stuck in a loop");
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
           currentTime = nextArrivalTime;
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