/**
 * Safely retrieves a value from a nested object or array using a path string.
 * 
 * @template T - The type of the root object/array
 * @template R - The type of the fallback value and expected return type
 * 
 * @param root - The object or array to retrieve values from
 * @param path - A string path to the desired value (e.g., 'user.address.street' or 'items[0].name')
 * @param fallback - Value to return if the path doesn't exist
 * 
 * @returns The value at the specified path, or the fallback value if the path doesn't exist
 * 
 * @example
 * // Simple object property access
 * bget(user, 'address.city'); // returns user.address.city
 * 
 * @example
 * // Array access with index
 * bget(data, 'items[0].name'); // returns data.items[0].name
 * 
 * @example
 * // Array filtering with expression
 * bget(users, "[age > 30].name"); // returns names of users with age > 30
 * 
 * @example
 * // With fallback value
 * bget(user, 'address.zipCode', 'Unknown'); // returns 'Unknown' if path doesn't exist
 */
export declare function bget<T = any, R = any>(root: T, path?: string | String, fallback?: R): R | any;
