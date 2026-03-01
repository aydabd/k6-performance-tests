import { describe, it, expect } from 'vitest';
import { PathFormatter, Formatter } from '../../src/clients/path-formatter.js';

describe('PathFormatter', () => {
    describe('toSnakeCase', () => {
        it('converts hyphens to underscores and lowercases', () => {
            expect(PathFormatter.toSnakeCase('foo-bar')).toBe('foo_bar');
        });

        it('lowercases uppercase string', () => {
            expect(PathFormatter.toSnakeCase('FOO_BAR')).toBe('foo_bar');
        });

        it('leaves already snake_case unchanged (lowercase)', () => {
            expect(PathFormatter.toSnakeCase('foo_bar')).toBe('foo_bar');
        });
    });

    describe('toKebabCase', () => {
        it('converts underscores to hyphens and lowercases', () => {
            expect(PathFormatter.toKebabCase('foo_bar')).toBe('foo-bar');
        });

        it('lowercases the string', () => {
            expect(PathFormatter.toKebabCase('FOO_BAR')).toBe('foo-bar');
        });
    });

    describe('toCamelCase', () => {
        it('converts underscore-separated words to camelCase', () => {
            expect(PathFormatter.toCamelCase('foo_bar')).toBe('fooBar');
        });

        it('converts hyphen-separated words to camelCase', () => {
            expect(PathFormatter.toCamelCase('foo-bar')).toBe('fooBar');
        });

        it('handles single word unchanged', () => {
            expect(PathFormatter.toCamelCase('foo')).toBe('foo');
        });
    });

    describe('toPascalCase', () => {
        it('converts underscore-separated words to PascalCase', () => {
            expect(PathFormatter.toPascalCase('foo_bar')).toBe('FooBar');
        });

        it('capitalizes single word', () => {
            expect(PathFormatter.toPascalCase('foo')).toBe('Foo');
        });
    });

    describe('toDotNotation', () => {
        it('replaces underscores with dots', () => {
            expect(PathFormatter.toDotNotation('foo_bar')).toBe('foo.bar');
        });
    });

    describe('toLowerCase', () => {
        it('removes underscores and lowercases', () => {
            expect(PathFormatter.toLowerCase('foo_bar')).toBe('foobar');
        });
    });

    describe('toUpperCase', () => {
        it('removes underscores and uppercases', () => {
            expect(PathFormatter.toUpperCase('foo_bar')).toBe('FOOBAR');
        });
    });
});

describe('Formatter.Type', () => {
    it('exposes KEBAB_CASE type', () => {
        expect(Formatter.Type.KEBAB_CASE).toBe('kebab-case');
    });

    it('exposes SNAKE_CASE type', () => {
        expect(Formatter.Type.SNAKE_CASE).toBe('sanke_case');
    });

    it('exposes CAMEL_CASE type', () => {
        expect(Formatter.Type.CAMEL_CASE).toBe('camelCase');
    });

    it('exposes PASCAL_CASE type', () => {
        expect(Formatter.Type.PASCAL_CASE).toBe('PascalCase');
    });
});
