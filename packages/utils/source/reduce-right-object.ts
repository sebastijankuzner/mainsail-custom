import { FunctionReturning } from "./internal/index.js";

export const reduceRightObject = <T extends Record<string, any>, V>(
	iterable: T,
	iteratee: FunctionReturning,
	initialValue?: V,
): V | undefined => {
	const keys: string[] = Object.keys(iterable);

	let result: V | undefined = initialValue;

	for (let index = keys.length - 1; index >= 0; index--) {
		const key = keys[index];

		result = iteratee(result, iterable[key], key, iterable);
	}

	return result;
};
