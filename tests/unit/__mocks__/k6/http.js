/**
 * Mock for the k6/http built-in module.
 * Used only in unit tests — never imported by k6 itself.
 */

export const get = () => ({ status: 200, body: '{}' });
export const post = () => ({ status: 200, body: '{}' });
export const put = () => ({ status: 200, body: '{}' });
export const del = () => ({ status: 200, body: '{}' });
export const request = () => ({ status: 200, body: '{}' });

export default { get, post, put, del, request };
