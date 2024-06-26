import { Constants } from "@mainsail/contracts";

export const constants = {
	CHECK_HEADER_DELAY: 2000,

	MAX_DOWNLOAD_BLOCKS: 400, // maximum number of blocks we can download at once
	MAX_DOWNLOAD_BLOCKS_JOBS: 10, // maximum number of blocks jobs

	MAX_PAYLOAD_CLIENT: 50 * Constants.Units.MEGABYTE, // default maxPayload value on the WS socket client
	MAX_PAYLOAD_SERVER: 30 * Constants.Units.MEGABYTE,

	MAX_PEERS_GET_API_NODES: 100,
	// default maxPayload value on the  WS socket server
	MAX_PEERS_GET_PEERS: 500,
};
