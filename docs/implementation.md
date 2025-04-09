# Baguette Implementation Details

This document provides a technical overview of how Baguette works internally.

## Architecture

Baguette uses a recursive descent parser to interpret path strings and traverse objects and arrays. The implementation follows these key steps:

1. Parse the path string character by character
2. Identify tokens (dot, bracket, expression, etc.)
3. Apply the appropriate traversal logic based on the token
4. Return the result or continue parsing

## Key Components

### Token Types

Baguette recognizes several token types:

- `DOT`: Represents a dot (`.`) for object property access
- `LBRACK`: Represents a left bracket (`[`) for array access
- `RBRACK`: Represents a right bracket (`]`) for array access
- `CHAR`: Represents a character in a property name
- `EXP`: Represents an expression for filtering
- `NONE`: Represents an empty path
- `INTEGER`: Represents a numeric index

### Core Functions

#### `bget(root, path, fallback)`

The main exported function that handles input validation and error handling.

#### `parsePath(root, path)`

The entry point for path parsing that recursively processes the path string.

#### `getToken(path)`

Identifies the next token in the path string.

#### `scanPathUntil(path, signal)`

Scans the path string until a specific condition is met.

#### `parseDot(root, path)`

Handles dot notation for object property access.

#### `parseObjectField(root, path)`

Extracts a field from an object or maps it across an array of objects.

#### `parseLBrack(root, path)`

Handles array access, including indexing, mapping, and filtering.

#### `parseRBrack(root, path)`

Handles the closing bracket and continues parsing.

#### `applyExpression(array, expression)`

Applies a filter expression to an array.

#### `evalInScope(expression, context)`

Safely evaluates an expression within the context of an object.

## Path Parsing Algorithm

1. Start with the root object and the full path
2. Identify the next token in the path
3. Based on the token type:
   - If it's a dot, process object property access
   - If it's a left bracket, process array access
   - If it's a character, process object field access
   - If it's an empty path, return the current object
4. Continue parsing the remaining path with the new root object
5. Return the final result when the path is fully processed

## Expression Evaluation

Baguette uses JavaScript's Function constructor to safely evaluate expressions within the context of an object. This allows for powerful filtering capabilities:

```javascript
// How expression evaluation works internally
function evalInScope(expression, context) {
  const body = `return ${expression};`
  return (new Function(...Object.keys(context), body))(...Object.values(context))
}
```

This approach allows users to write expressions like `items[price > 100]` that get evaluated against each item in the array.

## Error Handling

Baguette implements robust error handling:

- Invalid paths return the fallback value
- Non-object inputs return the fallback value
- Non-string paths return the fallback value
- Runtime errors during traversal return the fallback value

## Performance Considerations

- The parser is optimized for common path patterns
- Expression evaluation uses JavaScript's native Function constructor for speed
- The implementation avoids unnecessary object creation during traversal
- Error handling is designed to fail gracefully without throwing exceptions

## Future Implementation Plans

### Reduce Operation

The planned reduce operation (`[]<[]`) will flatten nested arrays by recursively concatenating arrays.

### Multiple Field Selection

The planned multiple field selection (`[].fieldOne+fieldTwo`) will create a projection of objects with only the specified fields.
