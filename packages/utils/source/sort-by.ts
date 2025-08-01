import { ISortBy, ISortByFunction, sort } from "fast-sort";

export const sortBy = <T>(
	values: T[],
	iteratees?: ISortByFunction<T> | keyof T | (ISortByFunction<T> | keyof T)[] | ISortBy<T>[],
): T[] => sort(values).asc(iteratees);
