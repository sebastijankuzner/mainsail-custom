import { ISortBy, ISortByFunction, sort } from "fast-sort";

export const sortByDesc = <T>(
	values: T[],
	iteratees?: ISortByFunction<T> | keyof T | (ISortByFunction<T> | keyof T)[] | ISortBy<T>[],
): T[] => sort(values).desc(iteratees);
