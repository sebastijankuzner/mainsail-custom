import Hapi from "@hapi/hapi";

import { Application } from "../kernel/application.js";
import { Processor } from "./rpc.js";

export type ApiServer = Hapi.Server<ServerState>;

export interface Server {
	boot(): Promise<void>;
	dispose(): Promise<void>;
}

export enum ServerType {
	Http = "HTTP",
	Https = "HTTPS",
}

export interface ServerState {
	app: Application;
	schemas: any;
	rpc: Processor;
}

export type Sorting = {
	property: string;
	direction: "asc" | "desc";
}[];

export type Pagination = {
	offset: number;
	limit: number;
};

export type Options = {
	estimateTotalCount?: boolean;
};

export type ResultsPage<T> = {
	results: T[];
	totalCount: number;
	meta?: { totalCountIsEstimate?: boolean };
};

export interface Resource {
	transform(resource): object;
}
