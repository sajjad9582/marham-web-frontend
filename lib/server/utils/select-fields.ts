/** TypeORM 0.3+ requires object syntax: { id: true } instead of ['id']. */
export function selectFields<T extends string>(fields: readonly T[]): Record<T, true> {
  return Object.fromEntries(fields.map((field) => [field, true])) as Record<T, true>;
}
