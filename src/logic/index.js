
// Import from our specific algorithm files
import { calculateFCFS } from './fcfs';
import { calculateSJF } from './sjf';
import { calculateSRTF } from './srtf';
import { calculatePriority } from './priorityNonPreemptive';
import { calculatePriorityPreemptive } from './priorityPreemptive';
import { calculateRR } from './rr';
import { calculateMLQ } from './mlq';
import { calculateMLFQ } from './mlfq';
// (When we add SJF, we will import it here)

// Re-export them all as a single module
export {
  calculateFCFS,
  calculateSJF,
  calculateSRTF,
  calculatePriority,
  calculatePriorityPreemptive,
  calculateRR,
  calculateMLQ,
  calculateMLFQ,
};