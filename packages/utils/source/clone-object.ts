export const cloneObject = <T extends Record<string, any>>(input: T): T => {
	const keys: string[] = Object.keys(input);
	const cloned = {};

	for (const key of keys) {
		cloned[key] = input[key];
	}

	return cloned as T;
};
