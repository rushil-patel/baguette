# Baguette

`bget` : The better get.

The is meant to be an enhanced version of lodash `get`.

In addition to standard object traversal via string path, `bget` will allow you to traverse and operate on arrays. The goal being to provide the capability to perform filters, maps, and reductions via a string path.

# Usage

## Arrays
```js
import {bget} from 'baguette';

let object = {items: [{id: '0'}, {id: '1'},{id: '2'}]}

take(object, 'items[1]') // -> {id: '1'}
take(object, 'items[1].id') // -> '1'
take(object, 'items[].id') // -> ['0', '1', '2']
take(object, 'items[id === "1"]') // -> [{id: '1'}]
take(object, 'items[id === "1"].id') // -> '1'

let nestedLists = [[{name: 'tiger'}, {name: 'lion'}], [{name: 'wolf'}, {name: 'dog'}]]

take(object, 'items[][].name') // -> [['tiger', lion'], ['wolf', 'dog']]
```

### propsals

#### reduce ('<')
```js
take(object, 'items[]<[]') // flattens out the nests lists into single list
```

#### get multiple fields

```js
take(object, 'items[].fieldOne+fieldTwo') // returns a mapping of items with the fieldsOne and fieldsTwo
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


