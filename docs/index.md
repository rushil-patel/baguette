# Baguette Documentation

Welcome to the Baguette documentation! Baguette (`bget`) is an enhanced version of lodash's `get` function, designed to provide more powerful object and array traversal capabilities.

## Table of Contents

- [User Guide](README.md) - Comprehensive guide to using Baguette
- [Implementation Details](implementation.md) - Technical overview of how Baguette works internally
- [Advanced Examples](advanced-examples.md) - Complex usage patterns and scenarios

## Quick Links

- [Installation](README.md#installation)
- [API Reference](README.md#api-reference)
- [Path Syntax](README.md#path-syntax)
- [Examples](README.md#examples)
- [Error Handling](README.md#error-handling)
- [Future Enhancements](README.md#future-enhancements)
- [Contributing](README.md#contributing)

## Project Overview

Baguette is a JavaScript/TypeScript library that enhances object and array traversal with a powerful path syntax. The name "Baguette" is a play on words - "a better get" or "bget".

### Key Features

- **Object Traversal**: Access nested properties with dot notation
- **Array Indexing**: Access array elements by index
- **Array Mapping**: Extract properties from all elements in an array
- **Array Filtering**: Filter arrays using expressions
- **Nested Arrays**: Work with deeply nested array structures
- **Error Handling**: Graceful handling of invalid paths and inputs

### Simple Example

```javascript
import { bget } from 'baguette';

const data = {
  users: [
    { id: '1', name: 'Alice', roles: ['admin', 'user'] },
    { id: '2', name: 'Bob', roles: ['user'] },
    { id: '3', name: 'Charlie', roles: ['user', 'moderator'] }
  ]
};

// Get all user names
bget(data, 'users[].name'); // ['Alice', 'Bob', 'Charlie']

// Get admin users
bget(data, 'users[roles.includes("admin")]'); // [{ id: '1', name: 'Alice', roles: ['admin', 'user'] }]
```

## License

Baguette is licensed under the MIT License.
