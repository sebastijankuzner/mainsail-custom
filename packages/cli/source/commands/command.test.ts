import { injectable, postConstruct } from "@mainsail/container";
import Joi from "joi";

import { Console, describe } from "../../../test-framework/source";
import { Identifiers } from "../ioc/index.js";
import { Output } from "../output";
import { Command } from "./command";

@injectable()
class StubCommand extends Command {
	@postConstruct()
	public configure(): void {
		this.definition.setArgument("firstName", "description", Joi.string());
		this.definition.setArgument("lastName", "description", Joi.string());

		this.definition.setFlag("token", "description", Joi.string());
		this.definition.setFlag("network", "description", Joi.string().default("devnet"));
		this.definition.setFlag("hello", "description", Joi.string());
	}

	public async execute(): Promise<void> {
		//
	}
}

describe<{
	cmd: Command;
}>("Command", ({ beforeEach, it, assert, spy, stub }) => {
	const output: Partial<Output> = {
		isQuiet: () => false,
		setVerbosity: () => {},
	};

	const box = {
		render: () => {},
	};

	let spyOnSetVerbosity;
	let spyOnExecute;

	beforeEach((context) => {
		const cli = new Console();

		cli.app.rebind(Identifiers.Output).toConstantValue(output);
		cli.app.rebind(Identifiers.Box).toConstantValue(box);

		context.cmd = cli.app.resolve(StubCommand);
		context.cmd.register(["env:paths", "john", "doe", "--hello=world"]);

		spyOnSetVerbosity = spy(output, "setVerbosity");
		spyOnExecute = spy(context.cmd, "execute");
	});

	it("should register the command", ({ cmd }) => {
		cmd.register(["env:paths", "john", "doe", "--hello=world"]);

		spyOnSetVerbosity.calledWith(1);
	});

	it("should register the command with an output verbosity of quiet", ({ cmd }) => {
		cmd.register(["env:paths", "--quiet"]);

		spyOnSetVerbosity.calledWith(0);
	});

	it("should register the command with an output verbosity of normal", ({ cmd }) => {
		cmd.register(["env:paths", "-v"]);

		spyOnSetVerbosity.calledWith(1);
	});

	it("should register the command with an output verbosity of verbose", ({ cmd }) => {
		cmd.register(["env:paths", "-vv"]);

		spyOnSetVerbosity.calledWith(2);
	});

	it("should register the command with an output verbosity of debug", ({ cmd }) => {
		cmd.register(["env:paths", "-vvv"]);

		spyOnSetVerbosity.calledWith(3);
	});

	it("should register the command and encounter an error", ({ cmd }) => {
		spyOnSetVerbosity.restore();
		stub(output, "setVerbosity").callsFake(() => {
			throw new Error("I am an error");
		});

		assert.throws(() => cmd.register(["env:paths", "--quiet"]), "I am an error");
	});

	it("#configure - should do nothing", ({ cmd }) => {
		cmd.configure();
	});

	it("#initialize - should do nothing", async ({ cmd }) => {
		await cmd.initialize();
	});

	it("#interact - should do nothing", async ({ cmd }) => {
		await cmd.interact();
	});

	it("#run - should run the command", async ({ cmd }) => {
		cmd.setFlag("token", "ark");
		cmd.setFlag("network", "devnet");

		await cmd.run();

		spyOnExecute.calledOnce();
	});

	it("#run - should run the command in interactive mode", async ({ cmd }) => {
		cmd.register(["env:paths", "--interaction"]);

		const spyOnInteract = spy(cmd, "interact");

		await cmd.run();

		spyOnInteract.calledOnce();
		spyOnExecute.calledOnce();
	});

	it("#run - should run the command in non-interactive mode", async ({ cmd }) => {
		cmd.register(["env:paths"]);

		const spyOnInteract = spy(cmd, "interact");

		await cmd.run();

		spyOnInteract.neverCalled();
		spyOnExecute.calledOnce();
	});

	it("should run the command and throw an error", async ({ cmd }) => {
		stub(cmd, "initialize").callsFake(() => {
			throw new Error("I am an error");
		});

		await assert.rejects(() => cmd.run(), "I am an error");
	});

	it("#execute - should execute the command", async ({ cmd }) => {
		await assert.resolves(() => cmd.execute());
	});

	it("#showHelp - should display the help", async ({ cmd }) => {
		let output;
		stub(box, "render").callsFake((message: string) => (output = message));

		cmd.showHelp();
		assert.true(output.includes("firstName"));
		assert.true(output.includes("lastName"));
		assert.true(output.includes("--hello"));
	});

	it("#getArguments - should get all arguments", ({ cmd }) => {
		assert.equal(cmd.getArguments(), { firstName: "john", lastName: "doe" });
	});

	it("#getArgument - should get the value of an argument", ({ cmd }) => {
		assert.equal(cmd.getArgument("firstName"), "john");
	});

	it("#setArgument - should set the value of an argument", ({ cmd }) => {
		assert.equal(cmd.getArgument("firstName"), "john");

		cmd.setArgument("firstName", "jane");

		assert.equal(cmd.getArgument("firstName"), "jane");
	});

	it("#hasArgument - should check if an argument exists", ({ cmd }) => {
		assert.true(cmd.hasArgument("firstName"));
		assert.false(cmd.hasArgument("something"));
	});

	it("#getFlags - should get all flags", ({ cmd }) => {
		assert.equal(cmd.getFlags(), { hello: "world", network: "devnet", v: 0 });
	});

	it("#getFlag - should get the value of a flag", ({ cmd }) => {
		assert.equal(cmd.getFlag("hello"), "world");
	});

	it("#setFlag - should set the value of a flag", ({ cmd }) => {
		assert.equal(cmd.getFlag("hello"), "world");

		cmd.setFlag("hello", "jane");

		assert.equal(cmd.getFlag("hello"), "jane");
	});

	it("#hasFlag - should check if a flag exists", ({ cmd }) => {
		assert.true(cmd.hasFlag("hello"));
		assert.false(cmd.hasFlag("something"));
	});
});
