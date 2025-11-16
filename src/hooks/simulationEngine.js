
export function runSimulationTick(state) {
  const {
    currentTime,
    selectedAlgorithm,
    timeQuantum,
    simulationProcessesRef,
    runningProcessRef,
    readyQueueRef,
    readyQueue1Ref,
    readyQueue2Ref,
    readyQueue3Ref,
    ganttDataRef,
    statsDataRef,
    currentSliceRef,
  } = state;

  const currentTick = currentTime;
  const isMLQ = selectedAlgorithm === "Multilevel Queue (MLQ)";
  const isMLFQ = selectedAlgorithm === "Multilevel Feedback Queue (MLFQ)";
  const TQ1 = timeQuantum;
  const TQ2 = timeQuantum * 2;

  // 1. Check for new arrivals
  simulationProcessesRef.current.forEach((proc) => {
    if (!proc.hasArrived && currentTick >= proc.arrivalTime) {
      proc.hasArrived = true;
      if (isMLQ || isMLFQ) {
        if (isMLFQ) {
          proc.currentQueue = 1;
          readyQueue1Ref.current.push(proc);
        } else {
          switch (proc.currentQueue) {
            case 1: readyQueue1Ref.current.push(proc); break;
            case 2: readyQueue2Ref.current.push(proc); break;
            case 3:
            default: readyQueue3Ref.current.push(proc); break;
          }
        }
      } else {
        readyQueueRef.current.push(proc);
      }
    }
  });

  // 2. Check for Preemption
  if (runningProcessRef.current) {
    let shouldPreempt = false;

    if (isMLQ || isMLFQ) {
      const runningQueue = runningProcessRef.current.currentQueue;
      if (runningQueue > 1 && readyQueue1Ref.current.length > 0) {
        shouldPreempt = true; // Q1 preempts Q2/Q3
      } else if (runningQueue > 2 && readyQueue2Ref.current.length > 0) {
        shouldPreempt = true; // Q2 preempts Q3
      } else if (isMLQ && runningQueue === 1 && currentSliceRef.current >= TQ1) {
        shouldPreempt = true; // MLQ RR Time Slice
      } else if (isMLFQ) {
        if (runningQueue === 1 && currentSliceRef.current >= TQ1) {
          shouldPreempt = true; // MLFQ Demotion Q1->Q2
        } else if (runningQueue === 2 && currentSliceRef.current >= TQ2) {
          shouldPreempt = true; // MLFQ Demotion Q2->Q3
        }
      }
    } else if (readyQueueRef.current.length > 0) {
      // Logic for simple preemptive algorithms
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
      const proc = runningProcessRef.current;
      if (isMLQ || isMLFQ) {
        if (isMLFQ) {
          if (proc.currentQueue === 1 && currentSliceRef.current >= TQ1) {
            proc.currentQueue = 2;
            readyQueue2Ref.current.push(proc);
          } else if (proc.currentQueue === 2 && currentSliceRef.current >= TQ2) {
            proc.currentQueue = 3;
            readyQueue3Ref.current.push(proc);
          } else { // Preempted by higher priority, not demoted
            if (proc.currentQueue === 1) readyQueue1Ref.current.push(proc);
            else if (proc.currentQueue === 2) readyQueue2Ref.current.push(proc);
            else readyQueue3Ref.current.push(proc);
          }
        } else { // MLQ logic (no demotion)
          if (proc.currentQueue === 1) readyQueue1Ref.current.push(proc);
          else if (proc.currentQueue === 2) readyQueue2Ref.current.push(proc);
          else readyQueue3Ref.current.push(proc);
        }
      } else {
        readyQueueRef.current.push(runningProcessRef.current);
      }
      runningProcessRef.current = null;
      currentSliceRef.current = 0;
    }
  }

  // 3. Check if CPU is IDLE (Scheduling Logic)
  if (runningProcessRef.current === null) {
    if (isMLQ || isMLFQ) {
      if (readyQueue1Ref.current.length > 0) {
        runningProcessRef.current = readyQueue1Ref.current.shift();
      } else if (readyQueue2Ref.current.length > 0) {
        runningProcessRef.current = readyQueue2Ref.current.shift();
      } else if (readyQueue3Ref.current.length > 0) {
        runningProcessRef.current = readyQueue3Ref.current.shift();
      }
      currentSliceRef.current = 0;
    } else {
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
            break;
        }
        runningProcessRef.current = readyQueueRef.current.shift();
        currentSliceRef.current = 0;
      }
    }
  }

  // 4. Update Gantt Chart Data
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
    const runningQueue = isMLQ || isMLFQ ? runningProcessRef.current.currentQueue : 0;

    if (selectedAlgorithm === "Round Robin (RR)" || (isMLQ && runningQueue === 1) || (isMLFQ && runningQueue < 3)) {
      currentSliceRef.current += 1;
    }

    runningProcessRef.current.remainingBurst -= 1;

    if (runningProcessRef.current.remainingBurst <= 0) {
      // Process finished
      const finishedProcess = runningProcessRef.current;
      const completionTime = currentTick + 1;

      const statIndex = statsDataRef.current.findIndex((p) => p.id === finishedProcess.id);
      if (statIndex > -1) {
        const stats = statsDataRef.current[statIndex];
        stats.completionTime = completionTime;
        stats.turnaroundTime = completionTime - stats.arrivalTime;
        stats.waitingTime = stats.turnaroundTime - stats.burstTime;
      }
      runningProcessRef.current = null;
      currentSliceRef.current = 0;
    }
    else if (isMLFQ) {
      const TQ1 = timeQuantum;
      const TQ2 = timeQuantum * 2;
      const proc = runningProcessRef.current;
      if (proc.currentQueue === 1 && currentSliceRef.current >= TQ1) {
        proc.currentQueue = 2;
        readyQueue2Ref.current.push(proc);
        runningProcessRef.current = null;
        currentSliceRef.current = 0;
      } else if (proc.currentQueue === 2 && currentSliceRef.current >= TQ2) {
        proc.currentQueue = 3;
        readyQueue3Ref.current.push(proc);
        runningProcessRef.current = null;
        currentSliceRef.current = 0;
      }
    }
    else if ((selectedAlgorithm === "Round Robin (RR)" || (isMLQ && runningProcessRef.current.currentQueue === 1)) && currentSliceRef.current >= timeQuantum) {
      if (isMLQ) {
        readyQueue1Ref.current.push(runningProcessRef.current);
      } else {
        readyQueueRef.current.push(runningProcessRef.current);
      }
      runningProcessRef.current = null;
      currentSliceRef.current = 0;
    }
  }

  // 6. Update waiting time
  let allWaitingProcs = [];
  if (isMLQ || isMLFQ) {
    allWaitingProcs = [...readyQueue1Ref.current, ...readyQueue2Ref.current, ...readyQueue3Ref.current];
  } else {
    allWaitingProcs = [...readyQueueRef.current];
  }

  allWaitingProcs.forEach((proc) => {
    const statIndex = statsDataRef.current.findIndex((p) => p.id === proc.id);
    if (statIndex > -1) {
      statsDataRef.current[statIndex].waitingTime += 1;
    }
  });

  // 7. Check for completion
  const simulationHasProcesses = simulationProcessesRef.current.length > 0;
  const allArrivedFinished = simulationProcessesRef.current
    .filter((p) => p.hasArrived)
    .every((p) => p.remainingBurst <= 0);
  const allProcessesArrived = simulationProcessesRef.current.every((p) => p.hasArrived);
  const allQueuesEmpty = (isMLQ || isMLFQ)
    ? (readyQueue1Ref.current.length === 0 && readyQueue2Ref.current.length === 0 && readyQueue3Ref.current.length === 0)
    : (readyQueueRef.current.length === 0);

  let isFinished = false;
  let finalResults = null;

  if (
    simulationHasProcesses &&
    allProcessesArrived &&
    allArrivedFinished &&
    allQueuesEmpty &&
    runningProcessRef.current === null
  ) {
    isFinished = true;
    const totalWT = statsDataRef.current.reduce((sum, p) => sum + p.waitingTime, 0);
    const totalTT = statsDataRef.current.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const avgWT = (totalWT / statsDataRef.current.length).toFixed(2);
    const avgTT = (totalTT / statsDataRef.current.length).toFixed(2);

    finalResults = {
      processStats: statsDataRef.current,
      averages: { waitingTime: avgWT, turnaroundTime: avgTT },
    };
  }
  
  // 8. Return the new state for the UI
  return {
    newCurrentTime: currentTick + 1,
    newGanttData: [...ganttDataRef.current],
    newLiveReadyQueue: allWaitingProcs,
    newLiveRunningProcess: runningProcessRef.current,
    isFinished,
    finalResults,
  };
}