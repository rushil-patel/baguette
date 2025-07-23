const Symbols = {
  DOT: '.',
  LBRACK: '[',
  RBRACK: ']',
  CHAR: 'CHAR',
  EXP: 'EXP',
  NONE: 'NONE',
  INTEGER: 'INTEGER'
}

const isNumeric = (str: string): boolean => {
  // Fast check for common cases
  if (str.length === 0) return false
  if (str.length === 1) {
    const code = str.charCodeAt(0)
    return code >= 48 && code <= 57 // '0' to '9'
  }
  // For longer strings, use regex for better performance than Number()
  return /^\d+$/.test(str)
}

const getToken = (path: string): string => {
  if (path === '') {
    return Symbols.NONE
  }
  
  const nextChar = path[0]
  
  // Check single character tokens first (most common)
  switch (nextChar) {
    case Symbols.DOT:
      return Symbols.DOT
    case Symbols.LBRACK:
      return Symbols.LBRACK
    case Symbols.RBRACK:
      return Symbols.RBRACK
    default:
      // Only check for integer if it's not a special character
      return isNumeric(path) ? Symbols.INTEGER : Symbols.CHAR
  }
}

// Iterative parser to avoid recursion overhead
const parsePath = (root: Object, path: string = '') => {
  let currentRoot = root
  let currentPath = path
  
  while (currentPath.length > 0) {
    const token = getToken(currentPath)
    
    switch (token) {
      case Symbols.DOT: {
        const result = parseDot(currentRoot, currentPath)
        if (result.root !== undefined) {
          currentRoot = result.root
          currentPath = result.path
        } else {
          return currentRoot
        }
        break
      }
      case Symbols.LBRACK: {
        const result = parseLBrack(currentRoot as Array<any>, currentPath)
        if (result.root !== undefined) {
          currentRoot = result.root
          currentPath = result.path
        } else {
          return currentRoot
        }
        break
      }
      case Symbols.RBRACK: {
        const result = parseRBrack(currentRoot, currentPath)
        if (result.root !== undefined) {
          currentRoot = result.root
          currentPath = result.path
        } else {
          return currentRoot
        }
        break
      }
      case Symbols.CHAR: {
        const result = parseObjectField(currentRoot, currentPath)
        if (result.root !== undefined) {
          currentRoot = result.root
          currentPath = result.path
        } else {
          return currentRoot
        }
        break
      }
      case Symbols.NONE:
        return currentRoot
      default:
        return currentRoot
    }
  }
  
  return currentRoot
}

const throwUnexpectedToken = (token: string) => {
  throw Error(`Unexpected token of ${token}`)
}

const throwPathDoesNotExistAt = (path: string) => {
  throw Error(`Path "${path}" does not exist`)
}

// Function cache for compiled expressions to avoid repeated Function construction
const expressionCache = new Map<string, Function>()

function evalInScope<T>(expression: String, context: T) {
  const exprStr = expression.toString()
  
  // Check cache first
  let compiledFn = expressionCache.get(exprStr)
  
  if (!compiledFn) {
    const body: string = `return ${exprStr};`
    const contextKeys = Object.keys(context)
    /* eslint-disable no-new-func */
    compiledFn = new Function(...contextKeys, body)
    /* eslint-enable no-new-func */
    
    // Cache the compiled function
    expressionCache.set(exprStr, compiledFn)
  }
  
  return compiledFn(...Object.values(context))
}

type SignalFn = (character: string) => Boolean;

const scanPathUntil = (path: string, signal: SignalFn) => {
  let i = 0
  const chars: string[] = []
  
  while (i < path.length && signal(path.slice(i))) {
    chars.push(path[i])
    i += 1
  }
  
  return { scan: chars.join(''), rest: path.slice(i) }
}

const parseDot = (root: Object, path: string = '') => {
  // slice over 'dot'
  const rest = path.slice(1)
  const token = getToken(rest)
  switch (token) {
    case Symbols.CHAR:
      return { root, path: rest } // Let iterative parser handle this
    case Symbols.NONE:
      return { root: undefined } // Signal completion
    default:
      throwUnexpectedToken(token)
  }
}

const parseObjectField = (root: Object, path: string = '') => {
  const signal = (c) => getToken(c) === Symbols.CHAR
  const { scan: field, rest } = scanPathUntil(path, signal)
  let nextRoot

  if (Array.isArray(root)) {
    const result: any[] = []
    for (let i = 0; i < root.length; i++) {
      const element = root[i]
      if (element && field in element) {
        result.push(element[field])
      } else {
        throwPathDoesNotExistAt(path)
      }
    }
    nextRoot = result
  } else if (root && field in root) {
    nextRoot = root[field]
  } else {
    throwPathDoesNotExistAt(path)
  }

  return { root: nextRoot, path: rest }
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
      // For empty brackets, map each element through remaining path
      const results = root.map(element => {
        // Use iterative parsing for each element
        return parsePath(element, rest)
      })
      return { root: results, path: '' } // Signal completion
    }
    default: {
      const expression = subPath
      nextRoot = applyExpression(root, expression)
      break
    }
  }
  return { root: nextRoot, path: rest }
}

const parseRBrack = (root: Object, path: String) => {
  // slice over rbrack
  const rest = path.slice(1)
  return { root, path: rest }
}

const applyExpression = <T>(array: T[], expression: string): any => {
  return array.filter((element: T) => {
    return evalInScope(expression, element)
  })
}

export const bget = (root: Object, path: string | String = '', fallback?: any): any => {
  let pathArg: string;
  // Fast type checks
  if (!root || typeof root !== 'object') {
    return fallback
  }

  if (typeof path === 'string') {
    pathArg = path
  } else if (path instanceof String) {
    pathArg = path.toString()
  } else {
    return fallback
  }

  try {
    return parsePath(root, pathArg)
  } catch (e) {
    return fallback
  }
}
