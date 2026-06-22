/** True when value is non-null and (if an array) non-empty. */
export function notNullOrEmpty(value: any) {
  return value != null && (!Array.isArray(value) || value.length !== 0);
}

/** Normalize a multiple-choice query param into an int[] (always an array). */
export function parseMultipleChoiceParam(param: any) {
  if (!notNullOrEmpty(param)) return;

  if (!Array.isArray(param)) param = [param];

  return param.map((value: any) =>
    typeof value === 'string' ? parseInt(value) : value,
  );
}
