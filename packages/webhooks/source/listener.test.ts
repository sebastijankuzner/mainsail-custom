import { Container } from "@mainsail/container";
import { Contracts, Events, Identifiers } from "@mainsail/contracts";
import { Application } from "@mainsail/kernel";
import { http } from "@mainsail/utils";
import { dirSync, setGracefulCleanup } from "tmp";

import { describe } from "../../test-framework/source";
import { dummyWebhook } from "../test/fixtures/assets";
import { conditions } from "./conditions";
import { Database } from "./database";
import { Listener } from "./listener";

describe<{
	database: Database;
	listener: Listener;
}>("Listener", ({ beforeEach, afterAll, stub, it, assert }) => {
	let webhook: Contracts.Webhooks.Webhook;

	const logger = {
		debug: () => {},
		error: () => {},
	};

	const eventDispatcher = {
		dispatch: () => {},
	};

	const expectFinishedEventData = ({ executionTime, webhook, payload }) => {
		assert.number(executionTime);
		assert.object(webhook);
		assert.defined(payload);
	};

	const expectFailedEventData = ({ executionTime, webhook, payload, error }) => {
		assert.number(executionTime);
		assert.object(webhook);
		assert.defined(payload);
		assert.object(error);
	};

	beforeEach((context) => {
		const app = new Application(new Container());
		app.bind("path.cache").toConstantValue(dirSync().name);

		app.bind(Identifiers.Services.EventDispatcher.Service).toConstantValue(eventDispatcher);
		app.bind<Database>(Identifiers.Webhooks.Database).to(Database).inSingletonScope();

		app.bind(Identifiers.Services.Log.Service).toConstantValue(logger);
		app.bind(Identifiers.Services.Filesystem.Service).toConstantValue({ existsSync: () => true });

		context.database = app.get<Database>(Identifiers.Webhooks.Database);
		context.database.boot();

		context.listener = app.resolve<Listener>(Listener);

		webhook = Object.assign({}, dummyWebhook);
	});

	afterAll(() => {
		setGracefulCleanup();
	});

	it("should broadcast to registered webhooks", async ({ database, listener }) => {
		const spyOnPost = stub(http, "post").resolvedValue({
			statusCode: 200,
		});
		const spyOnDebug = stub(logger, "debug");
		const spyOnDispatch = stub(eventDispatcher, "dispatch");

		database.create(webhook);
		spyOnDispatch.calledOnce();
		spyOnDispatch.calledWith(Events.WebhookEvent.Created);

		spyOnDispatch.reset();
		await listener.handle({ data: "dummy_data", name: "event" });

		spyOnPost.calledOnce();
		spyOnDebug.calledOnce();
		spyOnDispatch.calledOnce();
		spyOnDispatch.calledWith(Events.WebhookEvent.Broadcasted);
	});

	it("should log error if broadcast is not successful", async ({ database, listener }) => {
		const spyOnPost = stub(http, "post").callsFake(() => {
			throw new Error("dummy error");
		});
		const spyOnError = stub(logger, "error");
		const spyOnDispatch = stub(eventDispatcher, "dispatch");

		database.create(webhook);
		spyOnDispatch.calledOnce();
		spyOnDispatch.calledWith(Events.WebhookEvent.Created);

		spyOnDispatch.reset();
		await listener.handle({ data: "dummy_data", name: "event" });

		spyOnPost.calledOnce();
		spyOnError.calledOnce();
		spyOnDispatch.calledOnce();
		spyOnDispatch.calledWith(Events.WebhookEvent.Failed);
	});

	it("#should not broadcast if webhook is disabled", async ({ database, listener }) => {
		const spyOnPost = stub(http, "post");

		webhook.enabled = false;
		database.create(webhook);

		await listener.handle({ data: "dummy_data", name: "event" });

		spyOnPost.neverCalled();
	});

	it("should not broadcast if event is webhook event", async ({ database, listener }) => {
		const spyOnPost = stub(http, "post");

		database.create(webhook);

		await listener.handle({ data: "dummy_data", name: Events.WebhookEvent.Broadcasted });

		spyOnPost.neverCalled();
	});

	it("should broadcast if webhook condition is satisfied", async ({ database, listener }) => {
		const spyOnPost = stub(http, "post").resolvedValue({
			statusCode: 200,
		});
		const spyOnDispatch = stub(eventDispatcher, "dispatch");

		webhook.conditions = [
			{
				condition: "eq",
				key: "test",
				value: 1,
			},
		];
		database.create(webhook);
		spyOnDispatch.calledOnce();
		spyOnDispatch.calledWith(Events.WebhookEvent.Created);

		spyOnDispatch.reset();
		await listener.handle({ data: { test: 1 }, name: "event" });

		spyOnPost.calledOnce();
		spyOnDispatch.calledOnce();
		spyOnDispatch.calledWith(Events.WebhookEvent.Broadcasted);
	});

	it("should broadcast satisfied webhook condition with nested key", async ({ database, listener }) => {
		const spyOnPost = stub(http, "post").resolvedValue({
			statusCode: 200,
		});
		const spyOnDispatch = stub(eventDispatcher, "dispatch");

		webhook.conditions = [
			{
				condition: "eq",
				key: "some.nested.prop",
				value: 1,
			},
		];
		database.create(webhook);
		spyOnDispatch.calledOnce();
		spyOnDispatch.calledWith(Events.WebhookEvent.Created);

		spyOnDispatch.reset();
		await listener.handle({ data: { some: { nested: { prop: 1 } } }, name: "event" });

		spyOnPost.calledOnce();
		spyOnDispatch.calledOnce();
		spyOnDispatch.calledWith(Events.WebhookEvent.Broadcasted);
	});

	it("should broadcast satisfied webhook condition with nested key", async ({ database, listener }) => {
		const spyOnPost = stub(http, "post").resolvedValue({
			statusCode: 200,
		});
		const spyOnDispatch = stub(eventDispatcher, "dispatch");

		webhook.conditions = [
			{
				condition: "eq",
				key: "some.nested.prop",
				value: 1,
			},
		];
		database.create(webhook);
		spyOnDispatch.calledOnce();
		spyOnDispatch.calledWith(Events.WebhookEvent.Created);

		spyOnDispatch.reset();
		await listener.handle({ data: { some: { nested: { prop: 1 } } }, name: "event" });

		spyOnPost.calledOnce();
		spyOnDispatch.calledOnce();
		spyOnDispatch.calledOnce();
		spyOnDispatch.calledWith(Events.WebhookEvent.Broadcasted);
	});

	it("should not broadcast if webhook condition is not satisfied", async ({ database, listener }) => {
		const spyOnPost = stub(http, "post");

		webhook.conditions = [
			{
				condition: "eq",
				key: "test",
				value: 1,
			},
		];
		database.create(webhook);

		await listener.handle({ data: { test: 2 }, name: "event" });

		spyOnPost.neverCalled();
	});

	it("should not broadcast if webhook condition with nested key is not satisfied", async ({ database, listener }) => {
		const spyOnPost = stub(http, "post");

		webhook.conditions = [
			{
				condition: "eq",
				key: "some.nested.prop",
				value: 1,
			},
		];
		database.create(webhook);

		await listener.handle({ data: { some: { nested: { prop: 2 } } }, name: "event" });

		spyOnPost.neverCalled();
	});

	it("should not broadcast if webhook condition throws error", async ({ database, listener }) => {
		const spyOnEq = stub(conditions, "eq").callsFake(() => {
			throw new Error("dummy error");
		});

		const spyOnPost = stub(http, "post");

		webhook.conditions = [
			{
				condition: "eq",
				key: "test",
				value: 1,
			},
		];
		database.create(webhook);

		await listener.handle({ data: { test: 2 }, name: "event" });

		spyOnEq.calledOnce();
		spyOnPost.neverCalled();
	});
});
