export function outcomesFor(bitCount: number): string[] {
  if (bitCount < 1 || bitCount > 8) return []
  return Array.from({ length: 2 ** bitCount }, (_, value) => value.toString(2).padStart(bitCount, '0'))
}
