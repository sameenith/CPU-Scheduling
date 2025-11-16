import { useState, useEffect, useRef } from "react";
import { useInterval } from "./useInterval";
import { runSimulationTick } from "./simulationEngine"; //  NAYA "BRAIN" IMPORT
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

export function useScheduler() {
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
  const readyQueueRef = useRef([]);
  const readyQueue1Ref = useRef([]);
  const readyQueue2Ref = useRef([]);
  const readyQueue3Ref = useRef([]);

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
      case "Multilevel Feedback Queue (MLFQ)":
        results = calculateMLFQ(processList, timeQuantum);
        break;
      default:
        alert("This algorithm is not implemented yet.");
        return;
    }

    setFinalResults(results);
    setGanttData(results.ganttChart);
  };

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

    const isMLFQ = selectedAlgorithm === "Multilevel Feedback Queue (MLFQ)";
    simulationProcessesRef.current = processList.map((p) => ({
      ...p,
      remainingBurst: p.burstTime,
      hasArrived: false,
      currentQueue: isMLFQ ? 1 : p.queueLevel || 3,
    }));

    statsDataRef.current = simulationProcessesRef.current.map((p) => ({
      ...p,
      completionTime: "N/A",
      turnaroundTime: "N/A",
      waitingTime: 0,
    }));

    setIsVisualizing(true);
  };

  // --- THE SIMULATION ENGINE (Refactored) ---
  useInterval(
    () => {
      // Yahaan par saari state ko ek object mein bundle karein
      const currentState = {
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
      };

      // Saari logic (200+ lines) ab is ek function mein chali gayi hai
      const newState = runSimulationTick(currentState);

      // Sirf UI state ko update karein
      setCurrentTime(newState.newCurrentTime);
      setGanttData(newState.newGanttData);
      setLiveReadyQueue(newState.newLiveReadyQueue);
      setLiveRunningProcess(newState.newLiveRunningProcess);
      
      if (newState.isFinished) {
        setIsVisualizing(false);
        setFinalResults(newState.finalResults);
      }
    },
    isVisualizing ? simulationSpeed : null
  );

  // --- RETURN ALL STATE AND HANDLERS FOR THE VIEW ---
  return {
    // State
    processList,
    selectedAlgorithm,
    timeQuantum,
    isVisualizing,
    currentTime,
    
    // Output State
    ganttData,
    liveReadyQueue,
    liveRunningProcess,
    finalResults,

    // Handlers
    addProcess,
    deleteProcess,
    updateProcess,
    handleRun,
    handleReset,
    handleVisualize,
    setSelectedAlgorithm,
    setTimeQuantum,
    setSimulationSpeed, // (Optional)
  };
}