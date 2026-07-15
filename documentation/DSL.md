# Circuit DSL

The teacher-facing syntax resembles Qiskit method calls, but it is not Python and is never executed.

```python
qc.h(0)
qc.cx(0, 1)
qc.measure(0, 0)
qc.measure(1, 1)
```

## Supported calls

- Single-qubit gates: `qc.x(q)`, `qc.y(q)`, `qc.z(q)`, `qc.h(q)`
- Rotations: `qc.rx(angle, q)`, `qc.ry(angle, q)`, `qc.rz(angle, q)`
- Multi-qubit gates: `qc.cx(control, target)`, `qc.cz(control, target)`, `qc.swap(q1, q2)`
- Measurement: `qc.measure(qubit, classicalBit)`
- Barriers: `qc.barrier()` or `qc.barrier(q0, q1, ...)`

Rotation angles are preserved as text. Blank lines, full-line comments, and trailing `# comments` are accepted.

Indices must be non-negative integers. Multi-qubit gates cannot use the same qubit twice. Unsupported syntax produces line-specific errors and is never ignored. Variables, loops, constructors, registers, conditionals, custom gates, `measure_all`, reset, controlled rotations, and arbitrary Python are outside the MVP.
