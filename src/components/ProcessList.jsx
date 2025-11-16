import ProcessItem from './ProcessItem';

export default function ProcessList({
  processList,
  onDelete,
  onUpdate,
  selectedAlgorithm,
  isVisualizing,
}) {
  if (processList.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        Add processes using the form to begin.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {processList.map((process) => (
        <ProcessItem
          key={process.id}
          process={process}
          onDelete={onDelete}
          onUpdate={onUpdate}
          selectedAlgorithm={selectedAlgorithm} // 👈 This prop is crucial
          isVisualizing={isVisualizing} // 👈 This prop is also crucial
        />
      ))}
    </ul>
  );
}