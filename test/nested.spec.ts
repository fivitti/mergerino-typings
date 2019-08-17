import merge from "mergerino";
import o from "ospec";

interface State {
    nested: {
        nested: {
            nested?: {
                erty?: number,
                prop: string,
            },
            prop: string,
        },
        prop: string,
    };
    prop: string;
}

function init(): State {
    return {
        nested: {
            nested: {
                nested: {
                    erty: 42,
                    prop: "foo",
                },
                prop: "foo",
            },
            prop: "foo",
        },
        prop: "foo",
    };
}

o.spec("nested", () => {
    const state = init();
    o("add", () => {
        const patched = merge(state, {
            nested: {
                nested: {
                    nested: {
                        erty: 24,
                    },
                },
            },
        });
        o(patched).deepEquals({
            nested: {
                nested: {
                    nested: {
                        erty: 24,
                        prop: "foo",
                    },
                    prop: "foo",
                },
                prop: "foo",
            },
            prop: "foo",
        });
    });

    o("edit", () => {
        const patched = merge(state, {
            nested: {
                nested: {
                    prop: "bar",
                },
            },
        });

        o(patched).deepEquals({
            nested: {
                nested: {
                    nested: {
                        erty: 42,
                        prop: "foo",
                    },
                    prop: "bar",
                },
                prop: "foo",
            },
            prop: "foo",
        });
    });

    o("edit - function", () => {
        const patched = merge(state, {
            nested: {
                nested: {
                    nested: (n) => ({
                        erty: n != null && n.erty != null ? n.erty * 2 : 0,
                        prop: "bar",
                    }),
                    prop: (v) => v.length.toString(),
                },
            },
        });

        o(patched).deepEquals({
            nested: {
                nested: {
                    nested: {
                        erty: 84,
                        prop: "bar",
                    },
                    prop: "3",
                },
                prop: "foo",
            },
            prop: "foo",
        });
    });

    o("delete", () => {
        const patched = merge(state, {
            nested: {
                nested: {
                    nested: undefined,
                },
            },
        });
        o(patched).deepEquals({
            nested: {
                nested: {
                    prop: "foo",
                },
                prop: "foo",
            },
            prop: "foo",
        });
    });

    // It shouldn't be allowed
    o("delete - non-optional node", () => {
        const patched = merge(state, {
            nested: undefined,
            prop: undefined,
        });
        o(patched).deepEquals({ });
    });
});
