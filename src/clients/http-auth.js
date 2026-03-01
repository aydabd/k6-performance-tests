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
import http from 'k6/http';


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
        this.username = username || __ENV.API_USERNAME || '';
        this.password = password || __ENV.API_PASSWORD || '';
    }

    /**
     * Get the encoded basic authentication.
     * @returns {string} - The enocoded basic authentication.
     */
    getAuth() {
        if (!this.username || !this.password) {
            console.debug('Username or password is missing, No basic authorization');
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
        this.token = token || __ENV.API_TOKEN || '';
    }

    getAuth() {
        if (!this.token) {
            console.debug('Token is missing, No token bearer authorization');
            return '';
        }
        return `${this.token}`;
    }
}


/**
 * Class to handle JWT authentication.
 * @augments IAuthenticator
 * @example
 * ```javascript
 * const jwtAuth = new JwtAuthenticator({ loginUrl: 'https://api.example.com/login', username: 'user', password: 'pass' });
 * jwtAuth.getAuth();
 * ```
 */
class JwtAuthenticator extends IAuthenticator {

    constructor(options = {}) {
        super();
        const { loginUrl, username, password, tokenField } = options;
        this.loginUrl = loginUrl || __ENV.JWT_LOGIN_URL || '';
        this.username = username || __ENV.JWT_USERNAME || '';
        this.password = password || __ENV.JWT_PASSWORD || '';
        this.tokenField = tokenField || __ENV.JWT_TOKEN_FIELD || 'token';
    }

    /**
     * Calls the login endpoint and returns the JWT token.
     * @returns {string} - The JWT token.
     */
    getAuth() {
        if (!this.loginUrl || !this.username || !this.password) {
            console.debug('Login URL, username, or password is missing, No JWT authorization');
            return '';
        }
        const payload = JSON.stringify({ username: this.username, password: this.password });
        const params = { headers: { 'Content-Type': 'application/json' } };
        const response = http.post(this.loginUrl, payload, params);
        if (response.status !== 200) {
            console.debug(`JWT login failed with status ${response.status}`);
            return '';
        }
        const body = JSON.parse(response.body);
        return body[this.tokenField] || '';
    }
}


/**
 * Class to handle API key authentication.
 * @augments IAuthenticator
 * @example
 * ```javascript
 * const apiKeyAuth = new ApiKeyAuthenticator({ apiKey: 'my-api-key' });
 * apiKeyAuth.getAuth();
 * apiKeyAuth.getHeaderName();
 * ```
 */
class ApiKeyAuthenticator extends IAuthenticator {

    constructor(options = {}) {
        super();
        const { apiKey, apiKeyHeader } = options;
        this.apiKey = apiKey || __ENV.API_KEY || '';
        this.apiKeyHeader = apiKeyHeader || __ENV.API_KEY_HEADER || 'X-API-Key';
    }

    /**
     * Returns the API key value.
     * @returns {string} - The API key.
     */
    getAuth() {
        if (!this.apiKey) {
            console.debug('API key is missing, No API key authorization');
            return '';
        }
        return `${this.apiKey}`;
    }

    /**
     * Returns the header name for the API key.
     * @returns {string} - The header name.
     */
    getHeaderName() {
        return this.apiKeyHeader;
    }
}


/**
 * Class to handle OAuth2 client credentials authentication.
 * @augments IAuthenticator
 * @example
 * ```javascript
 * const oauth2Auth = new OAuth2ClientCredentials({ tokenUrl: 'https://auth.example.com/token', clientId: 'id', clientSecret: 'secret' });
 * oauth2Auth.getAuth();
 * ```
 */
class OAuth2ClientCredentials extends IAuthenticator {

    constructor(options = {}) {
        super();
        const { tokenUrl, clientId, clientSecret, scope } = options;
        this.tokenUrl = tokenUrl || __ENV.OAUTH2_TOKEN_URL || '';
        this.clientId = clientId || __ENV.OAUTH2_CLIENT_ID || '';
        this.clientSecret = clientSecret || __ENV.OAUTH2_CLIENT_SECRET || '';
        this.scope = scope || __ENV.OAUTH2_SCOPE || '';
    }

    /**
     * Calls the token endpoint and returns the access token.
     * @returns {string} - The access token.
     */
    getAuth() {
        if (!this.tokenUrl || !this.clientId || !this.clientSecret) {
            console.debug('Token URL, client ID, or client secret is missing, No OAuth2 authorization');
            return '';
        }
        const payload = {
            grant_type: 'client_credentials',
            client_id: this.clientId,
            client_secret: this.clientSecret,
        };
        if (this.scope) {
            payload.scope = this.scope;
        }
        const response = http.post(this.tokenUrl, payload);
        if (response.status !== 200) {
            console.debug(`OAuth2 token request failed with status ${response.status}`);
            return '';
        }
        const body = JSON.parse(response.body);
        return body.access_token || '';
    }
}


/**
 * Class to handle authentication.
 * @class Authenticator
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
        this.username = username || __ENV.API_USERNAME || '';
        this.password = password || __ENV.API_PASSWORD || '';
        this.token = token || __ENV.API_TOKEN || '';
        this.options = options;
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

    /**
     * Returns the JWT authentication.
     * @param {string} [loginUrl] - Optional login URL override.
     * @returns {string} - The JWT token.
     */
    getJwtAuth(loginUrl) {
        const opts = { ...this.options };
        if (loginUrl) {
            opts.loginUrl = loginUrl;
        }
        let jwtAuth = new JwtAuthenticator(opts);
        return jwtAuth.getAuth();
    }

    /**
     * Returns the API key authentication.
     * @returns {string} - The API key.
     */
    getApiKeyAuth() {
        let apiKeyAuth = new ApiKeyAuthenticator(this.options);
        return apiKeyAuth.getAuth();
    }

    /**
     * Returns the OAuth2 client credentials authentication.
     * @returns {string} - The access token.
     */
    getOAuth2Auth() {
        let oauth2Auth = new OAuth2ClientCredentials(this.options);
        return oauth2Auth.getAuth();
    }
}

export { Authenticator };
