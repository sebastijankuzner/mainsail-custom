import { FunctionReturning } from "./internal/index.js";

export const filterObject = <T extends Record<string, any>>(iterable: T, iteratee: FunctionReturning): T => {
	const keys = Object.keys(iterable);
	const length: number = keys.length;
	const result = {};

	for (let index = 0; index < length; index++) {
		const key = keys[index];

		if (iteratee(iterable[key], key, iterable)) {
			result[key] = iterable[key];
		}
	}

	return result as T;
};
