# Mergerino - TypeScript type definition

TypeScript type definition for [Megerino 0.4.0](https://github.com/fuzetsu/mergerino).

## Installation

Typing is located in `typings/mergerino/index.d.ts`.  
You need to copy this file to your typings directoy:

```
typings
|- Mergerino
   |- index.d.ts
```

## Test

Run:

```
npm install
npm start
```

It perfroms syntax test using **tslint** and unit tests using **ospec**.

## Example usage

See ```test``` directory and ```definitely_typed/mergerino-tests.ts``` file for more examples.

```typescript
import merge from "mergerino";

interface State {
    foo: boolean;
    bar?: string;
    baz: number;
    nested: {
        prop: number
    },
    arr: { prop: string }[]
}

const state: State = {
    foo: true,
    bar: "bar",
    baz: 0,
    nested: {
        prop: 42
    },
    arr: [{
        prop: "old"
    }]
}

const newState = merge(state, {
    // foo - not changed
    bar: undefined // delete,
    baz: 100, // replace
    nested: { // nested update
        prop: (v) => v * 10, // function update
    },
    arr: {
        0: { prop: "new" }, // edit item
        1: { prop: "insert" } // insert item
    }
});

/**
 * newState:
 * {
 *     foo: true,
 *     // bar - not exists
 *     baz: 100,
 *     nested: {
 *         prop: 420
 *     },
 *     arr: [
 *         { prop: "new" },
 *         { prop: "insert" }
 *     ]
 * }
 */
```

## Known issues

1. Possible add non-exists property when patch array of objects  
(when you patch nested (in any depth) object then it isn't occurs).

```typescript
import merge from "mergerino";

interface State {
    arr: Array<{
        prop: boolean,
    }>;
}
const state: State = { arr: [{ prop: true }] };
const newState = merge(state, {
    arr: {
        0: {
            prop: false,
            nonExists: 42 // It should be marked as error
        }
    }
});
```

2. Possible delete requied property.  
   It is consequence of Mergerino design.

```typescript
import merge from "mergerino";

interface State {
    prop: string
}

const state: State = { prop: "required" }
const newState = merge(state, {
    prop: undefined // It isn''t marked as error
});
```