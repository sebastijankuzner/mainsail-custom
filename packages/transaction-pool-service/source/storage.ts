import { inject, injectable, tagged } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers } from "@mainsail/kernel";
import BetterSqlite3 from "better-sqlite3";
import { ensureFileSync } from "fs-extra/esm";

@injectable()
export class Storage implements Contracts.TransactionPool.Storage {
	@inject(Identifiers.ServiceProvider.Configuration)
	@tagged("plugin", "transaction-pool-service")
	private readonly configuration!: Providers.PluginConfiguration;

	#database!: BetterSqlite3.Database;
	#addTransactionStmt!: BetterSqlite3.Statement<Contracts.TransactionPool.StoredTransaction>;
	#hasTransactionStmt!: BetterSqlite3.Statement<{ hash: string }>;
	#getAllTransactionsStmt!: BetterSqlite3.Statement;
	#getOldTransactionsStmt!: BetterSqlite3.Statement<{ blockNumber: number; limit: number }>;
	#removeTransactionStmt!: BetterSqlite3.Statement<{ hash: string }>;
	#flushStmt!: BetterSqlite3.Statement;

	public boot(): void {
		const filename = this.configuration.getRequired<string>("storage");

		if (filename === ":memory:") {
			this.#database = new BetterSqlite3(":memory:");
		} else {
			ensureFileSync(filename);
			this.#database = new BetterSqlite3(filename);
		}

		const table = "pool_20201204";
		this.#database.exec(`
            PRAGMA journal_mode = WAL;

            DROP TABLE IF EXISTS pool;

            CREATE TABLE IF NOT EXISTS ${table}(
                n                  INTEGER      PRIMARY KEY AUTOINCREMENT,
                blockNumber        INTEGER      NOT NULL,
                hash               VARCHAR(64)  NOT NULL,
                senderPublicKey    VARCHAR(66)  NOT NULL,
                serialized         BLOB         NOT NULL
            );

            CREATE UNIQUE INDEX IF NOT EXISTS ${table}_hash ON ${table} (hash);
            CREATE INDEX IF NOT EXISTS ${table}_blockNumber ON ${table} (blockNumber);
        `);

		this.#addTransactionStmt = this.#database.prepare(
			`INSERT INTO ${table} (blockNumber, hash, senderPublicKey, serialized) VALUES (:blockNumber, :hash, :senderPublicKey, :serialized)`,
		);

		this.#hasTransactionStmt = this.#database
			.prepare(`SELECT COUNT(*) FROM ${table} WHERE hash = :hash`)
			.pluck(true);

		this.#getAllTransactionsStmt = this.#database.prepare(
			`SELECT blockNumber, hash, senderPublicKey, serialized FROM ${table} ORDER BY n`,
		);

		this.#getOldTransactionsStmt = this.#database.prepare(
			`SELECT blockNumber, hash, senderPublicKey, serialized FROM ${table} WHERE blockNumber <= :blockNumber ORDER BY n DESC LIMIT :limit`,
		);

		this.#removeTransactionStmt = this.#database.prepare(`DELETE FROM ${table} WHERE hash = :hash`);

		this.#flushStmt = this.#database.prepare(`DELETE FROM ${table}`);
	}

	public dispose(): void {
		this.#database.close();
	}

	public addTransaction(storedTransaction: Contracts.TransactionPool.StoredTransaction): void {
		this.#addTransactionStmt.run(storedTransaction);
	}

	public hasTransaction(hash: string): boolean {
		return !!this.#hasTransactionStmt.get({ hash });
	}

	public getAllTransactions(): Iterable<Contracts.TransactionPool.StoredTransaction> {
		return this.#getAllTransactionsStmt.all() as Iterable<Contracts.TransactionPool.StoredTransaction>;
	}

	public getOldTransactions(
		blockNumber: number,
		limit: number = -1,
	): Iterable<Contracts.TransactionPool.StoredTransaction> {
		return this.#getOldTransactionsStmt.all({
			blockNumber,
			limit: limit === -1 ? Number.MAX_SAFE_INTEGER : limit,
		}) as Iterable<Contracts.TransactionPool.StoredTransaction>;
	}

	public removeTransaction(hash: string): void {
		this.#removeTransactionStmt.run({ hash });
	}

	public flush(): void {
		this.#flushStmt.run();
	}

	public getDatabase(): BetterSqlite3.Database {
		return this.#database;
	}
}
