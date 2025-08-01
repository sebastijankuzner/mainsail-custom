import { getPathSegments } from "./get-path-segments.js";
import { isObject } from "./is-object.js";
import { isString } from "./is-string.js";

export const set = <T>(object: T, path: string | string[], value: unknown): boolean => {
	if (!isObject(object) || !isString(path)) {
		return false;
	}

	const pathSegments: string[] = getPathSegments(path);

	for (let index = 0; index < pathSegments.length; index++) {
		const pathSegment: string = pathSegments[index];

		if (!isObject(object[pathSegment])) {
			object[pathSegment] = {};
		}

		// Prototype pollution check is not needed here, because getPathSegments filters out
		if (index === pathSegments.length - 1) {
			object[pathSegment] = value;
		}

		object = object[pathSegment];
	}

	return true;
};
