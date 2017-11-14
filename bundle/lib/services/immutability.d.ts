export declare class Immutability {
    /**
     * Deep-freezes an object
     * @param {T} obj The object to freeze
     * @param {Set<any>} excluded For internal use, used to avoid infinite recursion, when a parent object is references in one of its children
     * @returns {Readonly<T>}
     */
    static freeze<T>(obj: T, excluded?: Set<any>): Readonly<T>;
    static unfreeze<T>(obj: Readonly<T>): T;
}
