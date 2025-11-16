/**
 * Calculates First-Come, First-Served (FCFS) scheduling.
 * @param {Array} processes - A list of process objects.
 * Each object: { id, arrivalTime, burstTime }
 * @returns {Object} - Contains gantt chart data, process stats, and averages.
 */
export const calculateFCFS = (processes) => {
  // 1. Create a deep copy to avoid mutating the original state
  //    And sort by arrivalTime to ensure FCFS order.
  const sortedProcesses = [...processes]
    .map((p) => ({ ...p, pid: p.id.toString().slice(-4) })) // Use short PID for display
    .sort((a, b) => a.arrivalTime - b.arrivalTime);

  const ganttChart = [];
  const processStats = [];
  let currentTime = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;

  // 2. Loop through each process
  for (const process of sortedProcesses) {
    // Check if CPU is idle before this process arrives
    if (currentTime < process.arrivalTime) {
      ganttChart.push({
        pid: 'IDLE',
        start: currentTime,
        end: process.arrivalTime,
        duration: process.arrivalTime - currentTime,
        color: 'bg-gray-500', // Idle color
      });
      currentTime = process.arrivalTime;
    }

    // 3. Calculate metrics for this process
    const startTime = currentTime;
    const completionTime = startTime + process.burstTime;
    const turnaroundTime = completionTime - process.arrivalTime;
    const waitingTime = turnaroundTime - process.burstTime;

    // 4. Add data for Gantt chart
    ganttChart.push({
      pid: `P${process.pid}`,
      start: startTime,
      end: completionTime,
      duration: process.burstTime,
    });

    // 5. Add data for results table
    processStats.push({
      ...process,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
    });

    // 6. Update totals
    totalWaitingTime += waitingTime;
    totalTurnaroundTime += turnaroundTime;
    currentTime = completionTime; // Move time to the end of this process
  }

  // 7. Calculate averages
  const avgWaitingTime = (totalWaitingTime / processes.length) || 0;
  const avgTurnaroundTime = (totalTurnaroundTime / processes.length) || 0;

  // 8. Return all calculated data
  return {
    ganttChart,
    processStats,
    averages: {
      waitingTime: avgWaitingTime.toFixed(2),
      turnaroundTime: avgTurnaroundTime.toFixed(2),
    },
  };
};