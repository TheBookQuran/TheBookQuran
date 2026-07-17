import { describe, it, expect } from 'vitest';
import { snakeToCamel, camelToSnake, camelizeKeys, decamelizeKeys } from './case-utils';

describe('case-utils', () => {
  describe('snakeToCamel', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamel('hello_world')).toBe('helloWorld');
      expect(snakeToCamel('hello-world')).toBe('helloWorld');
      expect(snakeToCamel('some_longer_variable_name')).toBe('someLongerVariableName');
    });

    it('should handle single words or already camelCase words', () => {
      expect(snakeToCamel('hello')).toBe('hello');
      expect(snakeToCamel('helloWorld')).toBe('helloWorld');
    });
  });

  describe('camelToSnake', () => {
    it('should convert camelCase to snake_case', () => {
      expect(camelToSnake('helloWorld')).toBe('hello_world');
      expect(camelToSnake('someLongerVariableName')).toBe('some_longer_variable_name');
    });

    it('should handle single lowercase words', () => {
      expect(camelToSnake('hello')).toBe('hello');
    });
  });

  describe('camelizeKeys', () => {
    it('should camelize keys of a simple object', () => {
      const input = { hello_world: 1, foo_bar: 'baz' };
      const expected = { helloWorld: 1, fooBar: 'baz' };
      expect(camelizeKeys(input)).toEqual(expected);
    });

    it('should camelize keys of a nested object', () => {
      const input = {
        user_info: {
          first_name: 'John',
          last_name: 'Doe',
        },
        active_status: true,
      };
      const expected = {
        userInfo: {
          firstName: 'John',
          lastName: 'Doe',
        },
        activeStatus: true,
      };
      expect(camelizeKeys(input)).toEqual(expected);
    });

    it('should camelize keys of objects inside arrays', () => {
      const input = [
        { item_id: 1, item_name: 'A' },
        { item_id: 2, item_name: 'B' },
      ];
      const expected = [
        { itemId: 1, itemName: 'A' },
        { itemId: 2, itemName: 'B' },
      ];
      expect(camelizeKeys(input)).toEqual(expected);
    });

    it('should return primitive values unchanged', () => {
      expect(camelizeKeys(5)).toBe(5);
      expect(camelizeKeys('string')).toBe('string');
      expect(camelizeKeys(null)).toBeNull();
    });
  });

  describe('decamelizeKeys', () => {
    it('should decamelize keys of a simple object', () => {
      const input = { helloWorld: 1, fooBar: 'baz' };
      const expected = { hello_world: 1, foo_bar: 'baz' };
      expect(decamelizeKeys(input)).toEqual(expected);
    });

    it('should decamelize keys of a nested object', () => {
      const input = {
        userInfo: {
          firstName: 'John',
          lastName: 'Doe',
        },
        activeStatus: true,
      };
      const expected = {
        user_info: {
          first_name: 'John',
          last_name: 'Doe',
        },
        active_status: true,
      };
      expect(decamelizeKeys(input)).toEqual(expected);
    });

    it('should decamelize keys of objects inside arrays', () => {
      const input = [
        { itemId: 1, itemName: 'A' },
        { itemId: 2, itemName: 'B' },
      ];
      const expected = [
        { item_id: 1, item_name: 'A' },
        { item_id: 2, item_name: 'B' },
      ];
      expect(decamelizeKeys(input)).toEqual(expected);
    });

    it('should return primitive values unchanged', () => {
      expect(decamelizeKeys(5)).toBe(5);
      expect(decamelizeKeys('string')).toBe('string');
      expect(decamelizeKeys(null)).toBeNull();
    });
  });
});
