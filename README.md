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

## Reduce ('<')
Flatten nested arrays using the reduce operator:

```js
let nestedLists = [[1, 2], [3, 4], [5, 6]]
bget(nestedLists, '<[]') // -> [1, 2, 3, 4, 5, 6]

// Works with object arrays too
let nestedObjectLists = [[{id: 'a'}, {id: 'b'}], [{id: 'c'}, {id: 'd'}]]
bget(nestedObjectLists, '<[]') // -> [{id: 'a'}, {id: 'b'}, {id: 'c'}, {id: 'd'}]

// Can be combined with other operations
bget(nestedObjectLists, '<[].id') // -> ['a', 'b', 'c', 'd']
```

## Get Multiple Fields
Extract multiple fields from objects using the '+' operator:

```js
let user = {name: 'John', age: 30, city: 'New York'}
bget(user, 'name+age') // -> {name: 'John', age: 30}

// Works with arrays of objects
let users = [
  {id: 1, name: 'John', age: 30, city: 'New York'},
  {id: 2, name: 'Jane', age: 25, city: 'Boston'}
]
bget(users, 'name+age') // -> [{name: 'John', age: 30}, {name: 'Jane', age: 25}]

// Can be combined with other operations
bget(users, '[id === 1].name+age') // -> [{name: 'John', age: 30}]
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
