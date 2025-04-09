# Baguette Wiki

## Introduction

Baguette (`bget`) is an enhanced version of lodash's `get` function, designed to provide more powerful object and array traversal capabilities. The name "Baguette" is a play on words - "a better get" or "bget".

## Core Concept

While traditional object traversal functions like lodash's `get` allow you to access nested properties using string paths, Baguette extends this functionality to work seamlessly with arrays, providing capabilities to:

- Access array elements by index
- Map over arrays to extract specific properties
- Filter arrays using expressions
- Traverse deeply nested structures with a simple path syntax

## Installation

```bash
# Using npm
npm install baguette

# Using yarn
yarn add baguette
```

## API Reference

### bget(object, path, [defaultValue])

The main function exported by the library.

**Parameters:**
- `object` (Object|Array): The object or array to query
- `path` (String): The path to retrieve the value from
- `defaultValue` (Any, optional): The value returned if the path doesn't exist

**Returns:**
- The value at the specified path, or the default value if the path doesn't exist

## Path Syntax

Baguette supports a powerful path syntax that extends beyond traditional dot notation:

### Basic Object Traversal

```javascript
// Access nested properties with dot notation
bget(object, 'user.profile.name')
```

### Array Indexing

```javascript
// Access array element by index
bget(array, '[0]')
bget(object, 'items[0]')

// Access property of array element
bget(object, 'items[0].name')
```

### Array Mapping

```javascript
// Map over all elements in an array to extract a property
bget(object, 'items[].name') // Returns array of all names
```

### Array Filtering

```javascript
// Filter array elements using expressions
bget(object, 'items[id === "1"]') // Returns elements where id equals "1"
bget(object, 'items[price > 100]') // Returns elements where price is greater than 100
```

### Nested Arrays

```javascript
// Work with nested arrays
bget(nestedArrays, '[][].name') // Maps through two levels of arrays
```

## Examples

### Basic Usage

```javascript
import { bget } from 'baguette';

const user = {
  name: 'John',
  profile: {
    address: {
      city: 'New York'
    }
  },
  orders: [
    { id: '1', total: 50 },
    { id: '2', total: 100 },
    { id: '3', total: 150 }
  ]
};

// Basic property access
bget(user, 'name') // 'John'
bget(user, 'profile.address.city') // 'New York'

// Array access
bget(user, 'orders[1]') // { id: '2', total: 100 }
bget(user, 'orders[1].total') // 100

// Array mapping
bget(user, 'orders[].id') // ['1', '2', '3']

// Array filtering
bget(user, 'orders[total > 75]') // [{ id: '2', total: 100 }, { id: '3', total: 150 }]
bget(user, 'orders[total > 75].id') // ['2', '3']
```

### Working with Nested Arrays

```javascript
const data = {
  categories: [
    {
      name: 'Electronics',
      products: [
        { id: 'e1', name: 'Laptop', price: 1000 },
        { id: 'e2', name: 'Phone', price: 800 }
      ]
    },
    {
      name: 'Books',
      products: [
        { id: 'b1', name: 'Novel', price: 20 },
        { id: 'b2', name: 'Textbook', price: 50 }
      ]
    }
  ]
};

// Get all product names across all categories
bget(data, 'categories[].products[].name') // [['Laptop', 'Phone'], ['Novel', 'Textbook']]

// Get all expensive products across all categories
bget(data, 'categories[].products[price > 500].name') // [['Laptop', 'Phone'], []]
```

## Error Handling

Baguette provides graceful error handling:

- If the path doesn't exist, it returns `undefined` or the provided default value
- If the input object is not an object or array, it returns the default value
- If the path is not a string, it returns the default value

```javascript
// Using default values
bget(object, 'nonexistent.path', 'Not found') // 'Not found'
bget(null, 'any.path', 'Default for null') // 'Default for null'
```

## Future Enhancements

The library has plans for additional features:

### Reduce Operation

```javascript
// Flatten nested arrays
bget(nestedArrays, '[]<[]') // Flattens nested lists into a single list
```

### Multiple Field Selection

```javascript
// Get multiple fields at once
bget(objects, '[].fieldOne+fieldTwo') // Returns objects with only fieldOne and fieldTwo
```

## Contributing

Contributions to Baguette are welcome! See the README.md file for development commands and setup instructions.

## License

Baguette is licensed under the MIT License.
