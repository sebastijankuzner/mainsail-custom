import { FunctionReturning } from "./internal/index.js";

export const mapValues = <T extends Record<string, any>>(iterable: T, iteratee: FunctionReturning): object => {
	const keys: string[] = Object.keys(iterable);
	const result = {};

	for (const key of keys) {
		result[key] = iteratee(iterable[key], key, iterable);
	}

	return result;
};
