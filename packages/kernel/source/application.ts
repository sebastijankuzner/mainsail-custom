import { exit } from "node:process";

import { Contracts, Events, Exceptions, Identifiers } from "@mainsail/contracts";
import { join } from "path";
import { isMainThread } from "worker_threads";

import { Bootstrappers } from "./bootstrap/index.js";
import { ServiceProvider, ServiceProviderRepository } from "./providers/index.js";
import { ConfigRepository } from "./services/config/index.js";
import { ServiceProvider as EventServiceProvider } from "./services/events/service-provider.js";
import { Constructor } from "./types/container.js";
import { KeyValuePair } from "./types/index.js";

export class Application implements Contracts.Kernel.Application {
	#booted = false;
	#terminating = false;

	public constructor(public readonly container: Contracts.Kernel.Container.Container) {
		this.bind<Contracts.Kernel.Application>(Identifiers.Application.Instance).toConstantValue(this);

		this.bind<ConfigRepository>(Identifiers.Config.Repository).to(ConfigRepository).inSingletonScope();

		this.bind<ServiceProviderRepository>(Identifiers.ServiceProvider.Repository)
			.to(ServiceProviderRepository)
			.inSingletonScope();
	}

	public async bootstrap(options: {
		flags: Contracts.Types.JsonObject;
		plugins?: Contracts.Types.JsonObject;
	}): Promise<void> {
		this.bind<KeyValuePair>(Identifiers.Config.Flags).toConstantValue(options.flags);
		this.bind<KeyValuePair>(Identifiers.Config.Plugins).toConstantValue(options.plugins || {});

		await this.#registerEventDispatcher();

		await this.#bootstrapWith("app");
	}

	public async boot(): Promise<void> {
		try {
			await this.#bootstrapWith("serviceProviders");
			this.#booted = true;
		} catch (error) {
			await this.terminate(error.name, error);
		}
	}

	public async reboot(): Promise<void> {
		await this.#disposeServiceProviders();

		await this.boot();
	}

	public config<T = any>(key: string, value?: T, defaultValue?: T): T | undefined {
		const config: ConfigRepository = this.get<ConfigRepository>(Identifiers.Config.Repository);

		if (value) {
			config.set(key, value);
		}

		return config.get(key, defaultValue);
	}

	public version(): string {
		return this.get(Identifiers.Application.Version);
	}

	public name(): string {
		return this.get(Identifiers.Application.Name);
	}

	public thread(): string {
		return this.get(Identifiers.Application.Thread);
	}

