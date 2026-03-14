import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseAuthConfig, buildAuthCode, createAuthLoaderAgent } from '../../src/agents/auth-loader.js';

const JWT_YAML = `auth:
  type: jwt
  loginUrl: https://auth.example.com/token
  username: admin
  password: secret
`;

const BASIC_YAML = `auth:
  type: basic
  username: user
  password: pass
`;

const BEARER_YAML = `auth:
  type: bearer
  token: mytoken
`;

const API_KEY_YAML = `auth:
  type: apiKey
  header: X-API-Key
  value: key123
`;

const OAUTH2_YAML = `auth:
  type: oauth2
  tokenUrl: https://auth.example.com/oauth/token
  clientId: client123
  clientSecret: secret456
`;

describe('parseAuthConfig - jwt', () => {
    it('returns type jwt', () => {
        const config = parseAuthConfig(JWT_YAML);
        expect(config.type).toBe('jwt');
    });

    it('includes jwt sub-config', () => {
        const config = parseAuthConfig(JWT_YAML);
        expect(config.jwt).toBeDefined();
        expect(config.jwt.loginUrl).toBe('https://auth.example.com/token');
    });
});

describe('parseAuthConfig - basic', () => {
    it('returns type basic', () => {
        expect(parseAuthConfig(BASIC_YAML).type).toBe('basic');
    });

    it('includes basic sub-config', () => {
        const config = parseAuthConfig(BASIC_YAML);
        expect(config.basic.username).toBe('user');
    });
});

describe('parseAuthConfig - bearer', () => {
    it('returns type bearer', () => {
        expect(parseAuthConfig(BEARER_YAML).type).toBe('bearer');
    });
});

describe('parseAuthConfig - apiKey', () => {
    it('returns type apiKey', () => {
        expect(parseAuthConfig(API_KEY_YAML).type).toBe('apiKey');
    });

    it('includes apiKey sub-config', () => {
        const config = parseAuthConfig(API_KEY_YAML);
        expect(config.apiKey.header).toBe('X-API-Key');
    });
});

describe('parseAuthConfig - oauth2', () => {
    it('returns type oauth2', () => {
        expect(parseAuthConfig(OAUTH2_YAML).type).toBe('oauth2');
    });

    it('includes oauth2 sub-config', () => {
        const config = parseAuthConfig(OAUTH2_YAML);
        expect(config.oauth2.clientId).toBe('client123');
    });
});

describe('parseAuthConfig - ENV_VAR resolution', () => {
    beforeEach(() => {
        process.env.TEST_JWT_SECRET = 'supersecret';
    });

    afterEach(() => {
        delete process.env.TEST_JWT_SECRET;
    });

    it('substitutes ${ENV_VAR} references from process.env', () => {
        const yaml = `auth:\n  type: jwt\n  secret: \${TEST_JWT_SECRET}\n`;
        const config = parseAuthConfig(yaml);
        expect(config.jwt.secret).toBe('supersecret');
    });

    it('leaves unresolved references intact when env var is absent', () => {
        const yaml = `auth:\n  type: jwt\n  secret: \${MISSING_VAR}\n`;
        const config = parseAuthConfig(yaml);
        expect(config.jwt.secret).toBe('${MISSING_VAR}');
    });
});

describe('parseAuthConfig - error cases', () => {
    it('throws Missing auth.type when type is absent', () => {
        expect(() => parseAuthConfig('auth:\n  username: x\n')).toThrow('Missing auth.type');
    });

    it('throws Unknown auth type for unsupported type', () => {
        expect(() => parseAuthConfig('auth:\n  type: saml\n')).toThrow('Unknown auth type: saml');
    });
});

describe('buildAuthCode', () => {
    it('returns a string containing new Authenticator', () => {
        const config = parseAuthConfig(JWT_YAML);
        const code = buildAuthCode(config);
        expect(code).toContain('new Authenticator(');
    });

    it('includes config keys', () => {
        const config = parseAuthConfig(JWT_YAML);
        const code = buildAuthCode(config);
        expect(code).toContain('loginUrl');
    });

    it('generates code for basic type', () => {
        const config = parseAuthConfig(BASIC_YAML);
        const code = buildAuthCode(config);
        expect(code).toContain('new Authenticator(');
        expect(code).toContain('username');
    });

    it('generates code for apiKey type', () => {
        const config = parseAuthConfig(API_KEY_YAML);
        const code = buildAuthCode(config);
        expect(code).toContain('new Authenticator(');
    });

    it('generates __ENV bracket access for unresolved env var references', () => {
        const yaml = `auth:\n  type: jwt\n  loginUrl: \${MISSING_VAR}\n`;
        const config = parseAuthConfig(yaml);
        const code = buildAuthCode(config);
        expect(code).toContain('__ENV["MISSING_VAR"]');
        expect(code).not.toContain('__ENV.MISSING_VAR');
    });

    it('uses JSON.stringify for regular string values (safe escaping)', () => {
        const config = parseAuthConfig(BASIC_YAML);
        const code = buildAuthCode(config);
        expect(code).toContain('"user"');
        expect(code).toContain('"pass"');
    });
});

describe('createAuthLoaderAgent', () => {
    it('returns ok output with authConfig and authCode', async () => {
        const agent = createAuthLoaderAgent();
        const output = await agent({
            type: 'ANALYZE',
            payload: { yaml: JWT_YAML },
            context: {},
        });
        expect(output.status).toBe('ok');
        expect(output.payload.authConfig.type).toBe('jwt');
        expect(typeof output.payload.authCode).toBe('string');
    });

    it('returns error for invalid yaml', async () => {
        const agent = createAuthLoaderAgent();
        const output = await agent({
            type: 'ANALYZE',
            payload: { yaml: 'auth:\n  username: x\n' },
            context: {},
        });
        expect(output.status).toBe('error');
    });
});
