export interface Lock {
	lock(): void;
	unlock(): void;

	run<T>(callback: () => Promise<void>): Promise<void>;
}
