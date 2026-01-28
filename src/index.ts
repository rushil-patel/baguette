const Symbols = {
  DOT: '.',
  LBRACK: '[',
  RBRACK: ']',
  CHAR: 'CHAR',
  EXP: 'EXP',
  NONE: 'NONE',
  INTEGER: 'INTEGER',
  FLATTEN: '<',
  PLUS: '+'
}

const fnCache: Record<string, Function> = {}

const getToken = (path: string, index: number): string => {
  if (index >= path.length) {
    return Symbols.NONE
  }
  const char = path[index]

  switch (char) {
    case Symbols.DOT:
      return Symbols.DOT
    case Symbols.LBRACK:
      return Symbols.LBRACK
    case Symbols.RBRACK:
      return Symbols.RBRACK
    case Symbols.FLATTEN:
      return Symbols.FLATTEN
    case Symbols.PLUS:
      return Symbols.PLUS
    default:
      return Symbols.CHAR
  }
}

// Parse from top of abstract syntax tree
const parsePath = (root: any, path: string, index: number = 0): any => {
  // base cases
  const token = getToken(path, index)

  switch (token) {
    case Symbols.DOT:
      return parseDot(root, path, index)
    case Symbols.LBRACK:
      return parseLBrack(root, path, index)
    case Symbols.RBRACK:
      return parseRBrack(root, path, index)
    case Symbols.FLATTEN:
      return parseFlatten(root, path, index)
    case Symbols.CHAR:
      return parseObjectField(root, path, index)
    case Symbols.NONE:
      return root
  };
}

const throwPathDoesNotExistAt = (path: string) => {
  throw Error(`Path "${path}" does not exist`)
}

// TODO: consider using https://github.com/mafintosh/generate-function
function evalInScope<T>(expression: string | String, context: T) {
  const keys = Object.keys(context).sort()
  const cacheKey = `${expression}|${keys.join(',')}`

  if (!fnCache[cacheKey]) {
    const body: string = `return ${expression};`
    /* eslint-disable no-new-func */
    fnCache[cacheKey] = new Function(...keys, body)
    /* eslint-enable no-new-func */
  }

  const values = keys.map(key => (context as any)[key])
  return fnCache[cacheKey](...values)
}

type SignalFn = (path: string, index: number) => Boolean;

const scanPathUntil = (path: string, index: number, signal: SignalFn) => {
  let i = index
  let scanned = ''
  while (i < path.length && signal(path, i)) {
    scanned += path[i]
    i += 1
  }
  return { scan: scanned, nextIndex: i }
}

const parseDot = (root: any, path: string, index: number) => {
  return parsePath(root, path, index + 1)
}

const parseObjectField = (root: any, path: string, index: number) => {
  const signal = (p: string, i: number) => getToken(p, i) === Symbols.CHAR
  let { scan: field, nextIndex } = scanPathUntil(path, index, signal)
  const fields = [field]

  while (getToken(path, nextIndex) === Symbols.PLUS) {
    const nextField = scanPathUntil(path, nextIndex + 1, signal)
    fields.push(nextField.scan)
    nextIndex = nextField.nextIndex
  }

  let nextRoot

  if (Array.isArray(root)) {
    nextRoot = root.map(element => {
      if (fields.length > 1) {
        const res: any = {}
        fields.forEach(f => {
          if (Object.prototype.hasOwnProperty.call(element, f)) {
            res[f] = element[f]
          } else {
            throwPathDoesNotExistAt(path)
          }
        })
        return res
      }
      if (Object.prototype.hasOwnProperty.call(element, fields[0])) {
        return element[fields[0]]
      }
      throwPathDoesNotExistAt(path)
    })
  } else {
    if (fields.length > 1) {
      nextRoot = {}
      fields.forEach(f => {
        if (Object.prototype.hasOwnProperty.call(root, f)) {
          (nextRoot as any)[f] = (root as any)[f]
        } else {
          throwPathDoesNotExistAt(path)
        }
      })
    } else if (Object.prototype.hasOwnProperty.call(root, fields[0])) {
      nextRoot = (root as any)[fields[0]]
    } else {
      throwPathDoesNotExistAt(path)
    }
  }

  return parsePath(nextRoot, path, nextIndex)
}

const parseLBrack = (root: any, path: string, index: number) => {
  const signal = (p: string, i: number) => getToken(p, i) !== Symbols.RBRACK
  const { scan: subPath, nextIndex: rBrackIndex } = scanPathUntil(path, index + 1, signal)

  if (subPath === '') {
    const afterRBrack = rBrackIndex + 1
    if (getToken(path, afterRBrack) === Symbols.FLATTEN) {
      const nextIndex = afterRBrack + 1
      const mapped = root.map((element: any) => parsePath(element, path, nextIndex))
      return [].concat(...mapped)
    }
    return root.map((element: any) => parsePath(element, path, rBrackIndex))
  }

  let nextRoot
  if (!isNaN(Number(subPath))) {
    const idx = Number(subPath)
    nextRoot = root[idx]
  } else {
    nextRoot = applyExpression(root, subPath)
  }
  return parsePath(nextRoot, path, rBrackIndex)
}

const parseRBrack = (root: any, path: string, index: number) => {
  return parsePath(root, path, index + 1)
}

const parseFlatten = (root: any, path: string, index: number) => {
  const nextRoot = Array.isArray(root) ? [].concat(...root) : root
  return parsePath(nextRoot, path, index + 1)
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
    return parsePath(root, pathArg, 0)
  } catch (e) {
    return fallback
  }
}
