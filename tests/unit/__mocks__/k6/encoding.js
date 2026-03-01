/**
 * Mock for the k6/encoding built-in module.
 * Used only in unit tests — never imported by k6 itself.
 */

const b64encode = (str) => Buffer.from(str).toString('base64');  
const b64decode = (str) => Buffer.from(str, 'base64').toString('utf-8');  

export default { b64encode, b64decode };
