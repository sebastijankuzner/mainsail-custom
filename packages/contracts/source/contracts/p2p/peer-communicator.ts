import {
	GetApiNodesResponse,
	GetBlocksResponse,
	GetMessagesResponse,
	GetPeersResponse,
	GetProposalResponse,
	GetStatusResponse,
} from "./endpoints.js";
import { Peer } from "./peer.js";

export type EmitOptions = {
	timeout: number;
};

export interface PeerCommunicator {
	postProposal(peer: Peer, proposal: Buffer): Promise<void>;
	postPrevote(peer: Peer, prevote: Buffer): Promise<void>;
	postPrecommit(peer: Peer, prevote: Buffer): Promise<void>;

	pingPorts(peer: Peer): Promise<void>;

	getPeers(peer: Peer): Promise<GetPeersResponse>;
	getApiNodes(peer: Peer): Promise<GetApiNodesResponse>;
	getMessages(peer: Peer): Promise<GetMessagesResponse>;
	getProposal(peer: Peer): Promise<GetProposalResponse>;
	getBlocks(
		peer: Peer,
		{ fromBlockNumber, limit }: { fromBlockNumber: number; limit?: number },
		options?: Partial<EmitOptions>,
	): Promise<GetBlocksResponse>;
	getStatus(peer: Peer, options?: Partial<EmitOptions>): Promise<GetStatusResponse>;
}
