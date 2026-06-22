import dayjs from 'dayjs';

/** Expiration label from a start date + duration in days. */
export function mountExpiration(
  startDate: Date | string,
  expirationDays: number,
) {
  if (!startDate || !expirationDays) return null;

  try {
    const expiration = new Date(startDate);
    expiration.setDate(expiration.getDate() + expirationDays);
    const today = dayjs(new Date());

    const seconds = today.diff(expiration, 'seconds') * -1;
    const minutes = today.diff(expiration, 'minutes') * -1;
    const hours = today.diff(expiration, 'hours') * -1;
    const days = today.diff(expiration, 'days') * -1;

    let text = '';

    if (hours < 24) text = 'hoje';
    else if (hours < 48) text = 'amanhã';
    else text = `em ${days} dias`;

    return { text: 'Expira ' + text, seconds, minutes, hours, days };
  } catch {
    return null;
  }
}

/** Expiration label + countdown from an absolute expiration date. */
export function mountExpirationWithDate(expirationDate: Date | string) {
  try {
    const today = dayjs(new Date());
    const expiration = new Date(expirationDate);

    const seconds = today.diff(expiration, 'seconds') * -1;
    const minutes = today.diff(expiration, 'minutes') * -1;
    const hours = today.diff(expiration, 'hours') * -1;
    const days = today.diff(expiration, 'days') * -1;

    let text = null;

    if (seconds < 1) text = 'Expirado';
    else if (minutes < 1) text = 'Expira em ' + seconds + ' segundos';
    else if (minutes < 60) text = 'Expira em ' + minutes + ' minutos';
    else if (hours < 2) text = 'Expira em ' + hours + ' hora';
    else if (hours < 24) text = 'Expira em ' + hours + ' horas';
    else if (days <= 1) text = 'Expira em ' + days + ' dia';
    else text = 'Expira em ' + days + ' dias';

    return { text, seconds, minutes, hours, days, expired: seconds < 1 };
  } catch {
    return null;
  }
}

/** "a, b, e c" — Portuguese comma join with trailing "e". Mutates input. */
export function joinWithCommasAnd(strings: string[]) {
  if (strings.length === 0) {
    return '';
  } else if (strings.length === 1) {
    return strings[0];
  } else if (strings.length === 2) {
    return strings.join(' e ');
  } else {
    const lastElement = strings.pop();
    return strings.join(', ') + ', e ' + lastElement;
  }
}
