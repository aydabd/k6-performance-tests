## Modules

<dl>
<dt><a href="#module_base-url">base-url</a></dt>
<dd><p>This module is used to create a base URL for the API requests.</p>
</dd>
<dt><a href="#module_http-auth">http-auth</a></dt>
<dd><p>This module contains classes for handling authentication.</p>
</dd>
<dt><a href="#module_http-client">http-client</a></dt>
<dd><p>This module contains the HttpClientFactory, HttpClient, HttpHeaders, HttpOptionsGenerator.</p>
</dd>
<dt><a href="#module_http-error-handler">http-error-handler</a></dt>
<dd><p>This module contains a class that is responsible for logging error details.</p>
</dd>
<dt><a href="#module_WebSocketClient">WebSocketClient</a></dt>
<dd><p>This module contains the WebSocket client class and options generator class.</p>
</dd>
</dl>

<a name="module_base-url"></a>

## base-url
This module is used to create a base URL for the API requests.

**Author**: Aydin Abdi <ayd.abd@gmail.com>  
**License**: MIT  

* [base-url](#module_base-url)
    * [~BaseUrl](#module_base-url..BaseUrl)
        * [new BaseUrl()](#new_module_base-url..BaseUrl_new)
        * [new BaseUrl(options)](#new_module_base-url..BaseUrl_new)
    * [~BaseUrl](#module_base-url..BaseUrl)
        * [new BaseUrl()](#new_module_base-url..BaseUrl_new)
        * [new BaseUrl(options)](#new_module_base-url..BaseUrl_new)

<a name="module_base-url..BaseUrl"></a>

### base-url~BaseUrl
**Kind**: inner class of [<code>base-url</code>](#module_base-url)  

* [~BaseUrl](#module_base-url..BaseUrl)
    * [new BaseUrl()](#new_module_base-url..BaseUrl_new)
    * [new BaseUrl(options)](#new_module_base-url..BaseUrl_new)

<a name="new_module_base-url..BaseUrl_new"></a>

#### new BaseUrl()
The BaseUrl class is used to create a base URL for the API requests.

**Example**  
```javascript
const options = {
   host: 'api.example.com',
   protocol: 'https',
   baseURL: 'https://api.example.com',
   port: 443,
};
const baseUrl = new BaseUrl(options);
console.log(JSON.stringify(baseUrl, null, 2));
```
<a name="new_module_base-url..BaseUrl_new"></a>

#### new BaseUrl(options)
Create a new HttpBaseUrl instance.

**Returns**: <code>object</code> - options - The options updated with the base URL.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options to configure the base URL. |
| options.baseURL | <code>string</code> | The base URL for the API requests. |
| options.host | <code>string</code> | The hostname of the API. |
| options.protocol | <code>string</code> | The protocol for the API requests. |

<a name="module_base-url..BaseUrl"></a>

### base-url~BaseUrl
**Kind**: inner class of [<code>base-url</code>](#module_base-url)  

* [~BaseUrl](#module_base-url..BaseUrl)
    * [new BaseUrl()](#new_module_base-url..BaseUrl_new)
    * [new BaseUrl(options)](#new_module_base-url..BaseUrl_new)

<a name="new_module_base-url..BaseUrl_new"></a>

#### new BaseUrl()
The BaseUrl class is used to create a base URL for the API requests.

**Example**  
```javascript
const options = {
   host: 'api.example.com',
   protocol: 'https',
   baseURL: 'https://api.example.com',
   port: 443,
};
const baseUrl = new BaseUrl(options);
console.log(JSON.stringify(baseUrl, null, 2));
```
<a name="new_module_base-url..BaseUrl_new"></a>

#### new BaseUrl(options)
Create a new HttpBaseUrl instance.

**Returns**: <code>object</code> - options - The options updated with the base URL.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options to configure the base URL. |
| options.baseURL | <code>string</code> | The base URL for the API requests. |
| options.host | <code>string</code> | The hostname of the API. |
| options.protocol | <code>string</code> | The protocol for the API requests. |

<a name="module_http-auth"></a>

## http-auth
This module contains classes for handling authentication.

**Author**: Aydin Abdi <ayd.abd@gmail.com>  
**License**: MIT  
**Example**  
```javascript
import { Authenticator } from './http-auth.js';
const authenticator = new Authenticator();
authenticator.getBasicAuth();
authenticator.getTokenBearerAuth()
```
**Example**  
```javascript
import { Authenticator } from './http-auth.js';
const authenticator = new Authenticator('username', 'password');
```

* [http-auth](#module_http-auth)
    * *[~IAuthenticator](#module_http-auth..IAuthenticator)*
        * *[.getAuth()](#module_http-auth..IAuthenticator+getAuth)*
    * [~BasicAuthenticator](#module_http-auth..BasicAuthenticator) ⇐ <code>IAuthenticator</code>
        * [new BasicAuthenticator(options)](#new_module_http-auth..BasicAuthenticator_new)
        * [.getAuth()](#module_http-auth..BasicAuthenticator+getAuth) ⇒ <code>string</code>
    * [~TokenBearerAuthenticator](#module_http-auth..TokenBearerAuthenticator) ⇐ <code>IAuthenticator</code>
    * [~Authenticator](#module_http-auth..Authenticator)
        * [new Authenticator()](#new_module_http-auth..Authenticator_new)
        * [new Authenticator(options)](#new_module_http-auth..Authenticator_new)
        * [.getBasicAuth()](#module_http-auth..Authenticator+getBasicAuth) ⇒ <code>string</code>
        * [.getTokenBearerAuth()](#module_http-auth..Authenticator+getTokenBearerAuth) ⇒ <code>string</code>
    * [~Authenticator](#module_http-auth..Authenticator)
        * [new Authenticator()](#new_module_http-auth..Authenticator_new)
        * [new Authenticator(options)](#new_module_http-auth..Authenticator_new)
        * [.getBasicAuth()](#module_http-auth..Authenticator+getBasicAuth) ⇒ <code>string</code>
        * [.getTokenBearerAuth()](#module_http-auth..Authenticator+getTokenBearerAuth) ⇒ <code>string</code>

<a name="module_http-auth..IAuthenticator"></a>

### *http-auth~IAuthenticator*
Interface for authenticator classes.

**Kind**: inner abstract class of [<code>http-auth</code>](#module_http-auth)  
<a name="module_http-auth..IAuthenticator+getAuth"></a>

#### *iAuthenticator.getAuth()*
Returns the authentication header.

**Kind**: instance method of [<code>IAuthenticator</code>](#module_http-auth..IAuthenticator)  
**Throws**:

- <code>Error</code> - Not Implemented.

<a name="module_http-auth..BasicAuthenticator"></a>

### http-auth~BasicAuthenticator ⇐ <code>IAuthenticator</code>
Class to handle basic authentication.

**Kind**: inner class of [<code>http-auth</code>](#module_http-auth)  
**Extends**: <code>IAuthenticator</code>  

* [~BasicAuthenticator](#module_http-auth..BasicAuthenticator) ⇐ <code>IAuthenticator</code>
    * [new BasicAuthenticator(options)](#new_module_http-auth..BasicAuthenticator_new)
    * [.getAuth()](#module_http-auth..BasicAuthenticator+getAuth) ⇒ <code>string</code>

<a name="new_module_http-auth..BasicAuthenticator_new"></a>

#### new BasicAuthenticator(options)
Create a new BasicAuthenticator instance.


| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options. |

<a name="module_http-auth..BasicAuthenticator+getAuth"></a>

#### basicAuthenticator.getAuth() ⇒ <code>string</code>
Get the encoded basic authentication.

**Kind**: instance method of [<code>BasicAuthenticator</code>](#module_http-auth..BasicAuthenticator)  
**Returns**: <code>string</code> - - The enocoded basic authentication.  
<a name="module_http-auth..TokenBearerAuthenticator"></a>

### http-auth~TokenBearerAuthenticator ⇐ <code>IAuthenticator</code>
Class to handle token bearer authentication.

**Kind**: inner class of [<code>http-auth</code>](#module_http-auth)  
**Extends**: <code>IAuthenticator</code>  
<a name="module_http-auth..Authenticator"></a>

### http-auth~Authenticator
**Kind**: inner class of [<code>http-auth</code>](#module_http-auth)  

* [~Authenticator](#module_http-auth..Authenticator)
    * [new Authenticator()](#new_module_http-auth..Authenticator_new)
    * [new Authenticator(options)](#new_module_http-auth..Authenticator_new)
    * [.getBasicAuth()](#module_http-auth..Authenticator+getBasicAuth) ⇒ <code>string</code>
    * [.getTokenBearerAuth()](#module_http-auth..Authenticator+getTokenBearerAuth) ⇒ <code>string</code>

<a name="new_module_http-auth..Authenticator_new"></a>

#### new Authenticator()
Class to handle authentication.

**Example**  
```javascript
const authenticator = new Authenticator();
authenticator.getBasicAuth();
authenticator.getTokenBearerAuth();
```
<a name="new_module_http-auth..Authenticator_new"></a>

#### new Authenticator(options)
Create a new Authenticator instance.


| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options. |
| options.username | <code>string</code> | The username. |
| options.password | <code>string</code> | The password. |
| options.token | <code>string</code> | The token. |

<a name="module_http-auth..Authenticator+getBasicAuth"></a>

#### authenticator.getBasicAuth() ⇒ <code>string</code>
Returns the encoded authentication.

**Kind**: instance method of [<code>Authenticator</code>](#module_http-auth..Authenticator)  
**Returns**: <code>string</code> - - The authentication.  
<a name="module_http-auth..Authenticator+getTokenBearerAuth"></a>

#### authenticator.getTokenBearerAuth() ⇒ <code>string</code>
Returns the token bearer authentication.

**Kind**: instance method of [<code>Authenticator</code>](#module_http-auth..Authenticator)  
**Returns**: <code>string</code> - - The token bearer authentication.  
<a name="module_http-auth..Authenticator"></a>

### http-auth~Authenticator
**Kind**: inner class of [<code>http-auth</code>](#module_http-auth)  

* [~Authenticator](#module_http-auth..Authenticator)
    * [new Authenticator()](#new_module_http-auth..Authenticator_new)
    * [new Authenticator(options)](#new_module_http-auth..Authenticator_new)
    * [.getBasicAuth()](#module_http-auth..Authenticator+getBasicAuth) ⇒ <code>string</code>
    * [.getTokenBearerAuth()](#module_http-auth..Authenticator+getTokenBearerAuth) ⇒ <code>string</code>

<a name="new_module_http-auth..Authenticator_new"></a>

#### new Authenticator()
Class to handle authentication.

**Example**  
```javascript
const authenticator = new Authenticator();
authenticator.getBasicAuth();
authenticator.getTokenBearerAuth();
```
<a name="new_module_http-auth..Authenticator_new"></a>

#### new Authenticator(options)
Create a new Authenticator instance.


| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options. |
| options.username | <code>string</code> | The username. |
| options.password | <code>string</code> | The password. |
| options.token | <code>string</code> | The token. |

<a name="module_http-auth..Authenticator+getBasicAuth"></a>

#### authenticator.getBasicAuth() ⇒ <code>string</code>
Returns the encoded authentication.

**Kind**: instance method of [<code>Authenticator</code>](#module_http-auth..Authenticator)  
**Returns**: <code>string</code> - - The authentication.  
<a name="module_http-auth..Authenticator+getTokenBearerAuth"></a>

#### authenticator.getTokenBearerAuth() ⇒ <code>string</code>
Returns the token bearer authentication.

**Kind**: instance method of [<code>Authenticator</code>](#module_http-auth..Authenticator)  
**Returns**: <code>string</code> - - The token bearer authentication.  
<a name="module_http-client"></a>

## http-client
This module contains the HttpClientFactory, HttpClient, HttpHeaders, HttpOptionsGenerator.

**Author**: Aydin Abdi <ayd.abd@gmail.com>  
**License**: MIT  

* [http-client](#module_http-client)
    * [~HttpHeaders](#module_http-client..HttpHeaders)
        * [new HttpHeaders()](#new_module_http-client..HttpHeaders_new)
        * [new HttpHeaders(options)](#new_module_http-client..HttpHeaders_new)
        * [.addBasicAuthorization(options)](#module_http-client..HttpHeaders+addBasicAuthorization) ⇒ <code>object</code>
        * [.addTokenBearerAuthorization(options)](#module_http-client..HttpHeaders+addTokenBearerAuthorization) ⇒ <code>object</code>
        * [.addAuthHeaders(options)](#module_http-client..HttpHeaders+addAuthHeaders) ⇒ <code>object</code>
    * [~HttpHeaders](#module_http-client..HttpHeaders)
        * [new HttpHeaders()](#new_module_http-client..HttpHeaders_new)
        * [new HttpHeaders(options)](#new_module_http-client..HttpHeaders_new)
        * [.addBasicAuthorization(options)](#module_http-client..HttpHeaders+addBasicAuthorization) ⇒ <code>object</code>
        * [.addTokenBearerAuthorization(options)](#module_http-client..HttpHeaders+addTokenBearerAuthorization) ⇒ <code>object</code>
        * [.addAuthHeaders(options)](#module_http-client..HttpHeaders+addAuthHeaders) ⇒ <code>object</code>
    * [~HttpOptionsGenerator](#module_http-client..HttpOptionsGenerator)
        * [new HttpOptionsGenerator()](#new_module_http-client..HttpOptionsGenerator_new)
        * [new HttpOptionsGenerator(options)](#new_module_http-client..HttpOptionsGenerator_new)
    * [~HttpOptionsGenerator](#module_http-client..HttpOptionsGenerator)
        * [new HttpOptionsGenerator()](#new_module_http-client..HttpOptionsGenerator_new)
        * [new HttpOptionsGenerator(options)](#new_module_http-client..HttpOptionsGenerator_new)
    * [~HttpClient](#module_http-client..HttpClient)
        * [new HttpClient()](#new_module_http-client..HttpClient_new)
        * [new HttpClient(options)](#new_module_http-client..HttpClient_new)
        * [.reset()](#module_http-client..HttpClient+reset) ⇒ <code>void</code>
        * [.buildUrl()](#module_http-client..HttpClient+buildUrl) ⇒ <code>string</code>
        * [.buildQueryParams(queryParams)](#module_http-client..HttpClient+buildQueryParams) ⇒ <code>string</code>
        * [.request(method, url, body, params)](#module_http-client..HttpClient+request) ⇒ <code>object</code>
        * [.handleResponse(response)](#module_http-client..HttpClient+handleResponse) ⇒ <code>object</code>
        * [.wsSignalRConnection(method, url, body, params)](#module_http-client..HttpClient+wsSignalRConnection) ⇒ <code>object</code>
        * [.createProxy()](#module_http-client..HttpClient+createProxy) ⇒ <code>object</code>
    * [~HttpClient](#module_http-client..HttpClient)
        * [new HttpClient()](#new_module_http-client..HttpClient_new)
        * [new HttpClient(options)](#new_module_http-client..HttpClient_new)
        * [.reset()](#module_http-client..HttpClient+reset) ⇒ <code>void</code>
        * [.buildUrl()](#module_http-client..HttpClient+buildUrl) ⇒ <code>string</code>
        * [.buildQueryParams(queryParams)](#module_http-client..HttpClient+buildQueryParams) ⇒ <code>string</code>
        * [.request(method, url, body, params)](#module_http-client..HttpClient+request) ⇒ <code>object</code>
        * [.handleResponse(response)](#module_http-client..HttpClient+handleResponse) ⇒ <code>object</code>
        * [.wsSignalRConnection(method, url, body, params)](#module_http-client..HttpClient+wsSignalRConnection) ⇒ <code>object</code>
        * [.createProxy()](#module_http-client..HttpClient+createProxy) ⇒ <code>object</code>
    * [~HttpClientFactory](#module_http-client..HttpClientFactory)
        * [new HttpClientFactory(options)](#new_module_http-client..HttpClientFactory_new)

<a name="module_http-client..HttpHeaders"></a>

### http-client~HttpHeaders
**Kind**: inner class of [<code>http-client</code>](#module_http-client)  

* [~HttpHeaders](#module_http-client..HttpHeaders)
    * [new HttpHeaders()](#new_module_http-client..HttpHeaders_new)
    * [new HttpHeaders(options)](#new_module_http-client..HttpHeaders_new)
    * [.addBasicAuthorization(options)](#module_http-client..HttpHeaders+addBasicAuthorization) ⇒ <code>object</code>
    * [.addTokenBearerAuthorization(options)](#module_http-client..HttpHeaders+addTokenBearerAuthorization) ⇒ <code>object</code>
    * [.addAuthHeaders(options)](#module_http-client..HttpHeaders+addAuthHeaders) ⇒ <code>object</code>

<a name="new_module_http-client..HttpHeaders_new"></a>

#### new HttpHeaders()
Class representing the headers for the API requests.

**Example**  
```javascript
const headers = new HttpHeaders({
    headers: { 'Content-Type': 'application/json' },
    authenticator: new Authenticator('username', 'password')
});
headers.options;
headers.HttpHeaders.basicAuth;
```
<a name="new_module_http-client..HttpHeaders_new"></a>

#### new HttpHeaders(options)
Create a new Headers instance.

**Returns**: <code>object</code> - options - The options updated with the headers and HttpHeaders instance.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options to configure the headers. |
| options.headers | <code>object</code> | The headers to add to the request. |
| options.authenticator | <code>object</code> | The authenticator to use for the request. |

<a name="module_http-client..HttpHeaders+addBasicAuthorization"></a>

#### httpHeaders.addBasicAuthorization(options) ⇒ <code>object</code>
Add the basic authorization headers to the existing headers.

**Kind**: instance method of [<code>HttpHeaders</code>](#module_http-client..HttpHeaders)  
**Returns**: <code>object</code> - The options updated with the headers.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options to add the basic authorization headers to. |
| options.authenticator | <code>object</code> | The authenticator to use for the request. |

<a name="module_http-client..HttpHeaders+addTokenBearerAuthorization"></a>

#### httpHeaders.addTokenBearerAuthorization(options) ⇒ <code>object</code>
Add Authorization headers to the existing headers.

**Kind**: instance method of [<code>HttpHeaders</code>](#module_http-client..HttpHeaders)  
**Returns**: <code>object</code> - The options updated with the headers.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options to add the Authorization headers to. |
| options.authenticator | <code>object</code> | The authenticator to use for the request. |

<a name="module_http-client..HttpHeaders+addAuthHeaders"></a>

#### httpHeaders.addAuthHeaders(options) ⇒ <code>object</code>
Add the basic and token bearer authorization headers to the existing headers.

**Kind**: instance method of [<code>HttpHeaders</code>](#module_http-client..HttpHeaders)  
**Returns**: <code>object</code> - The options updated with the headers.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options to add the headers to. |

<a name="module_http-client..HttpHeaders"></a>

### http-client~HttpHeaders
**Kind**: inner class of [<code>http-client</code>](#module_http-client)  

* [~HttpHeaders](#module_http-client..HttpHeaders)
    * [new HttpHeaders()](#new_module_http-client..HttpHeaders_new)
    * [new HttpHeaders(options)](#new_module_http-client..HttpHeaders_new)
    * [.addBasicAuthorization(options)](#module_http-client..HttpHeaders+addBasicAuthorization) ⇒ <code>object</code>
    * [.addTokenBearerAuthorization(options)](#module_http-client..HttpHeaders+addTokenBearerAuthorization) ⇒ <code>object</code>
    * [.addAuthHeaders(options)](#module_http-client..HttpHeaders+addAuthHeaders) ⇒ <code>object</code>

<a name="new_module_http-client..HttpHeaders_new"></a>

#### new HttpHeaders()
Class representing the headers for the API requests.

**Example**  
```javascript
const headers = new HttpHeaders({
    headers: { 'Content-Type': 'application/json' },
    authenticator: new Authenticator('username', 'password')
});
headers.options;
headers.HttpHeaders.basicAuth;
```
<a name="new_module_http-client..HttpHeaders_new"></a>

#### new HttpHeaders(options)
Create a new Headers instance.

**Returns**: <code>object</code> - options - The options updated with the headers and HttpHeaders instance.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options to configure the headers. |
| options.headers | <code>object</code> | The headers to add to the request. |
| options.authenticator | <code>object</code> | The authenticator to use for the request. |

<a name="module_http-client..HttpHeaders+addBasicAuthorization"></a>

#### httpHeaders.addBasicAuthorization(options) ⇒ <code>object</code>
Add the basic authorization headers to the existing headers.

**Kind**: instance method of [<code>HttpHeaders</code>](#module_http-client..HttpHeaders)  
**Returns**: <code>object</code> - The options updated with the headers.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options to add the basic authorization headers to. |
| options.authenticator | <code>object</code> | The authenticator to use for the request. |

<a name="module_http-client..HttpHeaders+addTokenBearerAuthorization"></a>

#### httpHeaders.addTokenBearerAuthorization(options) ⇒ <code>object</code>
Add Authorization headers to the existing headers.

**Kind**: instance method of [<code>HttpHeaders</code>](#module_http-client..HttpHeaders)  
**Returns**: <code>object</code> - The options updated with the headers.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options to add the Authorization headers to. |
| options.authenticator | <code>object</code> | The authenticator to use for the request. |

<a name="module_http-client..HttpHeaders+addAuthHeaders"></a>

#### httpHeaders.addAuthHeaders(options) ⇒ <code>object</code>
Add the basic and token bearer authorization headers to the existing headers.

**Kind**: instance method of [<code>HttpHeaders</code>](#module_http-client..HttpHeaders)  
**Returns**: <code>object</code> - The options updated with the headers.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options to add the headers to. |

<a name="module_http-client..HttpOptionsGenerator"></a>

### http-client~HttpOptionsGenerator
**Kind**: inner class of [<code>http-client</code>](#module_http-client)  

* [~HttpOptionsGenerator](#module_http-client..HttpOptionsGenerator)
    * [new HttpOptionsGenerator()](#new_module_http-client..HttpOptionsGenerator_new)
    * [new HttpOptionsGenerator(options)](#new_module_http-client..HttpOptionsGenerator_new)

<a name="new_module_http-client..HttpOptionsGenerator_new"></a>

#### new HttpOptionsGenerator()
Class representing the options for the HttpClient.

**Example**  
```javascript
const options = new HttpOptionsGenerator({
     host: 'api.example
     username: 'username',
     password: 'password',
     headers: { 'Content-Type': 'application/json' },
     vuId: 1,
     iterId: 1
});
```
<a name="new_module_http-client..HttpOptionsGenerator_new"></a>

#### new HttpOptionsGenerator(options)
Create a new HttpOptionsGenerator instance.

**Returns**: <code>object</code> - - The options for the HttpClient.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options to configure the HttpClient. |
| options.baseURL | <code>string</code> | The base URL for the API requests. |
| options.host | <code>string</code> | The hostname of the API. |
| options.username | <code>string</code> | The username for the request. |
| options.password | <code>string</code> | The password for the request. |
| options.token | <code>string</code> | The token bearer for the request. |
| options.authenticator | <code>object</code> | The authenticator for the request. |
| options.headers | <code>object</code> | The headers for the request. |

<a name="module_http-client..HttpOptionsGenerator"></a>

### http-client~HttpOptionsGenerator
**Kind**: inner class of [<code>http-client</code>](#module_http-client)  

* [~HttpOptionsGenerator](#module_http-client..HttpOptionsGenerator)
    * [new HttpOptionsGenerator()](#new_module_http-client..HttpOptionsGenerator_new)
    * [new HttpOptionsGenerator(options)](#new_module_http-client..HttpOptionsGenerator_new)

<a name="new_module_http-client..HttpOptionsGenerator_new"></a>

#### new HttpOptionsGenerator()
Class representing the options for the HttpClient.

**Example**  
```javascript
const options = new HttpOptionsGenerator({
     host: 'api.example
     username: 'username',
     password: 'password',
     headers: { 'Content-Type': 'application/json' },
     vuId: 1,
     iterId: 1
});
```
<a name="new_module_http-client..HttpOptionsGenerator_new"></a>

#### new HttpOptionsGenerator(options)
Create a new HttpOptionsGenerator instance.

**Returns**: <code>object</code> - - The options for the HttpClient.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options to configure the HttpClient. |
| options.baseURL | <code>string</code> | The base URL for the API requests. |
| options.host | <code>string</code> | The hostname of the API. |
| options.username | <code>string</code> | The username for the request. |
| options.password | <code>string</code> | The password for the request. |
| options.token | <code>string</code> | The token bearer for the request. |
| options.authenticator | <code>object</code> | The authenticator for the request. |
| options.headers | <code>object</code> | The headers for the request. |

<a name="module_http-client..HttpClient"></a>

### http-client~HttpClient
**Kind**: inner class of [<code>http-client</code>](#module_http-client)  

* [~HttpClient](#module_http-client..HttpClient)
    * [new HttpClient()](#new_module_http-client..HttpClient_new)
    * [new HttpClient(options)](#new_module_http-client..HttpClient_new)
    * [.reset()](#module_http-client..HttpClient+reset) ⇒ <code>void</code>
    * [.buildUrl()](#module_http-client..HttpClient+buildUrl) ⇒ <code>string</code>
    * [.buildQueryParams(queryParams)](#module_http-client..HttpClient+buildQueryParams) ⇒ <code>string</code>
    * [.request(method, url, body, params)](#module_http-client..HttpClient+request) ⇒ <code>object</code>
    * [.handleResponse(response)](#module_http-client..HttpClient+handleResponse) ⇒ <code>object</code>
    * [.wsSignalRConnection(method, url, body, params)](#module_http-client..HttpClient+wsSignalRConnection) ⇒ <code>object</code>
    * [.createProxy()](#module_http-client..HttpClient+createProxy) ⇒ <code>object</code>

<a name="new_module_http-client..HttpClient_new"></a>

#### new HttpClient()
Class representing a client for HTTP requests, supporting dynamic endpoint construction.

**Example**  
```javascript
const client = new HttpClient({ host: 'api.example.com', port: 443, protocol: 'https' });
client.request('get', { queryParams: { key1: 'value1' } });
client.createProxy().api.v2.users(1).get();
```
**Example**  
Use the HttpClient to send a request to the API.
```javascript
const genOptions = generateOptions('api.example.com', 'username', 'password');
const httpC = new HttpClient(genOptions);
let headers = httpC.session.k6params.headers;
headers["Content-Type"] = "application/json";
httpC.session.put(`/api/test/user/${caseId}`, JSON.stringify({ id: caseId}), { headers: headers });
```
<a name="new_module_http-client..HttpClient_new"></a>

#### new HttpClient(options)
Create a new HttpClient instance.


| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options to configure the client. |

<a name="module_http-client..HttpClient+reset"></a>

#### httpClient.reset() ⇒ <code>void</code>
Reset the path segments, body, method and params for the next request.

**Kind**: instance method of [<code>HttpClient</code>](#module_http-client..HttpClient)  
<a name="module_http-client..HttpClient+buildUrl"></a>

#### httpClient.buildUrl() ⇒ <code>string</code>
Build the complete URL using the base URL and the path segments.

**Kind**: instance method of [<code>HttpClient</code>](#module_http-client..HttpClient)  
**Returns**: <code>string</code> - The complete URL.  
**Example**  
```javascript
// returns 'https://api.example.com:443/v1/users'
buildUrl();
```
**Example**  
```javascript
// returns 'https://api.example.com:443/v1/users-name'
this.pathSegments = ['v1', 'users_name'];
buildUrl();
```
<a name="module_http-client..HttpClient+buildQueryParams"></a>

#### httpClient.buildQueryParams(queryParams) ⇒ <code>string</code>
Construct the query parameters string from an object.

**Kind**: instance method of [<code>HttpClient</code>](#module_http-client..HttpClient)  
**Returns**: <code>string</code> - The query parameters string.  

| Param | Type | Description |
| --- | --- | --- |
| queryParams | <code>object</code> | The query parameters. |

**Example**  
```javascript
buildQueryParams({ key1: 'value1', key2: 'value2' });
// returns '/?key1=value1&key2=value2'
```
<a name="module_http-client..HttpClient+request"></a>

#### httpClient.request(method, url, body, params) ⇒ <code>object</code>
Send a request to the API.

**Kind**: instance method of [<code>HttpClient</code>](#module_http-client..HttpClient)  
**Returns**: <code>object</code> - The response.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| method | <code>string</code> |  | The HTTP method. |
| url | <code>string</code> |  | The request URL. |
| body | <code>object</code> | <code></code> | The request body. |
| params | <code>object</code> |  | The request parameters. |

**Example**  
```javascript
request('get', { queryParams: { key1: 'value1' } });
```
<a name="module_http-client..HttpClient+handleResponse"></a>

#### httpClient.handleResponse(response) ⇒ <code>object</code>
Handle the response from the API.

**Kind**: instance method of [<code>HttpClient</code>](#module_http-client..HttpClient)  
**Returns**: <code>object</code> - The response.  

| Param | Type | Description |
| --- | --- | --- |
| response | <code>object</code> | The response from the API. |

**Example**  
```javascript
handleResponse(response);
```
<a name="module_http-client..HttpClient+wsSignalRConnection"></a>

#### httpClient.wsSignalRConnection(method, url, body, params) ⇒ <code>object</code>
Get the Websocket connection details for Microsoft SignalR Hub connection.

**Kind**: instance method of [<code>HttpClient</code>](#module_http-client..HttpClient)  
**Returns**: <code>object</code> - The Websocket connection details.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| method | <code>string</code> | <code>&quot;get&quot;</code> | The HTTP method. |
| url | <code>string</code> |  | The request URL. |
| body | <code>object</code> | <code></code> | The request body. |
| params | <code>object</code> |  | The request parameters. |

<a name="module_http-client..HttpClient+createProxy"></a>

#### httpClient.createProxy() ⇒ <code>object</code>
Create a dynamic client proxy.

**Kind**: instance method of [<code>HttpClient</code>](#module_http-client..HttpClient)  
**Returns**: <code>object</code> - A Proxy to dynamically handle path segments and HTTP methods.  
<a name="module_http-client..HttpClient"></a>

### http-client~HttpClient
**Kind**: inner class of [<code>http-client</code>](#module_http-client)  

* [~HttpClient](#module_http-client..HttpClient)
    * [new HttpClient()](#new_module_http-client..HttpClient_new)
    * [new HttpClient(options)](#new_module_http-client..HttpClient_new)
    * [.reset()](#module_http-client..HttpClient+reset) ⇒ <code>void</code>
    * [.buildUrl()](#module_http-client..HttpClient+buildUrl) ⇒ <code>string</code>
    * [.buildQueryParams(queryParams)](#module_http-client..HttpClient+buildQueryParams) ⇒ <code>string</code>
    * [.request(method, url, body, params)](#module_http-client..HttpClient+request) ⇒ <code>object</code>
    * [.handleResponse(response)](#module_http-client..HttpClient+handleResponse) ⇒ <code>object</code>
    * [.wsSignalRConnection(method, url, body, params)](#module_http-client..HttpClient+wsSignalRConnection) ⇒ <code>object</code>
    * [.createProxy()](#module_http-client..HttpClient+createProxy) ⇒ <code>object</code>

<a name="new_module_http-client..HttpClient_new"></a>

#### new HttpClient()
Class representing a client for HTTP requests, supporting dynamic endpoint construction.

**Example**  
```javascript
const client = new HttpClient({ host: 'api.example.com', port: 443, protocol: 'https' });
client.request('get', { queryParams: { key1: 'value1' } });
client.createProxy().api.v2.users(1).get();
```
**Example**  
Use the HttpClient to send a request to the API.
```javascript
const genOptions = generateOptions('api.example.com', 'username', 'password');
const httpC = new HttpClient(genOptions);
let headers = httpC.session.k6params.headers;
headers["Content-Type"] = "application/json";
httpC.session.put(`/api/test/user/${caseId}`, JSON.stringify({ id: caseId}), { headers: headers });
```
<a name="new_module_http-client..HttpClient_new"></a>

#### new HttpClient(options)
Create a new HttpClient instance.


| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options to configure the client. |

<a name="module_http-client..HttpClient+reset"></a>

#### httpClient.reset() ⇒ <code>void</code>
Reset the path segments, body, method and params for the next request.

**Kind**: instance method of [<code>HttpClient</code>](#module_http-client..HttpClient)  
<a name="module_http-client..HttpClient+buildUrl"></a>

#### httpClient.buildUrl() ⇒ <code>string</code>
Build the complete URL using the base URL and the path segments.

**Kind**: instance method of [<code>HttpClient</code>](#module_http-client..HttpClient)  
**Returns**: <code>string</code> - The complete URL.  
**Example**  
```javascript
// returns 'https://api.example.com:443/v1/users'
buildUrl();
```
**Example**  
```javascript
// returns 'https://api.example.com:443/v1/users-name'
this.pathSegments = ['v1', 'users_name'];
buildUrl();
```
<a name="module_http-client..HttpClient+buildQueryParams"></a>

#### httpClient.buildQueryParams(queryParams) ⇒ <code>string</code>
Construct the query parameters string from an object.

**Kind**: instance method of [<code>HttpClient</code>](#module_http-client..HttpClient)  
**Returns**: <code>string</code> - The query parameters string.  

| Param | Type | Description |
| --- | --- | --- |
| queryParams | <code>object</code> | The query parameters. |

**Example**  
```javascript
buildQueryParams({ key1: 'value1', key2: 'value2' });
// returns '/?key1=value1&key2=value2'
```
<a name="module_http-client..HttpClient+request"></a>

#### httpClient.request(method, url, body, params) ⇒ <code>object</code>
Send a request to the API.

**Kind**: instance method of [<code>HttpClient</code>](#module_http-client..HttpClient)  
**Returns**: <code>object</code> - The response.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| method | <code>string</code> |  | The HTTP method. |
| url | <code>string</code> |  | The request URL. |
| body | <code>object</code> | <code></code> | The request body. |
| params | <code>object</code> |  | The request parameters. |

**Example**  
```javascript
request('get', { queryParams: { key1: 'value1' } });
```
<a name="module_http-client..HttpClient+handleResponse"></a>

#### httpClient.handleResponse(response) ⇒ <code>object</code>
Handle the response from the API.

**Kind**: instance method of [<code>HttpClient</code>](#module_http-client..HttpClient)  
**Returns**: <code>object</code> - The response.  

| Param | Type | Description |
| --- | --- | --- |
| response | <code>object</code> | The response from the API. |

**Example**  
```javascript
handleResponse(response);
```
<a name="module_http-client..HttpClient+wsSignalRConnection"></a>

#### httpClient.wsSignalRConnection(method, url, body, params) ⇒ <code>object</code>
Get the Websocket connection details for Microsoft SignalR Hub connection.

**Kind**: instance method of [<code>HttpClient</code>](#module_http-client..HttpClient)  
**Returns**: <code>object</code> - The Websocket connection details.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| method | <code>string</code> | <code>&quot;get&quot;</code> | The HTTP method. |
| url | <code>string</code> |  | The request URL. |
| body | <code>object</code> | <code></code> | The request body. |
| params | <code>object</code> |  | The request parameters. |

<a name="module_http-client..HttpClient+createProxy"></a>

#### httpClient.createProxy() ⇒ <code>object</code>
Create a dynamic client proxy.

**Kind**: instance method of [<code>HttpClient</code>](#module_http-client..HttpClient)  
**Returns**: <code>object</code> - A Proxy to dynamically handle path segments and HTTP methods.  
<a name="module_http-client..HttpClientFactory"></a>

### http-client~HttpClientFactory
**Kind**: inner class of [<code>http-client</code>](#module_http-client)  
<a name="new_module_http-client..HttpClientFactory_new"></a>

#### new HttpClientFactory(options)
Factory class to create a new HttpClient instance with a dynamic client proxy.

**Returns**: <code>object</code> - The dynamic client proxy, the HttpClient and the options.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options to configure the client. |

**Example**  
```javascript
let { dynamicClient, httpClient, options } = new HttpClientFactory({ host: 'api.example.com', port: 443, protocol: 'https' });
dynamicClient.api.v1.users(1).get();
```
**Example**  
```javascript
let { dynamicClient, httpClient, options } = new HttpClientFactory({ host: 'api.example.com', port: 443, protocol: 'https' });
dynamicClient.soapapi.xml.post({ queryParams: { soapPath: 'mypath.amsx', soapBody: 'body' } });
```
<a name="module_http-error-handler"></a>

## http-error-handler
This module contains a class that is responsible for logging error details.

**Author**: Aydin Abdi <ayd.abd@gmail.com>  
**License**: MIT  

* [http-error-handler](#module_http-error-handler)
    * [~HttpErrorHandler](#module_http-error-handler..HttpErrorHandler)
        * [new HttpErrorHandler(logErrorDetails)](#new_module_http-error-handler..HttpErrorHandler_new)
        * [.logError(isError, res, tags)](#module_http-error-handler..HttpErrorHandler+logError)
    * [~ErrorHandler](#module_http-error-handler..ErrorHandler)
        * [new ErrorHandler(errorData)](#new_module_http-error-handler..ErrorHandler_new)

<a name="module_http-error-handler..HttpErrorHandler"></a>

### http-error-handler~HttpErrorHandler
HttpErrorHandler
It can be extended to log errors to a different location.
It is used by the API client to log error details.

**Kind**: inner class of [<code>http-error-handler</code>](#module_http-error-handler)  

* [~HttpErrorHandler](#module_http-error-handler..HttpErrorHandler)
    * [new HttpErrorHandler(logErrorDetails)](#new_module_http-error-handler..HttpErrorHandler_new)
    * [.logError(isError, res, tags)](#module_http-error-handler..HttpErrorHandler+logError)

<a name="new_module_http-error-handler..HttpErrorHandler_new"></a>

#### new HttpErrorHandler(logErrorDetails)
Creates a new HttpErrorHandler instance.


| Param | Type | Description |
| --- | --- | --- |
| logErrorDetails | <code>function</code> | A function that logs error details. The function should accept an object with error details as its only argument. The object will contain the following properties: - url: The URL of the request that caused the error.     This can be useful for debugging.     It can be used to identify the request that caused the error. - status: The HTTP status code of the response.   This can be useful for identifying the type of error that occurred.   For example, a 404 status code indicates that the requested resource was not found.   A 500 status code indicates that an internal server error occurred.   A 401 status code indicates that the request was unauthorized. - error_code: The error code returned by the server.   This can be useful for identifying the type of error that occurred.   For example, a 404 status code might be accompanied by a `not_found` error code.   A 500 status code might be accompanied by a `internal_server_error` error code. |

<a name="module_http-error-handler..HttpErrorHandler+logError"></a>

#### httpErrorHandler.logError(isError, res, tags)
Logs error details if isError is true.

**Kind**: instance method of [<code>HttpErrorHandler</code>](#module_http-error-handler..HttpErrorHandler)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| isError | <code>boolean</code> | <code>false</code> | Indicates whether an error occurred. |
| res | <code>object</code> |  | The response object. |
| tags | <code>object</code> |  | Additional tags to include in the error details.  This can be useful for adding context to the error details.  For example, you might include the name of the function that made the request.  Or you might include the name of the service that the request was made to.  This can help you identify the source of the error. |

<a name="module_http-error-handler..ErrorHandler"></a>

### http-error-handler~ErrorHandler
**Kind**: inner class of [<code>http-error-handler</code>](#module_http-error-handler)  
<a name="new_module_http-error-handler..ErrorHandler_new"></a>

#### new ErrorHandler(errorData)
Logs error details to the console.


| Param | Type | Description |
| --- | --- | --- |
| errorData | <code>object</code> | An object containing error details. The object will contain the following properties: - url: The URL of the request that caused the error.   This can be useful for debugging.   It can be used to identify the request that caused the error.   - status: The HTTP status code of the response.   This can be useful for identifying the type of error that occurred.   For example, a 404 status code indicates that the requested resource was not found.   A 500 status code indicates that an internal server error occurred.   A 401 status code indicates that the request was unauthorized.   - error_code: The error code returned by the server.   This can be useful for identifying the type of error that occurred.   For example, a 404 status code might be accompanied by a `not_found` error code.   A 500 status code might be accompanied by a `internal_server_error` error code.   - error_body: The body of the error response.   This can be useful for identifying the cause of the error.   For example, it might contain a message explaining what went wrong.   - timestamp: The time at which the error occurred.   This can be useful for identifying when the error occurred.   - tags: Additional tags to include in the error details.   This can be useful for adding context to the error details.   For example, you might include the name of the function that made the request.   Or you might include the name of the service that the request was made to.   This can help you identify the source of the error. |

<a name="module_WebSocketClient"></a>

## WebSocketClient
This module contains the WebSocket client class and options generator class.

**Author**: Aydin Abdi <ayd.abd@gmail.com>  
**License**: MIT  

* [WebSocketClient](#module_WebSocketClient)
    * [~WSOptionsGenerator](#module_WebSocketClient..WSOptionsGenerator)
        * [new WSOptionsGenerator()](#new_module_WebSocketClient..WSOptionsGenerator_new)
        * [new WSOptionsGenerator(options)](#new_module_WebSocketClient..WSOptionsGenerator_new)
    * [~WSOptionsGenerator](#module_WebSocketClient..WSOptionsGenerator)
        * [new WSOptionsGenerator()](#new_module_WebSocketClient..WSOptionsGenerator_new)
        * [new WSOptionsGenerator(options)](#new_module_WebSocketClient..WSOptionsGenerator_new)
    * [~WebSocketClient](#module_WebSocketClient..WebSocketClient)
        * [new WebSocketClient()](#new_module_WebSocketClient..WebSocketClient_new)
        * [.addEventListener(event, handler)](#module_WebSocketClient..WebSocketClient+addEventListener)
        * [.close(code, reason)](#module_WebSocketClient..WebSocketClient+close)
        * [.send(message)](#module_WebSocketClient..WebSocketClient+send)
        * [.startTimeout()](#module_WebSocketClient..WebSocketClient+startTimeout)
        * [.clTimeout()](#module_WebSocketClient..WebSocketClient+clTimeout)
        * [.signalRhubHandshake(protocol, version)](#module_WebSocketClient..WebSocketClient+signalRhubHandshake)
        * [.onSignalROpen()](#module_WebSocketClient..WebSocketClient+onSignalROpen)
        * [.onClose(message)](#module_WebSocketClient..WebSocketClient+onClose)
        * [.onError(message)](#module_WebSocketClient..WebSocketClient+onError)
        * [.setupSignalREventListeners()](#module_WebSocketClient..WebSocketClient+setupSignalREventListeners)
        * [.tearDown()](#module_WebSocketClient..WebSocketClient+tearDown)

<a name="module_WebSocketClient..WSOptionsGenerator"></a>

### WebSocketClient~WSOptionsGenerator
**Kind**: inner class of [<code>WebSocketClient</code>](#module_WebSocketClient)  

* [~WSOptionsGenerator](#module_WebSocketClient..WSOptionsGenerator)
    * [new WSOptionsGenerator()](#new_module_WebSocketClient..WSOptionsGenerator_new)
    * [new WSOptionsGenerator(options)](#new_module_WebSocketClient..WSOptionsGenerator_new)

<a name="new_module_WebSocketClient..WSOptionsGenerator_new"></a>

#### new WSOptionsGenerator()
Class representing a generator for WebSocket options.

**Example**  
```javascript
const options = new WSOptionsGenerator({ host: 'api.example.com', port: 443, protocol: 'wss' });
```
<a name="new_module_WebSocketClient..WSOptionsGenerator_new"></a>

#### new WSOptionsGenerator(options)
Create a WebSocket options generator.

**Returns**: <code>object</code> - The WebSocket options.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options object. (default: {}) |
| options.host | <code>string</code> | The host name. (default: '') |
| options.port | <code>number</code> | The port number. (default: 443) |
| options.protocol | <code>string</code> | The protocol. (default: 'wss') |
| options.timeoutDuration | <code>number</code> | The timeout duration. (default: 10000) |
| options.baseURL | <code>string</code> | The base URL. (default: '') |
| options.authenticator | <code>string</code> | The authenticator. (default: '') |
| options.headers | <code>string</code> | The headers. (default: {}) |
| options.sessionId | <code>string</code> | The session id. (default: '') |
| options.tags | <code>string</code> | The tags. (default: { sessionId: '' }) |

**Example**  
```javascript
const options = new WSOptionsGenerator({ host: 'api.example.com', port: 443, protocol: 'wss' });
```
<a name="module_WebSocketClient..WSOptionsGenerator"></a>

### WebSocketClient~WSOptionsGenerator
**Kind**: inner class of [<code>WebSocketClient</code>](#module_WebSocketClient)  

* [~WSOptionsGenerator](#module_WebSocketClient..WSOptionsGenerator)
    * [new WSOptionsGenerator()](#new_module_WebSocketClient..WSOptionsGenerator_new)
    * [new WSOptionsGenerator(options)](#new_module_WebSocketClient..WSOptionsGenerator_new)

<a name="new_module_WebSocketClient..WSOptionsGenerator_new"></a>

#### new WSOptionsGenerator()
Class representing a generator for WebSocket options.

**Example**  
```javascript
const options = new WSOptionsGenerator({ host: 'api.example.com', port: 443, protocol: 'wss' });
```
<a name="new_module_WebSocketClient..WSOptionsGenerator_new"></a>

#### new WSOptionsGenerator(options)
Create a WebSocket options generator.

**Returns**: <code>object</code> - The WebSocket options.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options object. (default: {}) |
| options.host | <code>string</code> | The host name. (default: '') |
| options.port | <code>number</code> | The port number. (default: 443) |
| options.protocol | <code>string</code> | The protocol. (default: 'wss') |
| options.timeoutDuration | <code>number</code> | The timeout duration. (default: 10000) |
| options.baseURL | <code>string</code> | The base URL. (default: '') |
| options.authenticator | <code>string</code> | The authenticator. (default: '') |
| options.headers | <code>string</code> | The headers. (default: {}) |
| options.sessionId | <code>string</code> | The session id. (default: '') |
| options.tags | <code>string</code> | The tags. (default: { sessionId: '' }) |

**Example**  
```javascript
const options = new WSOptionsGenerator({ host: 'api.example.com', port: 443, protocol: 'wss' });
```
<a name="module_WebSocketClient..WebSocketClient"></a>

### WebSocketClient~WebSocketClient
**Kind**: inner class of [<code>WebSocketClient</code>](#module_WebSocketClient)  

* [~WebSocketClient](#module_WebSocketClient..WebSocketClient)
    * [new WebSocketClient()](#new_module_WebSocketClient..WebSocketClient_new)
    * [.addEventListener(event, handler)](#module_WebSocketClient..WebSocketClient+addEventListener)
    * [.close(code, reason)](#module_WebSocketClient..WebSocketClient+close)
    * [.send(message)](#module_WebSocketClient..WebSocketClient+send)
    * [.startTimeout()](#module_WebSocketClient..WebSocketClient+startTimeout)
    * [.clTimeout()](#module_WebSocketClient..WebSocketClient+clTimeout)
    * [.signalRhubHandshake(protocol, version)](#module_WebSocketClient..WebSocketClient+signalRhubHandshake)
    * [.onSignalROpen()](#module_WebSocketClient..WebSocketClient+onSignalROpen)
    * [.onClose(message)](#module_WebSocketClient..WebSocketClient+onClose)
    * [.onError(message)](#module_WebSocketClient..WebSocketClient+onError)
    * [.setupSignalREventListeners()](#module_WebSocketClient..WebSocketClient+setupSignalREventListeners)
    * [.tearDown()](#module_WebSocketClient..WebSocketClient+tearDown)

<a name="new_module_WebSocketClient..WebSocketClient_new"></a>

#### new WebSocketClient()
Class representing a WebSocket client.

**Example**  
```javascript
const options = { host: 'api.example.com', port: 443, protocol: 'wss' };
const wsClient = new WebSocketClient(options);
socket.onopen = () => {
 console.log('connected');
 socket.send('Hello, Server!');
};
socket.onmessage = (e) => console.log(e.data);
socket.onclose = () => console.log('disconnected');
```
<a name="module_WebSocketClient..WebSocketClient+addEventListener"></a>

#### webSocketClient.addEventListener(event, handler)
Add an event listener.

**Kind**: instance method of [<code>WebSocketClient</code>](#module_WebSocketClient..WebSocketClient)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| event | <code>string</code> | <code>&quot;message&quot;</code> | The event name. |
| handler | <code>function</code> |  | The event handler. |

**Example**  
```javascript
socket.addEventListener('message', (event) => console.log(event.data));
```
<a name="module_WebSocketClient..WebSocketClient+close"></a>

#### webSocketClient.close(code, reason)
Close the WebSocket connection.

**Kind**: instance method of [<code>WebSocketClient</code>](#module_WebSocketClient..WebSocketClient)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| code | <code>number</code> | <code>1000</code> | The close code. (default: 1000) |
| reason | <code>string</code> | <code>&quot;Normal Closure&quot;</code> | The close reason. (default: 'Normal Closure') |

**Example**  
```javascript
socket.close(1000, 'Normal Closure');
```
<a name="module_WebSocketClient..WebSocketClient+send"></a>

#### webSocketClient.send(message)
Send a message.

**Kind**: instance method of [<code>WebSocketClient</code>](#module_WebSocketClient..WebSocketClient)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | The message object. (default: {}) |

**Example**  
```javascript
socket.send({ message: 'Hello, Server!' });
```
<a name="module_WebSocketClient..WebSocketClient+startTimeout"></a>

#### webSocketClient.startTimeout()
Start the timeout.

**Kind**: instance method of [<code>WebSocketClient</code>](#module_WebSocketClient..WebSocketClient)  
**Example**  
```javascript
socket.startTimeout();
```
<a name="module_WebSocketClient..WebSocketClient+clTimeout"></a>

#### webSocketClient.clTimeout()
Clear the timeout.

**Kind**: instance method of [<code>WebSocketClient</code>](#module_WebSocketClient..WebSocketClient)  
**Example**  
```javascript
socket.clTimeout();
```
<a name="module_WebSocketClient..WebSocketClient+signalRhubHandshake"></a>

#### webSocketClient.signalRhubHandshake(protocol, version)
Perform the WebSocket handshake for signalR hub connection.

**Kind**: instance method of [<code>WebSocketClient</code>](#module_WebSocketClient..WebSocketClient)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| protocol | <code>string</code> | <code>&quot;json&quot;</code> | The protocol. (default: 'json') |
| version | <code>number</code> | <code>1</code> | The version. (default: 1) |

<a name="module_WebSocketClient..WebSocketClient+onSignalROpen"></a>

#### webSocketClient.onSignalROpen()
Handle the WebSocket connection open event for signalR hub connection.

**Kind**: instance method of [<code>WebSocketClient</code>](#module_WebSocketClient..WebSocketClient)  
**Example**  
```javascript
socket.onSignalROpen();
```
<a name="module_WebSocketClient..WebSocketClient+onClose"></a>

#### webSocketClient.onClose(message)
Handle the WebSocket connection close event.

**Kind**: instance method of [<code>WebSocketClient</code>](#module_WebSocketClient..WebSocketClient)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | The close message. (default: {}) |

**Example**  
```javascript
socket.onClose();
```
<a name="module_WebSocketClient..WebSocketClient+onError"></a>

#### webSocketClient.onError(message)
Handle the WebSocket connection error event.

**Kind**: instance method of [<code>WebSocketClient</code>](#module_WebSocketClient..WebSocketClient)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | The error message. (default: {}) |

**Example**  
```javascript
socket.onError();
```
<a name="module_WebSocketClient..WebSocketClient+setupSignalREventListeners"></a>

#### webSocketClient.setupSignalREventListeners()
Set up the WebSocket event listeners for signalR hub connection.

**Kind**: instance method of [<code>WebSocketClient</code>](#module_WebSocketClient..WebSocketClient)  
**Example**  
```javascript
socket.setupSignalREventListeners();
```
<a name="module_WebSocketClient..WebSocketClient+tearDown"></a>

#### webSocketClient.tearDown()
Tear down the WebSocket event listeners.

**Kind**: instance method of [<code>WebSocketClient</code>](#module_WebSocketClient..WebSocketClient)  
**Example**  
```javascript
socket.tearDown();
```
