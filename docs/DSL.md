# Circuit DSL

The teacher-facing syntax resembles Qiskit method calls, but it is not Python and is never executed.

```python
qc.h(0)
qc.cx(0, 1)
qc.measure(0, 0)
qc.measure(1, 1)
```

Supported methods are `x`, `y`, `z`, `h`, `rx`, `ry`, `rz`, `cx`, `cz`, `swap`, `measure`, and `barrier`. Rotation angles are preserved as text. Blank lines, full-line comments, and trailing `# comments` are accepted.

Indices must be non-negative integers. Multi-qubit gates cannot use the same qubit twice. Unsupported syntax produces line-specific errors and is never ignored.
