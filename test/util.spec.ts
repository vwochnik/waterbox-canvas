import {
  BaseOptions,
  OptionAccessors,
  Optionality,
  createOptionAccessors,
} from '../src/waterbox/util';

interface Options extends BaseOptions {
  num: number;
  str: string;
  opt?: boolean;
  validated?: string;
}

const optionality: Optionality<Options> = {
  num: false,
  str: false,
  opt: true,
  validated: true,
};

interface Test extends OptionAccessors<Options, Test> {}

describe('util', () => {
  describe('OptionAccessors', () => {
    let updated: jest.Mock<any, any, any>;
    let inst: Test;

    beforeEach(() => {
      updated = jest.fn();
      inst = createOptionAccessors<Options, Test>(
        {} as Test,
        optionality,
        { num: 5, str: 'hello', opt: undefined, validated: undefined },
        updated,
        {
          num: (value: number) => {
            if (value < 0) throw new Error('num must be non-negative');
            return value;
          },
          validated: (value?: string) => (value ? `__${value}__` : undefined),
        },
      );
    });

    it('has all accessor methods', () => {
      expect(typeof inst.num).toEqual('function');
      expect(typeof inst.str).toEqual('function');
      expect(typeof inst.opt).toEqual('function');
      expect(typeof inst.options).toEqual('function');
    });

    it('can get and set options', () => {
      expect(updated).toHaveBeenLastCalledWith(['num', 'str', 'opt', 'validated'], {
        num: 5,
        str: 'hello',
      });
      expect(inst.num()).toEqual(5);
      expect(inst.str()).toEqual('hello');
      expect(inst.num(4)).toBe(inst);
      expect(inst.num()).toEqual(4);
      expect(updated).toHaveBeenLastCalledWith(['num'], { num: 4, str: 'hello' });
      expect(inst.options({ num: 3, str: 'test' })).toBe(inst);
      expect(inst.num()).toEqual(3);
      expect(inst.str()).toEqual('test');
      expect(inst.options()).toEqual({ num: 3, str: 'test' });
      expect(updated).toHaveBeenLastCalledWith(['num', 'str'], { num: 3, str: 'test' });
      expect(updated).toHaveBeenCalledTimes(3);
    });

    it('can get and set optional options', () => {
      expect(inst.opt()).toBeUndefined();
      expect(inst.opt(true)).toBe(inst);
      expect(inst.opt()).toEqual(true);
      expect(updated).toHaveBeenLastCalledWith(['opt'], { num: 5, str: 'hello', opt: true });
      expect(inst.opt(undefined)).toBe(inst);
      expect(inst.opt()).toBeUndefined();
      expect(updated).toHaveBeenLastCalledWith(['opt'], { num: 5, str: 'hello' });
      expect(inst.options({ opt: false })).toBe(inst);
      expect(inst.opt()).toEqual(false);
      expect(updated).toHaveBeenLastCalledWith(['opt'], { num: 5, str: 'hello', opt: false });
      expect(inst.options({ opt: undefined })).toBe(inst);
      expect(inst.opt()).toBeUndefined();
      expect(updated).toHaveBeenLastCalledWith(['opt'], { num: 5, str: 'hello' });
      expect(updated).toHaveBeenCalledTimes(5);
    });

    it('Can not set required options to undefined', () => {
      try {
        inst.num(undefined as unknown as number);
        throw new Error('should have thrown');
      } catch (e: unknown) {
        expect((e as Error).message).toEqual('Invalid num: Required option cannot be undefined');
      }
    });

    it('can validate options', () => {
      expect(inst.validated()).toBeUndefined();
      expect(inst.validated('test')).toBe(inst);
      expect(inst.validated()).toEqual('__test__');
      expect(updated).toHaveBeenLastCalledWith(['validated'], {
        num: 5,
        str: 'hello',
        validated: '__test__',
      });

      expect(inst.options({ validated: 'hello' })).toBe(inst);
      expect(inst.validated()).toEqual('__hello__');
      expect(updated).toHaveBeenLastCalledWith(['validated'], {
        num: 5,
        str: 'hello',
        validated: '__hello__',
      });
      try {
        inst.num(-1);
        throw new Error('should have thrown');
      } catch (e: unknown) {
        expect((e as Error).message).toEqual('Invalid num: num must be non-negative');
      }
      expect(updated).toHaveBeenCalledTimes(3);
    });
  });
});
