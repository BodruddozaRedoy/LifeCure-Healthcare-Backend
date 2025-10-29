/**
 * 🎯 pick Utility Function
 * -----------------------------------------------------
 * Creates a new object containing only the specified keys
 * from the original object.
 *
 * ✅ Useful for selecting certain fields from a large object,
 *    e.g., sanitizing user input or shaping database queries.
 *
 * @param obj - The source object
 * @param keys - Array of keys to pick from the object
 * @returns A new object with only the selected keys
 */
const pick = <T extends Record<string, unknown>, k extends keyof T>(
  obj: T,
  keys: k[]
): Partial<T> => {
  const finalObject: Partial<T> = {};

  // Loop through each key and add it to finalObject if it exists in obj
  for (const key of keys) {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      finalObject[key] = obj[key];
    }
  }

  return finalObject;
};

export default pick;
