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
    case Symbols.REDUCE:
      return parseReduce(root as Array<any>, path)
    case Symbols.NONE:
      return root
  };
}

const throwUnexpectedToken = (token: string) => {
  throw Error(`Unexpected token of ${token}`)
}

const throwPathDoesNotExistAt = (path: string) => {
  throw Error(`Path "${path}" does not exist`)
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
  // Check if we have a multi-field selector (field1+field2)
  if (path.includes(Symbols.PLUS)) {
    return parseMultipleFields(root, path)
  }

  const signal = (c) => getToken(c) === Symbols.CHAR
  const { scan: field, rest } = scanPathUntil(path, signal)
  let nextRoot

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

const parseMultipleFields = (root: Object, path: string = '') => {
  // Split the path at the first dot or bracket to get the multi-field part
  const nextDotIndex = path.indexOf(Symbols.DOT)
  const nextBracketIndex = path.indexOf(Symbols.LBRACK)
  
  let endIndex = path.length;
  if (nextDotIndex !== -1 && !path.substring(0, nextDotIndex).includes(Symbols.PLUS)) {
    endIndex = Math.min(endIndex, nextDotIndex)
  }
  if (nextBracketIndex !== -1) {
    endIndex = Math.min(endIndex, nextBracketIndex)
  }
  
  const multiFieldPart = path.substring(0, endIndex)
  const rest = path.substring(endIndex)
  
  const fields = multiFieldPart.split(Symbols.PLUS)
  
  if (Array.isArray(root)) {
    // If root is an array, apply the multi-field selection to each element
    const result = root.map(element => {
      const obj = {}
      fields.forEach(field => {
        try {
          const value = parsePath(element, field)
          // Extract the field name - either the full field if no dots, or the part after the last dot
          const fieldName = field.includes(Symbols.DOT) 
            ? field.substring(field.lastIndexOf(Symbols.DOT) + 1) 
            : field
          obj[fieldName] = value
        } catch (e) {
          throwPathDoesNotExistAt(field)
        }
      })
      return obj
    })
    return parsePath(result, rest)
  } else {
    // If root is an object, create a new object with selected fields
    const obj = {}
    fields.forEach(field => {
      try {
        const value = parsePath(root, field)
        // Extract the field name - either the full field if no dots, or the part after the last dot
        const fieldName = field.includes(Symbols.DOT) 
          ? field.substring(field.lastIndexOf(Symbols.DOT) + 1) 
          : field
        obj[fieldName] = value
      } catch (e) {
        throwPathDoesNotExistAt(field)
      }
    })
    return parsePath(obj, rest)
  }
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

const parseReduce = <T>(root: T[][], path: string) => {
  // slice over reduce symbol '<'
  const rest = path.slice(1)
  
  // Flatten the array
  const flattened = root.reduce((acc, val) => acc.concat(val), [])
  
  return parsePath(flattened, rest)
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
