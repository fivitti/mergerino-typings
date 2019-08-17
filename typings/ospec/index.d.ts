declare module 'ospec' {
    class Assert {
        deepEquals<T>(obj: T): void;
        equals<T>(obj: T): void;
        notEquals<T>(obj: T): void;
    }

    interface o {
        (description: string, unitTest: () => void): void;
        spec(description: string, unitTests: () => void): void;
        (val: any): Assert;
        before(action: (done: () => void) => void): void;
        after(action: (done: () => void) => void): void;
        beforeEach(action: (done: () => void) => void): void;
        afterEach(action: (done: () => void) => void): void;
    }

    const main: o;
    export default main;
}