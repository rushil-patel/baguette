const Symbols = {
  DOT: '.',
  LBRACK: '[',
  RBRACK: ']',
  CHAR: 'CHAR',
  EXP: 'EXP',
  NONE: 'NONE',
  INTEGER: 'INTEGER',
  LESS_THAN: '<',
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
    case Symbols.LESS_THAN:
      return Symbols.LESS_THAN
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
    case Symbols.LESS_THAN:
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
  // Check if we have multiple fields to get (fieldOne+fieldTwo)
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

// Implementation for getting multiple fields
const parseMultipleFields = (root: Object, path: string = '') => {
  const fieldsEndIndex = path.indexOf(Symbols.DOT) !== -1 
    ? path.indexOf(Symbols.DOT) 
    : path.indexOf(Symbols.RBRACK) !== -1 
      ? path.indexOf(Symbols.RBRACK) 
      : path.length
  
  const fieldsStr = path.substring(0, fieldsEndIndex)
  const fields = fieldsStr.split(Symbols.PLUS)
  const rest = path.substring(fieldsEndIndex)
  
  if (Array.isArray(root)) {
    const result = root.map(element => {
      const obj = {}
      fields.forEach(field => {
        if (field.includes(Symbols.DOT)) {
          // For nested paths like 'details.name', get the value using bget
          const parts = field.split(Symbols.DOT)
          const firstPart = parts[0]
          const remainingPath = parts.slice(1).join(Symbols.DOT)
          
          if (Object.prototype.hasOwnProperty.call(element, firstPart)) {
            const nestedObj = element[firstPart]
            obj[field] = bget(nestedObj, remainingPath)
          } else {
            throwPathDoesNotExistAt(field)
          }
        } else if (Object.prototype.hasOwnProperty.call(element, field)) {
          obj[field] = element[field]
        } else {
          throwPathDoesNotExistAt(field)
        }
      })
      return obj
    })
    return rest ? parsePath(result, rest) : result
  } else {
    const obj = {}
    fields.forEach(field => {
      if (field.includes(Symbols.DOT)) {
        // For nested paths like 'details.name', get the value using bget
        const parts = field.split(Symbols.DOT)
        const firstPart = parts[0]
        const remainingPath = parts.slice(1).join(Symbols.DOT)
        
        if (Object.prototype.hasOwnProperty.call(root, firstPart)) {
          const nestedObj = root[firstPart]
          obj[field] = bget(nestedObj, remainingPath)
        } else {
          throwPathDoesNotExistAt(field)
        }
      } else if (Object.prototype.hasOwnProperty.call(root, field)) {
        obj[field] = root[field]
      } else {
        throwPathDoesNotExistAt(field)
      }
    })
    return rest ? parsePath(obj, rest) : obj
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

// Implementation for reduce operation
const parseReduce = <T>(root: T[], path: string) => {
  // slice over '<'
  const rest = path.slice(1)
  
  if (Array.isArray(root)) {
    // Flatten the array
    const flattened = root.reduce((acc, val) => {
      if (Array.isArray(val)) {
        return acc.concat(val)
      }
      return acc.concat([val])
    }, [])
    
    return parsePath(flattened, rest)
  }
  
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
