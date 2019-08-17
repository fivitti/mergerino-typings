import merge from "mergerino";
import o from "ospec";

interface State {
    arr?: number[];
    arrObj?: null | Array<{
        prop: string
        erty?: number,
    }>;
    prop: string;
}

function init(): State {
    return {
        arr: [0, 1, 2, 3, 4, 5],
        arrObj: [{
            prop: "0",
        }, {
            prop: "1",
        }],
        prop: "foo",
    };
}

o.spec("property arrays", () => {
    const state = init();

    o.spec("primitive", () => {
        o("reassign", () => {
            const patched = merge(state, {
                arr: [7, 8, 9],
            });
            o(patched).deepEquals<State>({
                arr: [7, 8, 9],
                arrObj: [{
                    prop: "0",
                }, {
                    prop: "1",
                }],
                prop: "foo",
            });
        });

        o("append", () => {
            const patched = merge(state, {
                arr: {
                    6: 6,
                    7: 7,
                    8: 8,
                },
            });
            o(patched).deepEquals<State>({
                arr: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                arrObj: [{
                    prop: "0",
                }, {
                    prop: "1",
                }],
                prop: "foo",
            });
        });

        o("edit", () => {
            const patched = merge(state, {
                arr: {
                    1: 11,
                    4: 44,
                },
            });
            o(patched).deepEquals<State>({
                arr: [0, 11, 2, 3, 44, 5],
                arrObj: [{
                    prop: "0",
                }, {
                    prop: "1",
                }],
                prop: "foo",
            });
        });

        o("delete", () => {
            const patched = merge(state, {
                arr: undefined,
            });
            o(patched).deepEquals<State>({
                arrObj: [{
                    prop: "0",
                }, {
                    prop: "1",
                }],
                prop: "foo",
            });
        });

        o("delete - entry", () => {
            const patched = merge(state, {
                arr: {
                    4: undefined,
                },
            });
            o(patched).deepEquals<State>({
                arr: [0, 1, 2, 3, 5],
                arrObj: [{
                    prop: "0",
                }, {
                    prop: "1",
                }],
                prop: "foo",
            });
            o((patched.arr as number[]).length).equals(5);
        });
    });

    o.spec("objects", () => {
        o("reassign", () => {
            const patched = merge(state, {
                arrObj: [{
                    prop: "5",
                }, {
                    prop: "6",
                }],
            });
            o(patched).deepEquals<State>({
                arr: [0, 1, 2, 3, 4, 5],
                arrObj: [{
                    prop: "5",
                }, {
                    prop: "6",
                }],
                prop: "foo",
            });
        });

        o("append", () => {
            const patched = merge(state, {
                arrObj: {
                    2: {
                        prop: "2",
                    },
                    3: {
                        nonExistsProperty: 1,    // It shouldn't be allowed
                        prop: "3",
                    },
                },
            });
            o(patched).deepEquals<State>({
                arr: [0, 1, 2, 3, 4, 5],
                arrObj: [{
                    prop: "0",
                }, {
                    prop: "1",
                }, {
                    prop: "2",
                }, {
                    // @ts-ignore
                    nonExistsProperty: 1,
                    prop: "3",
                }],
                prop: "foo",
            });
        });

        o("edit", () => {
            const patched = merge(state, {
                arrObj: {
                    1: {
                        prop: "BAR",
                    },
                },
            });
            o(patched).deepEquals<State>({
                arr: [0, 1, 2, 3, 4, 5],
                arrObj: [{
                    prop: "0",
                }, {
                    prop: "BAR",
                }],
                prop: "foo",
            });
        });

        o("delete", () => {
            const patched = merge(state, {
                arrObj: undefined,
            });
            o(patched).deepEquals<State>({
                arr: [0, 1, 2, 3, 4, 5],
                prop: "foo",
            });
        });

        o("delete - entry", () => {
            const patched = merge(state, {
                arrObj: {
                    0: undefined,
                },
            });
            o(patched).deepEquals<State>({
                arr: [0, 1, 2, 3, 4, 5],
                arrObj: [{
                    prop: "1",
                }],
                prop: "foo",
            });
            o((patched.arrObj as []).length).equals(1);
        });
    });
});
