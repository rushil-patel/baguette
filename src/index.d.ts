/**
 * Type definition for the baguette library
 */

/**
 * A generic type for any object with string keys
 */
export type AnyObject = Record<string, any>;

/**
 * Gets a value from an object or array using a path string
 * 
 * @param root - The object or array to get a value from
 * @param path - A string path to the value (e.g. 'user.address.street' or '[0].name')
 * @param fallback - A value to return if the path doesn't exist
 * @returns The value at the path, or the fallback value if the path doesn't exist
 * 
 * @example
 * // Get a nested property
 * const user = { name: 'John', address: { city: 'New York' } };
 * bget(user, 'address.city'); // 'New York'
 * 
 * @example
 * // Get a value from an array
 * const users = [{ name: 'John' }, { name: 'Jane' }];
 * bget(users, '[1].name'); // 'Jane'
 * 
 * @example
 * // Get values from all items in an array
 * const users = [{ name: 'John' }, { name: 'Jane' }];
 * bget(users, 'name'); // ['John', 'Jane']
 * 
 * @example
 * // Filter an array with an expression
 * const users = [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }];
 * bget(users, "[age > 25]"); // [{ name: 'John', age: 30 }]
 */
export declare function bget<T extends AnyObject | any[], F = any>(
  root: T, 
  path?: string | String, 
  fallback?: F
): any;
