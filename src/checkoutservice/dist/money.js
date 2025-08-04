"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValid = isValid;
exports.isZero = isZero;
exports.isPositive = isPositive;
exports.isNegative = isNegative;
exports.areSameCurrency = areSameCurrency;
exports.areEquals = areEquals;
exports.negate = negate;
exports.sum = sum;
exports.multiply = multiply;
const NANOS_MAX = 999999999;
const NANOS_MIN = -999999999;
const NANOS_MOD = 1000000000;
function signMatches(m) {
    return m.nanos === 0 || m.units === 0 || (m.nanos < 0) === (m.units < 0);
}
function validNanos(nanos) {
    return nanos >= NANOS_MIN && nanos <= NANOS_MAX;
}
function isValid(m) {
    return signMatches(m) && validNanos(m.nanos);
}
function isZero(m) {
    return m.units === 0 && m.nanos === 0;
}
function isPositive(m) {
    return isValid(m) && (m.units > 0 || (m.units === 0 && m.nanos > 0));
}
function isNegative(m) {
    return isValid(m) && (m.units < 0 || (m.units === 0 && m.nanos < 0));
}
function areSameCurrency(l, r) {
    return l.currency_code === r.currency_code && l.currency_code !== '';
}
function areEquals(l, r) {
    return (l.currency_code === r.currency_code &&
        l.units === r.units &&
        l.nanos === r.nanos);
}
function negate(m) {
    return {
        units: -m.units,
        nanos: -m.nanos,
        currency_code: m.currency_code,
    };
}
function sum(l, r) {
    if (!isValid(l) || !isValid(r)) {
        throw new Error('Invalid money value');
    }
    if (l.currency_code !== r.currency_code) {
        throw new Error('Mismatching currency codes');
    }
    let units = l.units + r.units;
    let nanos = l.nanos + r.nanos;
    if ((units === 0 && nanos === 0) ||
        (units > 0 && nanos >= 0) ||
        (units < 0 && nanos <= 0)) {
        units += Math.trunc(nanos / NANOS_MOD);
        nanos = nanos % NANOS_MOD;
    }
    else {
        if (units > 0) {
            units--;
            nanos += NANOS_MOD;
        }
        else {
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
function multiply(m, n) {
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
