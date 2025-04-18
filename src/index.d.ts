/**
 * Gets a value from an object or array using a path string.
 * 
 * Features:
 * - Standard object traversal via dot notation: 'user.name'
 * - Array indexing: 'items[0]'
 * - Array mapping: 'items[].id' (returns array of all item ids)
 * - Array filtering: 'items[id === "1"]' (returns items with id === "1")
 * - Array flattening: '[]<[]' (flattens nested arrays)
 * - Multiple field selection: 'name+email' (returns object with name and email fields)
 * 
 * @param root - The object or array to traverse
 * @param path - The path string to follow
 * @param fallback - Optional fallback value if path doesn't exist
 * @returns The value at the path, or the fallback value if provided
 */
export declare const bget: (root: Object, path?: string | String, fallback?: any) => any;
