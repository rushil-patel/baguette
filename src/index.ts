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

const parsePath = (root: Object, path: string = '') => {
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
      return parseReduce(root, path)
    case Symbols.NONE:
      return root
  }
}

const throwUnexpectedToken = (token: string) => {
  throw Error(`Unexpected token of ${token}`)
}

const throwPathDoesNotExistAt = (path: string) => {
  throw Error(`Path "${path}" does not exist`)
}

function evalInScope<T>(expression: String, context: T) {
  const body: string = `return ${expression};`
  return (new Function(...Object.keys(context), body))(...Object.values(context))
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
    return token === Symbols.CHAR || token === Symbols.PLUS
  }
  const { scan: field, rest } = scanPathUntil(path, signal)

  if (field.includes(Symbols.PLUS)) {
    return parseMultipleFields(root, field, rest)
  }

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

const parseMultipleFields = (root: Object, fieldPath: string, rest: string) => {
  const fields = fieldPath.split(Symbols.PLUS)

  if (Array.isArray(root)) {
    return root.map(element => {
      const result = {}
      fields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(element, field)) {
          result[field] = element[field]
        } else {
          throwPathDoesNotExistAt(fieldPath)
        }
      })
      return result
    })
  } else {
    const result = {}
    fields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(root, field)) {
        result[field] = root[field]
      } else {
        throwPathDoesNotExistAt(fieldPath)
      }
    })
    return parsePath(result, rest)
  }
}

const parseLBrack = <T>(root: T[], path: string) => {
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
  return parsePath(nextRoot, rest)
}

const parseRBrack = (root: Object, path: String) => {
  const rest = path.slice(1)
  return parsePath(root, rest)
}

const parseReduce = (root: Object, path: string) => {
  const rest = path.slice(1)
  
  if (!Array.isArray(root)) {
    throwUnexpectedToken('Reduce operation can only be applied to arrays')
  }
  
  if (rest.startsWith('[]')) {
    const flattened = (root as any[]).reduce((acc, val) => {
      if (Array.isArray(val)) {
        return acc.concat(val)
      }
      acc.push(val)
      return acc
    }, [])
    
    return parsePath(flattened, rest.slice(2))
  }
  
  throwUnexpectedToken(`Unsupported reduce operation: ${rest}`)
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
