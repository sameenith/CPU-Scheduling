// import { useState } from "react";

// // Reusable button component for styling
// function ActionButton({ onClick, children, className }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${className}`}
//     >
//       {children}
//     </button>
//   );
// }

// // Reusable input field component for editing
// function EditInput({ label, value, onChange, ...props }) {
//   return (
//     <div className="flex-1 min-w-[100px]">
//       <label className="block text-xs font-medium text-gray-400">{label}</label>
//       <input
//         type="number"
//         value={value}
//         onChange={onChange}
//         className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
//         {...props}
//       />
//     </div>
//   );
// }

// export default function ProcessItem({
//   process,
//   onDelete,
//   onUpdate,
//   selectedAlgorithm,
// }) {
//   const [isEditing, setIsEditing] = useState(false);

//   // State for the edit form
//   const [editData, setEditData] = useState({ ...process });

//   // Handle saving the edit
//   const handleSave = () => {
//     // We must ensure the data is numbers
//     const updatedProcess = {
//       ...editData,
//       arrivalTime: Number(editData.arrivalTime),
//       burstTime: Number(editData.burstTime),
//     };
//     if (editData.priority !== undefined) {
//       updatedProcess.priority = Number(editData.priority);
//     }
//     if (editData.queueLevel !== undefined) {
//       updatedProcess.queueLevel = Number(editData.queueLevel);
//     }

//     onUpdate(process.id, updatedProcess);
//     setIsEditing(false);
//   };

//   // Handle canceling the edit
//   const handleCancel = () => {
//     setIsEditing(false);
//     setEditData({ ...process }); // Reset data to original
//   };

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setEditData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   // Check which fields to show
//   const showPriority = selectedAlgorithm.includes("Priority");
//   const showQueueLevel =
//     selectedAlgorithm.includes("MLQ") || selectedAlgorithm.includes("MLFQ");

//   // --- RENDER LOGIC ---

//   // EDITING VIEW
//   if (isEditing) {
//     return (
//       <li className="bg-gray-700 p-4 rounded-md shadow-lg space-y-4">
//         <div className="flex flex-wrap gap-4">
//           <EditInput
//             label="Arrival"
//             name="arrivalTime"
//             value={editData.arrivalTime}
//             onChange={handleChange}
//             min="0"
//           />
//           <EditInput
//             label="Burst"
//             name="burstTime"
//             value={editData.burstTime}
//             onChange={handleChange}
//             min="1"
//           />
//           {showPriority && (
//             <EditInput
//               label="Priority"
//               name="priority"
//               value={editData.priority || ""}
//               onChange={handleChange}
//               min="0"
//             />
//           )}
//           {showQueueLevel && (
//             <EditInput
//               label="Queue"
//               name="queueLevel"
//               value={editData.queueLevel || ""}
//               onChange={handleChange}
//               min="1"
//             />
//           )}
//         </div>
//         <div className="flex justify-end gap-3">
//           <ActionButton
//             onClick={handleCancel}
//             className="bg-gray-500 hover:bg-gray-600 text-white"
//           >
//             Cancel
//           </ActionButton>
//           <ActionButton
//             onClick={handleSave}
//             className="bg-green-600 hover:bg-green-700 text-white"
//           >
//             Save
//           </ActionButton>
//         </div>
//       </li>
//     );
//   }

//   // DEFAULT VIEW
//   return (
//     <li className="flex flex-wrap justify-between items-center bg-gray-700 p-3 rounded-md shadow transition-all duration-200">
//       <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
//         <span className="font-mono bg-blue-900 text-blue-200 px-2 py-0.5 rounded text-sm">
//           PID: {process.id.toString().slice(-4)}{" "}
//           {/* Show last 4 digits of ID */}
//         </span>
//         <span className="text-gray-300">
//           <strong>Arrival:</strong> {process.arrivalTime}ms
//         </span>
//         <span className="text-gray-300">
//           <strong>Burst:</strong> {process.burstTime}ms
//         </span>
//         {process.priority !== undefined && (
//           <span className="text-gray-300">
//             <strong>Priority:</strong> {process.priority}
//           </span>
//         )}
//         {process.queueLevel !== undefined && (
//           <span className="text-gray-300">
//             <strong>Queue:</strong> {process.queueLevel}
//           </span>
//         )}
//       </div>
//       <div className="flex gap-2 mt-2 sm:mt-0">
//         <ActionButton
//           onClick={() => setIsEditing(true)}
//           className="bg-yellow-500 hover:bg-yellow-600 text-black"
//         >
//           Edit {/* ✏️ */}
//         </ActionButton>
//         <ActionButton
//           onClick={() => onDelete(process.id)}
//           className="bg-red-600 hover:bg-red-700 text-white"
//         >
//           Delete {/* 🗑️ */}
//         </ActionButton>
//       </div>
//     </li>
//   );
// }


