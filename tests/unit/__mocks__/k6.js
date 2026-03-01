/**
 * Mock for the k6 built-in module.
 * Used only in unit tests — never imported by k6 itself.
 */

export const check = (val, checks) => {
    let allPassed = true;
    for (const [, fn] of Object.entries(checks)) {
        if (!fn(val)) allPassed = false;
    }
    return allPassed;
};

export const group = (name, fn) => fn();

export const sleep = () => {};

export const fail = (msg) => { throw new Error(msg); };

export default { check, group, sleep, fail };
