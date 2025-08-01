import { filter } from "./filter.js";
import { FunctionReturning } from "./internal/index.js";

export const omitBy = <T extends Record<string, any>>(iterable: T, iteratee: FunctionReturning): T =>
	filter(iterable, (value) => !iteratee(value)) as T;
