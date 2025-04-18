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
      return parseReduce(root as Array<any>, path)
    case Symbols.NONE:
      return root
  };
}

const throwUnexpectedToken = (token: string) => {
  throw Error(`Unexpected token of ${token}`)
}

const throwPathDoesNotExistAt = (path: string) => {
  throw Error(`Path \"${path}\" does not exist`)
}

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

const parseReduce = <T>(root: T[], path: string = '') => {
  const rest = path.slice(1)
  
  if (!root.length) {
    return []
  }
  
  if (getToken(rest) === Symbols.LBRACK) {
    const flattened = root.reduce((acc: any[], val: any) => {
      if (Array.isArray(val)) {
        return acc.concat(val)
      }
      return acc.concat([val])
    }, [])
    
    return parsePath(flattened, rest)
  }
  
  return parsePath(root, rest)
}

const parseObjectField = (root: Object, path: string = '') => {
  const signal = (c) => {
    const token = getToken(c)
    return token === Symbols.CHAR || (c.indexOf(Symbols.PLUS) > 0 && token === Symbols.CHAR)
  }
  const { scan: field, rest } = scanPathUntil(path, signal)
  let nextRoot

  if (field.includes(Symbols.PLUS)) {
    const fields = field.split(Symbols.PLUS)
    
    if (Array.isArray(root)) {
      nextRoot = root.map(element => {
        const result = {}
        fields.forEach(f => {
          if (Object.prototype.hasOwnProperty.call(element, f)) {
            result[f] = element[f]
          } else {
            throwPathDoesNotExistAt(`${field} (field: ${f})`)
          }
        })
        return result
      })
    } else {
      const result = {}
      fields.forEach(f => {
        if (Object.prototype.hasOwnProperty.call(root, f)) {
          result[f] = root[f]
        } else {
          throwPathDoesNotExistAt(`${field} (field: ${f})`)
        }
      })
      nextRoot = result
    }
  } else {
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
  }

  return parsePath(nextRoot, rest)
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
