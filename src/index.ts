const Symbols = {
  DOT: '.',
  LBRACK: '[',
  RBRACK: ']',
  CHAR: 'CHAR',
  EXP: 'EXP',
  NONE: 'NONE',
  INTEGER: 'INTEGER',
  REDUCE: '<',
  PLUS: '+'
}

const getToken = (path: string): string => {
  if (path === '') {
    return Symbols.NONE
  }
  if (!isNaN(Number(path))) {
    return Symbols.INTEGER
  }
  const nextChar = path[0]

  switch (nextChar) {
    case Symbols.DOT:
      return Symbols.DOT
    case Symbols.LBRACK:
      return Symbols.LBRACK
    case Symbols.RBRACK:
      return Symbols.RBRACK
    case Symbols.REDUCE:
      return Symbols.REDUCE
    default:
      return Symbols.CHAR
  }
}

// Parse from top of abstract syntax tree
const parsePath = (root: Object, path: string = '') => {
  // base cases
  const token = getToken(path)

  switch (token) {
    case Symbols.DOT:
      return parseDot(root, path)
    case Symbols.LBRACK:
      return parseLBrack(root as Array<any>, path)
    case Symbols.RBRACK:
      return parseRBrack(root, path)
    case Symbols.CHAR:
      return parseObjectField(root, path)
    case Symbols.NONE:
      return root
    case Symbols.REDUCE:
      return parseReduce(root as Array<any>, path)
  };
}

const throwUnexpectedToken = (token: string) => {
  throw Error(`Unexpected token of ${token}`)
}

const throwPathDoesNotExistAt = (path: string) => {
  throw Error(`Path \"${path}\" does not exist`)
}

// TODO: consider using https://github.com/mafintosh/generate-function
function evalInScope<T>(expression: String, context: T) {
  const body: string = `return ${expression};`
  /* eslint-disable no-new-func */
  return (new Function(...Object.keys(context), body))(...Object.values(context))
  /* eslint-enable no-new-func */
}

type SignalFn = (character: string) => Boolean;

const scanPathUntil = (path: string, signal: SignalFn) => {
  let i = 0
  let scanned = ''
  let rest = path
  while (i < path.length && signal(rest)) {
    scanned += path[i]
    i += 1
    rest = path.slice(i)
  }
  return { scan: scanned, rest: rest }
}

const parseDot = (root: Object, path: string = '') => {
  // slice over 'dot'
  const rest = path.slice(1)
  const token = getToken(rest)
  switch (token) {
    case Symbols.CHAR:
      return parseObjectField(root, rest)
    case Symbols.NONE:
      return root
    default:
      throwUnexpectedToken(token)
  }
}

const parseObjectField = (root: Object, path: string = '') => {
  const signal = (c) => {
    const token = getToken(c)
    return token === Symbols.CHAR && c[0] !== Symbols.PLUS
  }
  const { scan: field, rest } = scanPathUntil(path, signal)
  let nextRoot

  // Check if we have multiple fields to get (using + notation)
  if (rest && rest[0] === Symbols.PLUS) {
    return parseMultipleFields(root, field, rest)
  }

  if (Array.isArray(root)) {
    nextRoot = root.map(element => {
      if (Object.prototype.hasOwnProperty.call(element, field)) {
        return element[field]
      }
      throwPathDoesNotExistAt(path)
    })
  } else if (Object.prototype.hasOwnProperty.call(root, field)) {
    nextRoot = root[field]
  } else {
    throwPathDoesNotExistAt(path)
  }

  return parsePath(nextRoot, rest)
}

// New function to handle multiple fields with + notation
const parseMultipleFields = (root: Object, firstField: string, path: string) => {
  // Skip the + symbol
  const rest = path.slice(1)
  const signal = (c) => getToken(c) === Symbols.CHAR
  const { scan: secondField, rest: remainingPath } = scanPathUntil(rest, signal)
  
  let result

  if (Array.isArray(root)) {
    result = root.map(element => {
      const newObj = {}
      if (Object.prototype.hasOwnProperty.call(element, firstField)) {
        newObj[firstField] = element[firstField]
      } else {
        throwPathDoesNotExistAt(firstField)
      }
      
      if (Object.prototype.hasOwnProperty.call(element, secondField)) {
        newObj[secondField] = element[secondField]
      } else {
        throwPathDoesNotExistAt(secondField)
      }
      
      return newObj
    })
  } else {
    result = {}
    if (Object.prototype.hasOwnProperty.call(root, firstField)) {
      result[firstField] = root[firstField]
    } else {
      throwPathDoesNotExistAt(firstField)
    }
    
    if (Object.prototype.hasOwnProperty.call(root, secondField)) {
      result[secondField] = root[secondField]
    } else {
      throwPathDoesNotExistAt(secondField)
    }
  }

  return parsePath(result, remainingPath)
}

// New function to handle reduce operation
const parseReduce = (root: Array<any>, path: string) => {
  // Skip the < symbol
  const rest = path.slice(1)
  
  // If we're reducing an array of arrays, flatten it
  if (Array.isArray(root) && root.every(item => Array.isArray(item))) {
    const flattened = root.reduce((acc, val) => acc.concat(val), [])
    return parsePath(flattened, rest)
  }
  
  return parsePath(root, rest)
}

const parseLBrack = <T>(root: T[], path: string) => {
  // slice over 'lbrack'
  const restPath = path.slice(1)
  const signal = (c) => getToken(c) !== Symbols.RBRACK
  const { scan: subPath, rest } = scanPathUntil(restPath, signal)

  const token = getToken(subPath)
  let nextRoot
  switch (token) {
    case Symbols.INTEGER: {
      const idx = Number(subPath)
      nextRoot = root[idx]
      break
    }
    case Symbols.NONE: {
      // Check if the next token after ']' is '<' (reduce operator)
      if (rest.length > 1 && rest[0] === Symbols.RBRACK && rest[1] === Symbols.REDUCE) {
        // First map over each element, then flatten the result
        const mapped = root.map(element => parsePath(element, ''))
        // Skip the ']<' part
        return parsePath(mapped, '<' + rest.slice(2))
      }
      return root.map(element => parsePath(element, rest))
    }
    default: {
      const expression = subPath
      nextRoot = applyExpression(root, expression)
      break
    }
  }
  //  returns next root
  return parsePath(nextRoot, rest)
}

const parseRBrack = (root: Object, path: String) => {
  // slice over rbrack
  const rest = path.slice(1)
  return parsePath(root, rest)
}

const applyExpression = <T>(array: T[], expression: string): any => {
  return array.filter((element: T) => {
    return evalInScope(expression, element)
  })
}

export const bget = (root: Object, path: string | String = '', fallback?: any): any => {
  let pathArg: string;
  if (!(root instanceof Object)) {
    return fallback
  }

  if (!(typeof path === 'string') && !(path instanceof String)) {
    return fallback
  }

  if (path instanceof String) {
    pathArg = path.toString()
  }
  else {
    pathArg = path;
  }

  try {
    return parsePath(root, pathArg)
  } catch (e) {
    return fallback
  }
}
