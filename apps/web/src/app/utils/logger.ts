import { environment } from 'src/environments/environment';

const DEBUG_KEY = 'trokai_debug';

function isEnabled(): boolean {
  if (!environment.production) return true;

  try {
    return (
      typeof localStorage !== 'undefined' && !!localStorage.getItem(DEBUG_KEY)
    );
  } catch {
    return false;
  }
}

function format(level: string, args: unknown[]): unknown[] {
  const time = new Date().toISOString().substring(11, 23);
  return [`[${time}] [${level}]`, ...args];
}

export const logger = {
  log: (...args: unknown[]) => {
    if (isEnabled()) console.log(...format('LOG', args));
  },
  warn: (...args: unknown[]) => {
    if (isEnabled()) console.warn(...format('WARN', args));
  },
  error: (...args: unknown[]) => {
    if (isEnabled()) console.error(...format('ERR', args));
  },
  group: (label: string) => {
    if (isEnabled()) console.group(`[${label}]`);
  },
  groupEnd: () => {
    if (isEnabled()) console.groupEnd();
  },
};
