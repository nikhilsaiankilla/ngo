export interface ServerActionResponse<T = unknown> {
    success: boolean;
    status: number;
    message: string;
    data?: T;
}