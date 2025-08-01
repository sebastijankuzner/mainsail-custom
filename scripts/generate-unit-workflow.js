import { assert } from "console";
import { readdirSync, writeFileSync } from "fs";
import { resolve, join } from "path";
import YAML from "yaml";

const workflow = {
	jobs: {
		unit: {
			concurrency: {
				"cancel-in-progress": true,
				group: `\${{ github.head_ref }}-unit`,
			},
			"runs-on": "ubuntu-latest",
			steps: [
				{
					uses: "actions/checkout@v4",
					with: {
						ref: "${{ github.head_ref }}",
					},
				},
				{
					uses: "actions/setup-node@v4",
					with: {
						"node-version": "${{ matrix.node-version }}",
					},
				},
				{
					name: "Setup pnpm",
					uses: "pnpm/action-setup@v4",
					with: {
						run_install: false,
						version: "latest",
					},
				},
				{
					name: "Get pnpm store directory",
					// eslint-disable-next-line sort-keys-fix/sort-keys-fix
					id: "pnpm-cache",
					run: 'echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT',
					shell: "bash",
				},
				{
					name: "Cache pnpm modules",
					uses: "actions/cache@v4",
					with: {
						key: "${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}",
						path: "${{ steps.pnpm-cache.outputs.STORE_PATH }}",
						"restore-keys": "${{ runner.os }}-pnpm-",
					},
				},
				{
					name: "Cache lerna",
					uses: "actions/cache@v4",
					with: {
						key: "${{ runner.os }}-lerna",
						path: "./.cache",
						"restore-keys": "${{ runner.os }}-lerna-",
					},
				},
				{
					name: "Install dependencies",
					run: "pnpm install",
				},

				{
					name: "Build",
					run: "pnpm run build",
				},
			],
			strategy: {
				matrix: {
					"node-version": ["20.x"],
				},
			},
		},
	},
	name: "CI",
	on: {
		pull_request: {
			types: ["ready_for_review", "synchronize", "opened"],
		},
		push: {
			branches: ["main", "develop"],
		},
	},
};

const directories = readdirSync(resolve("packages"), { withFileTypes: true })
	.filter((dirent) => dirent.isDirectory())
	.map((dirent) => dirent.name)
	.sort();

for (const directory of directories) {
	try {
		const packageJson = (
			await import(join(process.cwd(), `/packages/${directory}/package.json`), { assert: { type: "json" } })
		).default;

		if (packageJson["scripts"]["test"] === undefined) {
			console.log(`Package [${directory}] has no [test] script.`);

			continue;
		}

		workflow.jobs.unit.steps.push({
			name: `Test ${directory}`,
			run: `cd packages/${directory} && pnpm run test`,
		});
	} catch (error) {
		console.error(error);

		continue;
	}
}

writeFileSync(join(process.cwd(), ".github/workflows/unit.yml"), YAML.stringify(workflow, { indent: 4 }));
