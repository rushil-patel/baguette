# Baguette

`bget` : A better `get`.

The is meant to be an enhanced version of lodash `get`.

In addition to standard object traversal via string path, `bget` will allow you to traverse and operate on arrays. The goal being to provide the capability to perform filters, maps, and reductions via a string path.

# Usage

## Arrays
```js
import {bget} from 'baguette';

let object = {items: [{id: '0'}, {id: '1'},{id: '2'}]}

bget(object, 'items[1]') // -> {id: '1'}
bget(object, 'items[1].id') // -> '1'
bget(object, 'items[].id') // -> ['0', '1', '2']
bget(object, 'items[id === "1"]') // -> [{id: '1'}]
bget(object, 'items[id === "1"].id') // -> '1'

let nestedLists = [[{name: 'tiger'}, {name: 'lion'}], [{name: 'wolf'}, {name: 'dog'}]]

bget(nestedLists, '[][].name') // -> [['tiger', lion'], ['wolf', 'dog']]
```

## Reduce Operation ('<')
Flattens nested arrays into a single array.

```js
import {bget} from 'baguette';

// Flatten nested arrays
let nestedArrays = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
bget(nestedArrays, '<[]') // -> [1, 2, 3, 4, 5, 6, 7, 8, 9]

// Flatten nested object arrays
let nestedObjectArrays = [
  [{ id: 'a1' }, { id: 'a2' }],
  [{ id: 'b1' }, { id: 'b2' }]
]
bget(nestedObjectArrays, '<[]') // -> [{ id: 'a1' }, { id: 'a2' }, { id: 'b1' }, { id: 'b2' }]

// Chain with other operations
bget(nestedObjectArrays, '<[].id') // -> ['a1', 'a2', 'b1', 'b2']
```

## Multiple Fields ('+')
Returns a mapping of items with multiple fields.

```js
import {bget} from 'baguette';

// Get multiple fields from an object
let user = { id: '123', name: 'John', age: 30, email: 'john@example.com' }
bget(user, 'id+name') // -> { id: '123', name: 'John' }

// Get multiple fields from an array of objects
let users = [
  { id: '1', name: 'John', age: 30 },
  { id: '2', name: 'Jane', age: 25 }
]
bget(users, 'id+name') // -> [{ id: '1', name: 'John' }, { id: '2', name: 'Jane' }]

// Chain with array operations
let usersWithAddresses = [
  { id: '1', name: 'John', address: { city: 'New York', zip: '10001' } },
  { id: '2', name: 'Jane', address: { city: 'Boston', zip: '02108' } }
]
bget(usersWithAddresses, '[].address.city+zip') // -> [{ city: 'New York', zip: '10001' }, { city: 'Boston', zip: '02108' }]
```

# Contributing

## Commands
- `yarn clean` - Remove `lib/` directory
- `npm test` - Run tests with linting and coverage results.
- `npm test:only` - Run tests without linting or coverage.
- `npm test:watch` - You can even re-run tests on file changes!
- `yarn lint` - Run ESlint with airbnb-config
- `yarn cover` - Get coverage report for your code.
- `yarn build` - Babel will transpile ES6 => ES5 and minify the code.
