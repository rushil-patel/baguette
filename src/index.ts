type TokenType = 
  | 'DOT' 
  | 'LBRACK' 
  | 'RBRACK' 
  | 'CHAR' 
  | 'EXP' 
  | 'NONE' 
  | 'INTEGER';

interface SymbolsType {
  DOT: string;
  LBRACK: string;
  RBRACK: string;
  CHAR: TokenType;
  EXP: TokenType;
  NONE: TokenType;
  INTEGER: TokenType;
}

const Symbols: SymbolsType = {
  DOT: '.',
  LBRACK: '[',
  RBRACK: ']',
  CHAR: 'CHAR',
  EXP: 'EXP',
  NONE: 'NONE',
  INTEGER: 'INTEGER'
}

const getToken = (path: string): TokenType => {
  if (path === '') {
    return Symbols.NONE
  }
  if (!isNaN(Number(path))) {
    return Symbols.INTEGER
  }
  const nextChar = path[0]

  switch (nextChar) {
    case Symbols.DOT:
      return Symbols.DOT as unknown as TokenType
    case Symbols.LBRACK:
      return Symbols.LBRACK as unknown as TokenType
    case Symbols.RBRACK:
      return Symbols.RBRACK as unknown as TokenType
    default:
      return Symbols.CHAR
  }
}

// Define a more generic type for objects that can be any record
type AnyObject = Record<string, any>;

// Parse from top of abstract syntax tree
const parsePath = (root: AnyObject | any[], path: string = ''): any => {
  // base cases
  const token = getToken(path)

  switch (token) {
    case Symbols.DOT as unknown as TokenType:
      return parseDot(root, path)
    case Symbols.LBRACK as unknown as TokenType:
      return parseLBrack(root as any[], path)
    case Symbols.RBRACK as unknown as TokenType:
      return parseRBrack(root, path)
    case Symbols.CHAR:
      return parseObjectField(root, path)
    case Symbols.NONE:
      return root
  };
}

const throwUnexpectedToken = (token: string): never => {
  throw Error(`Unexpected token of ${token}`)
}

const throwPathDoesNotExistAt = (path: string): never => {
  throw Error(`Path "${path}" does not exist`)
}

// TODO: consider using https://github.com/mafintosh/generate-function
function evalInScope<T extends AnyObject>(expression: string, context: T): boolean {
  const body: string = `return ${expression};`
  /* eslint-disable no-new-func */
  return (new Function(...Object.keys(context), body))(...Object.values(context))
  /* eslint-enable no-new-func */
}

type SignalFn = (character: string) => boolean;

interface ScanResult {
  scan: string;
  rest: string;
}

const scanPathUntil = (path: string, signal: SignalFn): ScanResult => {
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

const parseDot = (root: AnyObject | any[], path: string = ''): any => {
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

const parseObjectField = (root: AnyObject | any[], path: string = ''): any => {
  const signal = (c: string): boolean => getToken(c) === Symbols.CHAR
  const { scan: field, rest } = scanPathUntil(path, signal)
  let nextRoot: any

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

const parseLBrack = <T>(root: T[], path: string): any => {
  // slice over 'lbrack'
  const restPath = path.slice(1)
  const signal = (c: string): boolean => getToken(c) !== (Symbols.RBRACK as unknown as TokenType)
  const { scan: subPath, rest } = scanPathUntil(restPath, signal)

  const token = getToken(subPath)
  let nextRoot: any
  switch (token) {
    case Symbols.INTEGER: {
      const idx = Number(subPath)
      nextRoot = root[idx]
      break
    }
    case Symbols.NONE: {
      return root.map(element => parsePath(element, rest.slice(1)))
    }
    default: {
      const expression = subPath
      nextRoot = applyExpression(root, expression)
      break
    }
  }
  //  returns next root
  return parsePath(nextRoot, rest.slice(1))
}

const parseRBrack = (root: AnyObject | any[], path: string): any => {
  // slice over rbrack
  const rest = path.slice(1)
  return parsePath(root, rest)
}

const applyExpression = <T>(array: T[], expression: string): T[] => {
  return array.filter((element: T) => {
    return evalInScope(expression as string, element as unknown as AnyObject)
  })
}

export const bget = <T extends AnyObject | any[], F = any>(
  root: T, 
  path: string | String = '', 
  fallback?: F
): any => {
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