	public dataPath(path = ""): string {
		return join(this.#getPath("data"), path);
	}

	public useDataPath(path: string): void {
		this.#usePath("data", path);
	}

	public configPath(path = ""): string {
		return join(this.#getPath("config"), path);
	}

	public useConfigPath(path: string): void {
		this.#usePath("config", path);
	}

	public cachePath(path = ""): string {
		return join(this.#getPath("cache"), path);
	}

	public useCachePath(path: string): void {
		this.#usePath("cache", path);
	}

	public logPath(path = ""): string {
		return join(this.#getPath("log"), path);
	}

	public useLogPath(path: string): void {
		this.#usePath("log", path);
	}

	public tempPath(path = ""): string {
		return join(this.#getPath("temp"), path);
	}

	public useTempPath(path: string): void {
		this.#usePath("temp", path);
	}

	public environmentFile(): string {
		return this.configPath(".env");
	}

	public environment(): string {
		return this.get(Identifiers.Application.Environment);
	}

	public useEnvironment(value: string): void {
		this.rebind<string>(Identifiers.Application.Environment).toConstantValue(value);
	}

	public isBooted(): boolean {
		return this.#booted;
	}

	public isWorker(): boolean {
		return !isMainThread;
	}

	public enableMaintenance(): void {
		// writeFileSync(this.tempPath("maintenance"), JSON.stringify({ time: Date.now() }));
		// this.get<Contracts.Kernel.Logger>(Identifiers.Services.Log.Service).notice(
		// 	"Application is now in maintenance mode.",
		// );
		// // eslint-disable-next-line @typescript-eslint/no-floating-promises
		// this.get<Contracts.Kernel.EventDispatcher>(Identifiers.Services.EventDispatcher.Service).dispatch(
		// 	"kernel.maintenance",
		// 	true,
		// );
	}

	public disableMaintenance(): void {
		// removeSync(this.tempPath("maintenance"));
		// this.get<Contracts.Kernel.Logger>(Identifiers.Services.Log.Service).notice("Application is now live.");
		// // eslint-disable-next-line @typescript-eslint/no-floating-promises
		// this.get<Contracts.Kernel.EventDispatcher>(Identifiers.Services.EventDispatcher.Service).dispatch(
		// 	"kernel.maintenance",
		// 	false,
		// );
	}

	public isDownForMaintenance(): boolean {
		// existsSync(this.tempPath("maintenance"));
		return false;
	}

	public async terminate(reason?: string, error?: Error): Promise<never> {
		this.#booted = false;

		if (this.#terminating) {
			return new Promise(() => {});
		}
		this.#terminating = true;

		if (reason) {
			this.get<Contracts.Kernel.Logger>(Identifiers.Services.Log.Service)[error ? "error" : "warning"](
				`Application shutdown: ${reason}`,
			);
		}

		if (error) {
			let errors: Error[] = [error];

			// Check for AggregateError
			if ("errors" in error) {
				errors = [...errors, ...(error as unknown as Record<string, any>).errors];
			}

			for (const error of errors) {
				this.get<Contracts.Kernel.Logger>(Identifiers.Services.Log.Service).error(error.stack ?? error.message);
			}
		}

		const timeout = setTimeout(() => {
			this.get<Contracts.Kernel.Logger>(Identifiers.Services.Log.Service).warning(
				"Force application termination. Service providers did not dispose in time.",
			);
			exit(1);
		}, 3000);

		await this.#disposeServiceProviders();
		clearTimeout(timeout);

		// Await all async operations to finish
		await new Promise((resolve) => setTimeout(resolve, 0));

		this.#logOpenHandlers();

		this.get<Contracts.Kernel.Logger>(Identifiers.Services.Log.Service).notice(
			"Application is gracefully terminated.",
		);

		exit(1);
	}

	public bind<T>(
		serviceIdentifier: Contracts.Kernel.Container.ServiceIdentifier<T>,
	): Contracts.Kernel.Container.BindToFluentSyntax<T> {
		return this.container.bind(serviceIdentifier);
	}

	public rebind<T>(
		serviceIdentifier: Contracts.Kernel.Container.ServiceIdentifier<T>,
	): Contracts.Kernel.Container.BindToFluentSyntax<T> {
		if (this.container.isBound(serviceIdentifier)) {
			this.container.unbindSync(serviceIdentifier);
		}

		return this.container.bind(serviceIdentifier);
	}

	public unbind<T>(serviceIdentifier: Contracts.Kernel.Container.ServiceIdentifier<T>): void {
		return this.container.unbindSync(serviceIdentifier);
	}

	public get<T>(serviceIdentifier: Contracts.Kernel.Container.ServiceIdentifier<T>): T {
		return this.container.get(serviceIdentifier);
	}

	public getTagged<T>(
		serviceIdentifier: Contracts.Kernel.Container.ServiceIdentifier<T>,
		key: string | number | symbol,
		value: any,
	): T {
		return this.container.get(serviceIdentifier, { tag: { key, value } });
	}

	public isBound<T>(serviceIdentifier: Contracts.Kernel.Container.ServiceIdentifier<T>): boolean {
		return this.container.isBound(serviceIdentifier);
	}

	public isBoundTagged<T>(
		serviceIdentifier: Contracts.Kernel.Container.ServiceIdentifier<T>,
		key: string | number | symbol,
		value: any,
	): boolean {
		return this.container.isBound(serviceIdentifier, { tag: { key, value } });
	}

	public resolve<T>(constructorFunction: Contracts.Kernel.Container.Newable<T>): T {
		return this.container.get(constructorFunction, { autobind: true });
	}

	async #bootstrapWith(type: string): Promise<void> {
		const bootstrappers: Constructor<Contracts.Kernel.Bootstrapper>[] = Object.values(Bootstrappers[type]);
		const events: Contracts.Kernel.EventDispatcher = this.get(Identifiers.Services.EventDispatcher.Service);

		for (const bootstrapper of bootstrappers) {
			await events.dispatch(Events.KernelEvent.Bootstrapping, { bootstrapper: bootstrapper.name });

			await this.resolve<Contracts.Kernel.Bootstrapper>(bootstrapper).bootstrap();

			await events.dispatch(Events.KernelEvent.Bootstrapped, { bootstrapper: bootstrapper.name });
		}
	}

	async #registerEventDispatcher(): Promise<void> {
		await this.resolve(EventServiceProvider).register();
	}

	async #disposeServiceProviders(): Promise<void> {
		const serviceProviders: ServiceProvider[] = this.get<ServiceProviderRepository>(
			Identifiers.ServiceProvider.Repository,
		).allLoadedProviders();

		for (const serviceProvider of serviceProviders.reverse()) {
			this.get<Contracts.Kernel.Logger>(Identifiers.Services.Log.Service).debug(
				`Disposing ${serviceProvider.name()}...`,
			);

			try {
				await serviceProvider.dispose();
			} catch {}
		}
	}

	#logOpenHandlers(): void {
		try {
			// @ts-ignore
			const resourcesInfo: string[] = process.getActiveResourcesInfo(); // Method is experimental

			const timeouts = resourcesInfo.filter((resource) => resource.includes("Timeout"));
			const fsRequests = resourcesInfo.filter((resource) => resource.includes("FSReqCallback"));

			if (timeouts.length > 0 || fsRequests.length > 0) {
				this.get<Contracts.Kernel.Logger>(Identifiers.Services.Log.Service).warning(
					`There are ${timeouts.length} active timeouts and ${fsRequests.length} active file system requests.`,
				);
			}
		} catch {}
	}

	#getPath(type: string): string {
		const path: string = this.get<string>(`path.${type}`);

		if (!this.get<Contracts.Kernel.Filesystem>(Identifiers.Services.Filesystem.Service).existsSync(path)) {
			throw new Exceptions.DirectoryCannotBeFound(path);
		}

		return path;
	}

	#usePath(type: string, path: string): void {
		if (!this.get<Contracts.Kernel.Filesystem>(Identifiers.Services.Filesystem.Service).existsSync(path)) {
			throw new Exceptions.DirectoryCannotBeFound(path);
		}

		this.rebind<string>(`path.${type}`).toConstantValue(path);
	}
}
