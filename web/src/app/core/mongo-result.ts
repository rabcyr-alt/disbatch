// Helpers for the MongoDB driver result envelopes returned by mutating routes.
//
// The Perl backend returns bodies shaped like:
//   { "MongoDB::UpdateResult": { matched_count, modified_count, ... } }
//   { "MongoDB::InsertOneResult": { inserted_id, ... }, "id": "<oid>" }
//   { "MongoDB::DeleteResult": { deleted_count, ... } }
//   { "MongoDB::InsertManyResult": { inserted, ... } }
// possibly with an added top-level "error" string, and "id" on inserts.

const RESULT_KEYS = [
  'MongoDB::UpdateResult',
  'MongoDB::InsertOneResult',
  'MongoDB::DeleteResult',
  'MongoDB::InsertManyResult',
] as const;

export type MongoResultKind = (typeof RESULT_KEYS)[number];

export interface UnwrappedMongoResult {
  kind?: MongoResultKind;
  result: Record<string, unknown>;
  id?: unknown;
  error?: unknown;
}

/** Finds the driver-result key in a mutation response body and unwraps it. */
export function unwrapMongoResult(body: unknown): UnwrappedMongoResult {
  const obj = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const kind = RESULT_KEYS.find((k) => k in obj);
  return {
    kind,
    result: kind ? ((obj[kind] as Record<string, unknown>) ?? {}) : {},
    id: obj['id'],
    error: obj['error'],
  };
}
