export declare class Immutability {
    static freeze<T>(obj: T): Readonly<T>;
    static unfreeze<T>(obj: Readonly<T>): T;
}
