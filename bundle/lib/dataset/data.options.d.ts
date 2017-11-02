import { DataAvailability } from "./data-availability.enum";
export interface DataOptions {
    allowCache?: boolean;
    availability?: DataAvailability;
}
export declare const defaultDataOptions: DataOptions;
