import { ChildProcess } from "child_process";
import { Actions, Requests } from "./handler";

export type SuccessReply = {
    id: number;
    result: any;
};

export type ErrorReply = {
    id: number;
    error: string;
};

export type Reply = SuccessReply | ErrorReply;

export type RequestCallback<T, K extends Requests<T>> = {
    // @ts-ignore
    resolve: (result: ReturnType<T[K]>) => void;
    reject: (error: Error) => void;
};

export type RequestCallbacks<T> = RequestCallback<T, Requests<T>>;

export class Subprocess<T> {
    private lastId = 1;
    private readonly subprocess: ChildProcess;
    private readonly callbacks = new Map<number, RequestCallbacks<T>>();

    public constructor(subprocess: ChildProcess) {
        this.subprocess = subprocess;
        this.subprocess.on("message", this.onSubprocessMessage.bind(this));
    }

    public getQueueSize(): number {
        return this.callbacks.size;
    }

    // @ts-ignore
    public sendAction<K extends Actions<T>>(method: K, ...args: Parameters<T[K]>): void {
        this.subprocess.send({ method, args });
    }

    // @ts-ignore
    public sendRequest<K extends Requests<T>>(method: K, ...args: Parameters<T[K]>): Promise<ReturnType<T[K]>> {
        return new Promise((resolve, reject) => {
            const id = this.lastId++;
            this.callbacks.set(id, { resolve, reject });
            this.subprocess.send({ id, method, args });
        });
    }

    private onSubprocessMessage(message: Reply): void {
        try {
            if ("error" in message) {
                this.callbacks.get(message.id)?.reject(new Error(message.error));
            } else {
                this.callbacks.get(message.id)?.resolve(message.result);
            }
        } finally {
            this.callbacks.delete(message.id);
        }
    }
}