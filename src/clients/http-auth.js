/**
 * This module contains classes for handling authentication.
 * @module http-auth
 * @example
 * ```javascript
 * import { Authenticator } from './http-auth.js';
 * const authenticator = new Authenticator();
 * authenticator.getBasicAuth();
 * authenticator.getTokenBearerAuth()
 * ```
 * @example
 * ```javascript
 * import { Authenticator } from './http-auth.js';
 * const authenticator = new Authenticator('username', 'password');
 *```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

import encoding from 'k6/encoding';


/**
 * Interface for authenticator classes.
 * @abstract
 */
class IAuthenticator {
    /**
     * Returns the authentication header.
     * @throws {Error} - Not Implemented.
     */
    getAuth() {
        throw new Error('Not Implemented');
    }
}


/**
 * Class to handle basic authentication.
 * @augments IAuthenticator
 */
class BasicAuthenticator extends IAuthenticator {
    /**
     * Create a new BasicAuthenticator instance.
     * @param {object} options - The options.
     */
    constructor(options = {}) {
        super();
        let { username, password } = options;
        this.username = username || __ENV.API_USERNAME || ''; // eslint-disable-line no-undef
        this.password = password || __ENV.API_PASSWORD || ''; // eslint-disable-line no-undef
    }

    /**
     * Get the encoded basic authentication.
     * @returns {string} - The enocoded basic authentication.
     */
    getAuth() {
        if (!this.username || !this.password) {
            console.debug('Username or password is missing, No basic authorization'); // eslint-disable-line no-undef
            return '';
        }
        return `${encoding.b64encode(`${this.username}:${this.password}`)}`;
    }
}


/**
 * Class to handle token bearer authentication.
 * @augments IAuthenticator
 * @example
 * ```javascript
 * const tokenBearerAuthenticator = new TokenBearerAuthenticator({ token: 'token' });
 * tokenBearerAuthenticator.getAuth();
 * ```
 */
class TokenBearerAuthenticator extends IAuthenticator {

    constructor(options = {}) {
        super();
        let { token } = options;
        this.token = token || __ENV.API_TOKEN || ''; // eslint-disable-line no-undef
    }

    getAuth() {
        if (!this.token) {
            console.debug('Token is missing, No token bearer authorization'); // eslint-disable-line no-undef
            return '';
        }
        return `${this.token}`;
    }
}


/**
 * Class to handle authentication.
 * @example
 * ```javascript
 * const authenticator = new Authenticator();
 * authenticator.getBasicAuth();
 * authenticator.getTokenBearerAuth();
 * ```
 */
class Authenticator {
    /**
     * Create a new Authenticator instance.
     * @param {object} options - The options.
     * @param {string} options.username - The username.
     * @param {string} options.password - The password.
     * @param {string} options.token - The token.
     */
    constructor(options = {}) {
        let { username = '', password = '', token = '' } = options;
        this.username = username || __ENV.API_USERNAME || ''; // eslint-disable-line no-undef
        this.password = password || __ENV.API_PASSWORD || ''; // eslint-disable-line no-undef
        this.token = token || __ENV.API_TOKEN || ''; // eslint-disable-line no-undef
    }

    /**
     * Returns the encoded authentication.
     * @returns {string} - The authentication.
     */
    getBasicAuth() {
        let basicAuth = new BasicAuthenticator({ username: this.username, password: this.password });
        return basicAuth.getAuth();
    }

    /**
     * Returns the token bearer authentication.
     * @returns {string} - The token bearer authentication.
     */
    getTokenBearerAuth() {
        let tokenBearerAuth = new TokenBearerAuthenticator({ token: this.token });
        return tokenBearerAuth.getAuth();
    }
}

export { Authenticator };
