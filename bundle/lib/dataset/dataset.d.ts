export interface DataSet<T> {
    count: number;
    items: Array<T>;
    next?: string;
    previous?: string;
}
