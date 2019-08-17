import merge from "mergerino";
import o from "ospec";

o.spec("mergerino", () => {
  o("deleting works", () => {
    interface State {
      prop: boolean;
      other: boolean | null;
      deep: {
        prop?: string,
      };
      fake?: any;
    }

    const state: State = { prop: true, other: true, deep: { prop: "foo" } };
    const newState = merge(state, {
      deep: { prop: undefined },
      fake: undefined, // deleting non existent key
      other: null,
      prop: undefined,
    });
    o(newState).deepEquals({ other: null, deep: {} });
    o(state).deepEquals({ prop: true, other: true, deep: { prop: "foo" } });
  });
  o("function sub works", () => {
    interface State {
      age: number;
      name: string;
      obj: {
        prop?: boolean,
        replaced?: boolean,
      };
    }
    const state: State = { age: 10, name: "bob", obj: { prop: true } };
    const newState = merge(state, {
      age: (x) => x * 10,
      name: (x, m) => {
        o(m).equals(merge); // verify that merge is passed as second arg
        return x;
      },
      obj: () => ({ replaced: true }),
    });
    o(newState).deepEquals({ age: 100, name: "bob", obj: { replaced: true } });
    o(state).deepEquals({ age: 10, name: "bob", obj: { prop: true } });
  });
  o("deep function sub to uncreated object path", () => {
    interface State {
      orig: boolean;
      add?: {
        stats: {
          count: number,
        },
      };
    }
    const state: State = { orig: true };
    const newState = merge(state, {
      add: { stats: { count: (x) => (x == null ? 1 : x + 1) } },
    });
    o(newState).deepEquals({ orig: true, add: { stats: { count: 1 } } });
    o(state).deepEquals({ orig: true });
  });
  o("add nested object", () => {
    interface State {
      age: number;
      add?: {
        sub: boolean,
      };
    }
    const state: State = { age: 10 };
    const add = { sub: true };
    const newState = merge(state, { add });
    o(newState).deepEquals({ age: 10, add: { sub: true } });
    o(newState.add).notEquals(add);
    o(newState).notEquals(state);
  });
  o("deep merge objects", () => {
    interface State {
      age: number;
      sub: {
        sub: {
          newProp?: boolean,
          prop: boolean,
        },
      };
    }
    const state: State = { age: 10, sub: { sub: { prop: true } } };
    const newState = merge(state, { sub: { sub: { newProp: true } } });
    o(state).deepEquals({ age: 10, sub: { sub: { prop: true } } });
    o(newState).deepEquals({ age: 10, sub: { sub: { prop: true, newProp: true } } });
    o(newState).notEquals(state);
    o(newState.sub).notEquals(state.sub);
    o(newState.sub.sub).notEquals(state.sub.sub);
  });
  o("function patch", () => {
    interface State {
      age: number;
      foo: string;
      prop?: boolean;
    }
    const state: State = { age: 10, foo: "bar" };
    const newState = merge(state, (s, m) => {
      o(s).notEquals(state);
      o(s).deepEquals(state);
      return merge(s, { prop: true });
    });
    o(newState).deepEquals({ age: 10, foo: "bar", prop: true });
  });
  o("multi/array/falsy patches", () => {
    interface State {
      age?: number;
      arr?: number[];
      baz?: number;
      foo: string;
      hello?: boolean;
      prop?: boolean;
    }
    const state: State = { foo: "bar" };
    const newState = merge(
      state,
      { baz: 5 },
      { hello: false },
      [{ arr: [1, 2, 3] }, [[{ prop: true }]], false, null],
      undefined,
      "",
      0,
      null,
      (s, m) => m(s, { age: 10 }),
      [[[[[[[{ age: (x) => (x as number) * 3 }]]]]]]],
    );
    o(newState).notEquals(state);
    o(state).deepEquals({ foo: "bar" });
    o(newState).deepEquals({
      age: 30,
      arr: [1, 2, 3],
      baz: 5,
      foo: "bar",
      hello: false,
      prop: true,
    });
  });
  o("array patches", () => {
    const arr = [1, 2, 3];
    const newArr = merge(arr, { 2: 100 }, { 0: undefined }, { 0: 200 });
    o(newArr).notEquals(arr);
    o(newArr).deepEquals([200, 100]);
    o(arr).deepEquals([1, 2, 3]);
  });
  o("deep merge with arr", () => {
    interface State {
      foo: string;
      deep: {
        arr: number[],
        prop: boolean,
      };
    }
    const state: State = { foo: "bar", deep: { arr: [1, 2, 3], prop: false } };
    const newState = merge(state, { deep: { arr: { 1: 20 } } });
    o(newState.deep).notEquals(state.deep);
    o(newState.deep.arr).notEquals(state.deep.arr);
    o(newState.deep.arr).deepEquals([1, 20, 3]);
    o(state.deep.arr).deepEquals([1, 2, 3]);
  });
  o("top level SUB", () => {
    type State = {
      age: number,
      foo: string,

    } | { replaced: boolean };
    const state = { age: 20, foo: "bar" };
    const replacement = { replaced: true };
    const newState = merge<State>(state, () => replacement);
    o(newState).notEquals(state);
    o(newState).equals(replacement);
  });
  o("reuse object if same ref when patching", () => {
    const state = { deep: { prop: true } };
    const newState = merge(state, { deep: state.deep });
    o(newState).notEquals(state); // TODO: maybe try and be smarter, to avoid copy if patch changes nothing
    o(newState.deep).equals(state.deep);
  });
  o("multi function patch, only copy once", () => {
    const copies: Array<{}> = [];
    merge({ key: "value" }, Array.from({ length: 5 }, () => (state) => (copies.push(state), state)));
    o(copies.length).equals(5);
    o(typeof copies[0]).equals("object");
    copies.every((copy) => o(copy).equals(copies[0]));
  });
  o("does not throw error for falsy source", () => {
    const newState = merge(0 as any, { foo: "bar" }); // Falsy as source isn't supported by typing
    o(newState).deepEquals({ foo: "bar" });
  });
  o("replace primitive with object and vice versa", () => {
    interface State {
      count: number | {
        prop: boolean,
      };
      foo: number | {
        prop: boolean,
      };
    }
    const state: State = { count: 10, foo: { prop: true } };
    const newState = merge(state, { count: { prop: true }, foo: 10 });
    o(state).deepEquals({ count: 10, foo: { prop: true } });
    o(newState).deepEquals({ count: { prop: true }, foo: 10 });
  });
});
