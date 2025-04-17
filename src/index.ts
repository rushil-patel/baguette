const Symbols = {
  DOT: '.',
  LBRACK: '[',
  RBRACK: ']',
  CHAR: 'CHAR',
  EXP: 'EXP',
  NONE: 'NONE',
  INTEGER: 'INTEGER'
} as const;

type SymbolType = typeof Symbols[keyof typeof Symbols];

const getToken = (path: string): SymbolType => {
  if (path === '') {
    return Symbols.NONE;
  }
  if (!isNaN(Number(path))) {
    return Symbols.INTEGER;
  }
  const nextChar = path[0];

  switch (nextChar) {
    case Symbols.DOT:
      return Symbols.DOT;
    case Symbols.LBRACK:
      return Symbols.LBRACK;
    case Symbols.RBRACK:
      return Symbols.RBRACK;
    default:
      return Symbols.CHAR;
  }
};

const parsePath = <T>(root: T, path: string = ''): any => {
  const token = getToken(path);

  switch (token) {
    case Symbols.DOT:
      return parseDot(root, path);
    case Symbols.LBRACK:
      return parseLBrack(root as any[], path);
    case Symbols.RBRACK:
      return parseRBrack(root, path);
    case Symbols.CHAR:
      return parseObjectField(root, path);
    case Symbols.NONE:
      return root;
  };
};

const throwUnexpectedToken = (token: string): never => {
  throw Error(`Unexpected token of ${token}`);
};

const throwPathDoesNotExistAt = (path: string): never => {
  throw Error(`Path "${path}" does not exist`);
};

function evalInScope<T, R>(expression: string, context: T): R {
  const body: string = `return ${expression};`;
  /* eslint-disable no-new-func */
  return (new Function(...Object.keys(context as object), body))(...Object.values(context as object)) as R;
  /* eslint-enable no-new-func */
}

type SignalFn = (character: string) => boolean;

interface ScanResult {
  scan: string;
  rest: string;
}

const scanPathUntil = (path: string, signal: SignalFn): ScanResult => {
  let i = 0;
  let scanned = '';
  let rest = path;
  while (i < path.length && signal(rest)) {
    scanned += path[i];
    i += 1;
    rest = path.slice(i);
  }
  return { scan: scanned, rest: rest };
};

const parseDot = <T>(root: T, path: string = ''): any => {
  const rest = path.slice(1);
  const token = getToken(rest);
  switch (token) {
    case Symbols.CHAR:
      return parseObjectField(root, rest);
    case Symbols.NONE:
      return root;
    default:
      throwUnexpectedToken(token);
  }
};

const parseObjectField = <T>(root: T, path: string = ''): any => {
  const signal = (c: string): boolean => getToken(c) === Symbols.CHAR;
  const { scan: field, rest } = scanPathUntil(path, signal);
  let nextRoot: any;

  if (Array.isArray(root)) {
    nextRoot = root.map(element => {
      if (Object.prototype.hasOwnProperty.call(element, field)) {
        return element[field as keyof typeof element];
      }
      throwPathDoesNotExistAt(path);
    });
  } else if (root && typeof root === 'object' && Object.prototype.hasOwnProperty.call(root, field)) {
    nextRoot = (root as Record<string, any>)[field];
  } else {
    throwPathDoesNotExistAt(path);
  }

  return parsePath(nextRoot, rest);
};

const parseLBrack = <T>(root: T[], path: string): any => {
  const restPath = path.slice(1);
  const signal = (c: string): boolean => getToken(c) !== Symbols.RBRACK;
  const { scan: subPath, rest } = scanPathUntil(restPath, signal);

  const token = getToken(subPath);
  let nextRoot: any;
  switch (token) {
    case Symbols.INTEGER: {
      const idx = Number(subPath);
      nextRoot = root[idx];
      break;
    }
    case Symbols.NONE: {
      return root.map(element => parsePath(element, rest));
    }
    default: {
      const expression = subPath;
      nextRoot = applyExpression(root, expression);
      break;
    }
  }
  return parsePath(nextRoot, rest);
};

const parseRBrack = <T>(root: T, path: string): any => {
  const rest = path.slice(1);
  return parsePath(root, rest);
};

const applyExpression = <T>(array: T[], expression: string): T[] => {
  return array.filter((element: T) => {
    return evalInScope<T, boolean>(expression, element);
  });
};

export const bget = <T, R = any>(root: T, path?: string | String, fallback?: R): R | any => {
  let pathArg: string;
  
  if (!(root && typeof root === 'object')) {
    return fallback as R;
  }

  if (path === undefined) {
    return root as any;
  }

  if (!(typeof path === 'string') && !(path instanceof String)) {
    return fallback as R;
  }

  if (path instanceof String) {
    pathArg = path.toString();
  }
  else {
    pathArg = path;
  }

  try {
    return parsePath(root, pathArg);
  } catch (e) {
    return fallback as R;
  }
};
