import merge from "mergerino";
import o from "ospec";

export interface State {
    items: Record<string, {}>;
    ol: null;
    s: string;
    sn: string | null;
    so?: string;
}

function init(): State {
    return {
        items: {},
        ol: null,
        s: "foo",
        sn: "bar",
        so: "baz",
    };
}

o.spec("top level", () => {
    const state = init();

    o("string", () => {
        const patched = merge(state, {
            s: "FOO",
        });
        o(patched).deepEquals({
            items: {},
            ol: null,
            s: "FOO",
            sn: "bar",
            so: "baz",
        });
    });

    o("string to null", () => {
        const patched = merge(state, {
            sn: null,
        });
        o(patched).deepEquals<State>({
            items: {},
            ol: null,
            s: "foo",
            sn: null,
            so: "baz",
        });
    });

    o("string - function", () => {
        const patched = merge(state, {
            s: (s) => s + s,
        });
        o(patched).deepEquals({
            items: {},
            ol: null,
            s: "foofoo",
            sn: "bar",
            so: "baz",
        });
    });

    o("string to null - function", () => {
        const patched = merge(state, {
            sn: () => null,
        });
        o(patched).deepEquals<State>({
            items: {},
            ol: null,
            s: "foo",
            sn: null,
            so: "baz",
        });
    });

    o("string - delete", () => {
        const patched = merge(state, {
            so: undefined,
        });
        o(patched).deepEquals({
            items: {},
            ol: null,
            s: "foo",
            sn: "bar",
        });
    });

    o("string - undefined assign - function", () => {
        const patched = merge(state, {
            so: () => undefined,
        });
        o(patched).deepEquals({
            items: {},
            ol: null,
            s: "foo",
            sn: "bar",
            so: undefined,
        });
    });
});
