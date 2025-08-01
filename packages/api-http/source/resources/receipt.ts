import { Models } from "@mainsail/api-database";
import { injectable } from "@mainsail/container";
import { Contracts } from "@mainsail/contracts";

@injectable()
export class ReceiptResource implements Contracts.Api.Resource {
	public raw(resource: Models.Receipt): object {
		return resource;
	}

	public transform(resource: Models.Receipt): object {
		return resource;
	}
}
