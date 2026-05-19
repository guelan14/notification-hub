const withTime = (level: string, args: unknown[]) => {
  const time = new Date().toISOString();
  return [time, level, ...args];
};

export const error = (...args: unknown[]) => console.error(...withTime('ERROR', args));
export const warn = (...args: unknown[]) => console.warn(...withTime('WARN', args));
export const info = (...args: unknown[]) => console.info(...withTime('INFO', args));
export const debug = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== 'production') console.debug(...withTime('DEBUG', args));
};

export default { error, warn, info, debug };