import { useState } from "react";

// Reusable button component for styling
function ActionButton({ onClick, children, className, disabled }) {
  // 👈 ADD DISABLED
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled} // 👈 ADD THIS
      className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

// Reusable input field component for editing
function EditInput({ label, value, onChange, ...props }) {
  return (
    <div className="flex-1 min-w-[100px]">
      <label className="block text-xs font-medium text-gray-400">{label}</label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
        {...props}
      />
    </div>
  );
}

export default function ProcessItem({
  process,
  onDelete,
  onUpdate,
  selectedAlgorithm,
  isVisualizing, // 👈 ADD THIS
}) {
  const [isEditing, setIsEditing] = useState(false);

  // State for the edit form
  const [editData, setEditData] = useState({ ...process });

  // Handle saving the edit
  const handleSave = () => {
    // We must ensure the data is numbers
    const updatedProcess = {
      ...editData,
      arrivalTime: Number(editData.arrivalTime),
      burstTime: Number(editData.burstTime),
    };
    if (editData.priority !== undefined) {
      updatedProcess.priority = Number(editData.priority);
    }
    if (editData.queueLevel !== undefined) {
      updatedProcess.queueLevel = Number(editData.queueLevel);
    }

    onUpdate(process.id, updatedProcess);
    setIsEditing(false);
  };

  // Handle canceling the edit
  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...process }); // Reset data to original
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Check which fields to show
  const showPriority = selectedAlgorithm.includes("Priority");
  const showQueueLevel =
    selectedAlgorithm.includes("MLQ") || selectedAlgorithm.includes("MLFQ");

  // --- RENDER LOGIC ---

  // EDITING VIEW
  if (isEditing) {
    return (
      <li className="bg-gray-700 p-4 rounded-md shadow-lg space-y-4">
        <div className="flex flex-wrap gap-4">
          <EditInput
            label="Arrival"
            name="arrivalTime"
            value={editData.arrivalTime}
            onChange={handleChange}
            min="0"
          />
          <EditInput
            label="Burst"
            name="burstTime"
            value={editData.burstTime}
            onChange={handleChange}
            min="1"
          />
          {showPriority && (
            <EditInput
              label="Priority"
              name="priority"
              value={editData.priority || ""}
              onChange={handleChange}
              min="0"
            />
          )}
          {showQueueLevel && (
            <EditInput
              label="Queue"
              name="queueLevel"
              value={editData.queueLevel || ""}
              onChange={handleChange}
              min="1"
            />
          )}
        </div>
        <div className="flex justify-end gap-3">
          <ActionButton
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            Cancel
          </ActionButton>
          <ActionButton
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Save
          </ActionButton>
        </div>
      </li>
    );
  }

  // DEFAULT VIEW
  return (
    <li className="flex flex-wrap justify-between items-center bg-gray-700 p-3 rounded-md shadow transition-all duration-200">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-mono bg-blue-900 text-blue-200 px-2 py-0.5 rounded text-sm">
          PID: {process.pid} {/* Use the new 'pid' field */}
        </span>
        <span className="text-gray-300">
          <strong>Arrival:</strong> {process.arrivalTime}ms
        </span>
        <span className="text-gray-300">
          <strong>Burst:</strong> {process.burstTime}ms
        </span>
        {process.priority !== undefined && (
          <span className="text-gray-300">
            <strong>Priority:</strong> {process.priority}
          </span>
        )}
        {process.queueLevel !== undefined && (
          <span className="text-gray-300">
            <strong>Queue:</strong> {process.queueLevel}
          </span>
        )}
      </div>
      <div className="flex gap-2 mt-2 sm:mt-0">
        <ActionButton
          onClick={() => setIsEditing(true)}
          disabled={isVisualizing} // 👈 ADD THIS
          className="bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          Edit
        </ActionButton>
        <ActionButton
          onClick={() => onDelete(process.id)}
          disabled={isVisualizing} // 👈 ADD THIS
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Delete
        </ActionButton>
      </div>
    </li>
  );
}
