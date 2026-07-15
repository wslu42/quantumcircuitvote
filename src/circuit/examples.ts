export const circuitExamples = {
  Bell: `qc.h(0)\nqc.cx(0, 1)\nqc.measure(0, 0)\nqc.measure(1, 1)`,
  'H gate': `qc.h(0)\nqc.measure(0, 0)`,
  Interference: `qc.h(0)\nqc.z(0)\nqc.h(0)\nqc.measure(0, 0)`,
  'Rotation and entanglement': `qc.ry(pi/2, 0)\nqc.cx(0, 1)\nqc.rz(pi/4, 1)\nqc.measure(0, 0)\nqc.measure(1, 1)`,
} as const
