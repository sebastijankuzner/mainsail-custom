import { ClientRequest, IncomingMessage, RequestOptions } from "http";
import * as httpClient from "http";
import * as httpsClient from "https";
import { JsonArray, JsonObject, Primitive } from "type-fest";
import { URL } from "url";

import { isObject } from "./is-object.js";
import { isUndefined } from "./is-undefined.js";

const sendRequest = (method: string, url: string, options?: HttpOptions): Promise<HttpResponse> =>
	new Promise((resolve, reject) => {
		if (!isObject(options)) {
			options = {};
		}

		const parsedUrl = new URL(url);
		if (!parsedUrl) {
			throw new Error("failed to parseURL");
		}

		const client = parsedUrl.protocol === "https:" ? httpsClient : httpClient;
		const { globalAgent, request } = client;

		options = { ...options };
		options.host = parsedUrl.host;
		options.hostname = parsedUrl.hostname;
		options.port = parsedUrl.port;
		options.protocol = parsedUrl.protocol;
		options.method = method.toLowerCase();

		if (parsedUrl.pathname) {
			options.path = parsedUrl.pathname;
		}

		if (parsedUrl.search) {
			options.path += parsedUrl.search;
		}

		if (options.protocol === "http:" || options.protocol === "https:") {
			options.agent = globalAgent;
		}

		if (isUndefined(options.timeout)) {
			options.timeout = 1500;
		}

		const maxContentLength = options.maxContentLength ?? Number.MAX_SAFE_INTEGER;
		const request_: ClientRequest = request(options, (r: IncomingMessage): void => {
			let accumulator = "";
			let readBytes = 0;

			r.setEncoding("utf8");

			r.on("data", (chunk: string) => {
				readBytes += Buffer.byteLength(chunk, "utf8");

				if (readBytes > maxContentLength) {
					r.destroy(new Error("response too large"));
					return;
				}

				accumulator += chunk;
			});

			r.on("end", (): void => {
				const response: HttpResponse = {
					data: "",
					headers: r.rawHeaders,
					method,
					statusCode: r.statusCode,
					statusMessage: r.statusMessage,
				};

				const type: string | undefined = r.headers["content-type"];

				if (type && accumulator && type.includes("application/json")) {
					try {
						accumulator = JSON.parse(accumulator);
					} catch (error) {
						return reject(new HttpError(response, error));
					}
				}

				response.statusCode = r.statusCode;
				response.statusMessage = r.statusMessage;
				response.data = accumulator;

				if (r.statusCode && r.statusCode >= 400) {
					return reject(new HttpError(response));
				}

				return resolve(response);
			});
		});

		request_.on("error", reject);

		request_.on("timeout", () => request_.abort());

		if (options.body) {
			const body: string = JSON.stringify(options.body);

			request_.setHeader("content-type", "application/json");
			request_.setHeader("content-length", Buffer.byteLength(body));
			request_.write(body);
		}

		request_.end();
	});

export type HttpOptions = RequestOptions & {
	maxContentLength?: number;
	body?: Record<string, Primitive | JsonObject | JsonArray>;
};

export type HttpResponse = {
	method: string | undefined;
	statusCode: number | undefined;
	statusMessage: string | undefined;
	data: any;
	headers: string[];
};

export class HttpError extends Error {
	public constructor(response: HttpResponse, error?: Error) {
		const message: string | undefined = error ? error.message : response.statusMessage;

		super(message);

		Object.defineProperty(this, "message", {
			enumerable: false,
			value: message,
		});

		Object.defineProperty(this, "name", {
			enumerable: false,
			value: this.constructor.name,
		});

		Object.defineProperty(this, "response", {
			enumerable: false,
			value: {
				data: response.data,
				headers: response.headers,
				statusCode: response.statusCode,
				statusMessage: response.statusMessage,
			},
		});

		Error.captureStackTrace(this, this.constructor);
	}
}

export const http = {
	delete: (url: string, options?: HttpOptions): Promise<HttpResponse> => sendRequest("DELETE", url, options),
	get: (url: string, options?: HttpOptions): Promise<HttpResponse> => sendRequest("GET", url, options),
	head: (url: string, options?: HttpOptions): Promise<HttpResponse> => sendRequest("HEAD", url, options),
	patch: (url: string, options?: HttpOptions): Promise<HttpResponse> => sendRequest("PATCH", url, options),
	post: (url: string, options?: HttpOptions): Promise<HttpResponse> => sendRequest("POST", url, options),
	put: (url: string, options?: HttpOptions): Promise<HttpResponse> => sendRequest("PUT", url, options),
};
