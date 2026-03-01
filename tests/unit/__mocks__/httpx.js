/**
 * Mock for the jslib httpx module.
 * Used only in unit tests — never imported by k6 itself.
 */

export class Httpx {
    constructor(options) {
        this.baseURL = options?.baseURL || '';
        this.k6params = { headers: {} };
        this._headers = {};
    }

    setBaseUrl(url) {
        this.baseURL = url;
    }

    addHeaders(headers) {
        this._headers = Object.assign(this._headers, headers);
        this.k6params.headers = this._headers;
    }

    request(_method, _url, _body, _params) { // eslint-disable-line no-unused-vars
        return { status: 200, body: '{}', request: { method: _method, url: _url, headers: {} } };
    }
}

export default { Httpx };
