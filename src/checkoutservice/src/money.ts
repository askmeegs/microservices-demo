import { Money } from './types';

const NANOS_MAX = 999999999;
const NANOS_MIN = -999999999;
const NANOS_MOD = 1000000000;

function signMatches(m: Money): boolean {
  return m.nanos === 0 || m.units === 0 || (m.nanos < 0) === (m.units < 0);
}

function validNanos(nanos: number): boolean {
  return nanos >= NANOS_MIN && nanos <= NANOS_MAX;
}

export function isValid(m: Money): boolean {
  return signMatches(m) && validNanos(m.nanos);
}

export function isZero(m: Money): boolean {
  return m.units === 0 && m.nanos === 0;
}

export function isPositive(m: Money): boolean {
  return isValid(m) && (m.units > 0 || (m.units === 0 && m.nanos > 0));
}

export function isNegative(m: Money): boolean {
  return isValid(m) && (m.units < 0 || (m.units === 0 && m.nanos < 0));
}

export function areSameCurrency(l: Money, r: Money): boolean {
  return l.currency_code === r.currency_code && l.currency_code !== '';
}

export function areEquals(l: Money, r: Money): boolean {
  return (
    l.currency_code === r.currency_code &&
    l.units === r.units &&
    l.nanos === r.nanos
  );
}

export function negate(m: Money): Money {
  return {
    units: -m.units,
    nanos: -m.nanos,
    currency_code: m.currency_code,
  };
}

export function sum(l: Money, r: Money): Money {
  if (!isValid(l) || !isValid(r)) {
    throw new Error('Invalid money value');
  }
  if (l.currency_code !== r.currency_code) {
    throw new Error('Mismatching currency codes');
  }

  let units = l.units + r.units;
  let nanos = l.nanos + r.nanos;

  if (
    (units === 0 && nanos === 0) ||
    (units > 0 && nanos >= 0) ||
    (units < 0 && nanos <= 0)
  ) {
    units += Math.trunc(nanos / NANOS_MOD);
    nanos = nanos % NANOS_MOD;
  } else {
    if (units > 0) {
      units--;
      nanos += NANOS_MOD;
    } else {
      units++;
      nanos -= NANOS_MOD;
    }
  }

  return {
    units,
    nanos,
    currency_code: l.currency_code,
  };
}

export function multiply(m: Money, n: number): Money {
  if (n === 0) {
    return { units: 0, nanos: 0, currency_code: m.currency_code };
  }
  if (n === 1) {
    return m;
  }
  let result = m;
  for (let i = 1; i < n; i++) {
    result = sum(result, m);
  }
  return result;
}