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

## Reduce Operation (`<`)
The reduce operation flattens nested arrays into a single array.

```js
let nestedArrays = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
bget(nestedArrays, '<') // -> [1, 2, 3, 4, 5, 6, 7, 8, 9]

let nestedObjects = [
  [{ id: 'a1' }, { id: 'a2' }],
  [{ id: 'b1' }, { id: 'b2' }]
]
bget(nestedObjects, '<') // -> [{ id: 'a1' }, { id: 'a2' }, { id: 'b1' }, { id: 'b2' }]

// Works with chained operations
bget(nestedObjects, '<.id') // -> ['a1', 'a2', 'b1', 'b2']

// Multiple levels of nesting can be flattened with multiple reduce operations
let deeplyNested = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
bget(deeplyNested, '<<') // -> [1, 2, 3, 4, 5, 6, 7, 8]
```

## Multiple Fields (`+`)
The plus operator allows you to retrieve multiple fields from objects.

```js
let person = { name: 'John', age: 30, city: 'New York' }
bget(person, 'name+age') // -> { name: 'John', age: 30 }

let people = [
  { name: 'John', age: 30, city: 'New York' },
  { name: 'Jane', age: 25, city: 'Boston' }
]
bget(people, 'name+city') // -> [{ name: 'John', city: 'New York' }, { name: 'Jane', city: 'Boston' }]

// Works with array indexing
bget(people, '[0].name+age') // -> { name: 'John', age: 30 }

// Works with filtering
bget(people, "[age > 25].name+city") // -> [{ name: 'John', city: 'New York' }]
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
