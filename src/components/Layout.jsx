import { useScheduler } from "../hooks/useScheduler"; 
import InputForm from "./InputForm";
import Controls from "./Controls";
import ProcessList from "./ProcessList";
import GanttChart from "./GanttChart";
import ResultsTable from "./ResultsTable";
import LiveStatus from "./LiveStatus";

export default function Layout() {
  // --- 1. Saari Logic ab ek line mein hai ---
  const {
    processList,
    selectedAlgorithm,
    timeQuantum,
    isVisualizing,
    currentTime,
    ganttData,
    liveReadyQueue,
    liveRunningProcess,
    finalResults,
    addProcess,
    deleteProcess,
    updateProcess,
    handleRun,
    handleReset,
    handleVisualize,
    setSelectedAlgorithm,
    setTimeQuantum,
  } = useScheduler();

  // --- 2. Sirf JSX (View) yahaan bachta hai ---
  return (
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
          {/* Saare props seedha hook se component mein jaa rahe hain */}
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