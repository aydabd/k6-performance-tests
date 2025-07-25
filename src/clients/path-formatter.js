/**
 * Class representing path formatting utilities.
 * @class PathFormatter
 */
class PathFormatter {
    /**
     * Convert a string with underscores to snake_case.
     * @param {string} str - The string to convert.
     * @returns {string} The snake_case string.
     * @example
     * PathFormatter.toSnakeCase('foo_bar'); // returns 'foo_bar'
     * PathFormatter.toSnakeCase('foo-bar'); // returns 'foo_bar'
     * PathFormatter.toSnakeCase('FOO_BAR'); // returns 'foo_bar'
     */
    static toSnakeCase(str) {
        return str.replace(/_/g, '_').toLowerCase();
    }

    /**
     * Convert a string with underscores separated words to kebab-case.
     * @param {string} str - The string to convert.
     * @returns {string} The kebab-case string.
     * @example
     * PathFormatter.toKebabCase('foo_bar'); // returns 'foo-bar'
     */
    static toKebabCase(str) {
        return str.replace(/_/g, '-').toLowerCase();
    }

    /**
     * Convert a string with underscores separated words to camelCase.
     * @param {string} str - The string to convert.
     * @returns {string} The camelCase string.
     * @example
     * PathFormatter.toCamelCase('foo_bar'); // returns 'fooBar'
     */
    static toCamelCase(str) {
        return str.replace(/([-_]\w)/g, match => match[1].toUpperCase());
    }

    /**
     * Convert a string with underscores separated words to PascalCase.
     * @param {string} str - The string to convert.
     * @returns {string} The PascalCase string.
     * @example
     * PathFormatter.toPascalCase('foo_bar'); // returns 'FooBar'
     */
    static toPascalCase(str) {
        return str.replace(/(^\w|[-_]\w)/g, match => match[match.length - 1].toUpperCase());
    }

    /**
     * Convert a string with underscores separated words to dot.notation.
     * @param {string} str - The string to convert.
     * @returns {string} The dot.notation string.
     * @example
     * PathFormatter.toDotNotation('foo_bar'); // returns 'foo.bar
     */
    static toDotNotation(str) {
        return str.replace(/_/g, '.');
    }

    /**
     * Convert a string to Dot.Notation.In.Capital.
     * @param {string} str - The string to convert.
     * @returns {string} The Dot.Notation.In.Capital string.
     */
    static toCapitalDotNotation(str) {
        return str.replace(/_/g, '.').replace(/(^\w|\. \w)/g, match => match.toUpperCase());
    }

    /**
     * Convert a string to constant case (SCREAMING_SNAKE_CASE).
     * @param {string} str - The string to convert.
     * @returns {string} The constant case string.
     */
    static toConstantCase(str) {
        return str.replace(/_/g, '_').toUpperCase();
    }

    /**
     * Convert a string with underscores separated words to non-separated words.
     * @param {string} str - The string to convert.
     * @returns {string} The lower case string.
     * @example
     * PathFormatter.toNonSeparated('foo_bar'); // returns 'foobar'
     */
    static toLowerCase(str) {
        return str.replace(/_/g, '').toLowerCase();
    }

    /**
     * Convert a string with underscores separated words to non-separated words.
     * @param {string} str - The string to convert.
     * @returns {string} The upper case string.
     * @example
     * PathFormatter.toNonSeparated('foo_bar'); // returns 'FOOBAR'
     */
    static toUpperCase(str) {
        return str.replace(/_/g, '').toUpperCase();
    }
}


/**
 * Class Formatter as defining enums for different types of formatters.
 * @class Formatter
 */
class Formatter {
    /**
     * Enum for different types of formatters.
     * @readonly
     * @enum {string} - The types of formatters.
     * @returns {object} The types of formatters.
     * @example
     * Formatter.Type.SNAKE_CASE; // returns 'snake_case'
     * Formatter.Type.KEBAB_CASE; // returns 'kebab-case'
     */
    static get Type() {
        return {
            SNAKE_CASE: 'sanke_case',
            KEBAB_CASE: 'kebab-case',
            CAMEL_CASE: 'camelCase',
            PASCAL_CASE: 'PascalCase',
            DOT_NOTATION: 'dot.notation',
            CAPITAL_DOT_NOTATION: 'Capital.Dot.Notation',
            SCREAMING_SNAKE_CASE: 'SCREAMING_SNAKE_CASE',
            LOWER_CASE: 'lowercase',
            UPPER_CASE: 'UPPERCASE'
        };
    }
}


export { PathFormatter, Formatter };
