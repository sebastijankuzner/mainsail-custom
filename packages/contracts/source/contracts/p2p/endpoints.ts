import Hapi from "@hapi/hapi";

import { IBlockData } from "../crypto";
import { DownloadBlock } from "../shared";
import { IHeaderData } from "./header";
import { PeerBroadcast, PeerPingResponse } from "./peer";

export interface IGetBlocksRequest extends Hapi.Request {
	payload: {
		lastBlockHeight: number;
		blockLimit: number;
	};
}

export type IGetBlocksResponse = DownloadBlock[];

export interface IGetCommonBlocksRequest extends Hapi.Request {
	payload: {
		ids: string[];
	};
}

export interface IGetCommonBlocksResponse {
	common: IBlockData;
	lastBlockHeight: number;
}

export interface IGetMessagesRequest extends Hapi.Request {
	payload: {
		headers: IHeaderData;
	};
}

export interface IGetMessagesResponse {
	precommits: string[];
	prevotes: string[];
}

export type IGetPeersResponse = PeerBroadcast[];

export type IGetStatusResponse = PeerPingResponse;

export interface IGetProposalRequest extends Hapi.Request {
	payload: {
		headers: IHeaderData;
	};
}

export interface IGetProposalResponse {
	proposal: string;
}

export interface IPostBlockRequest extends Hapi.Request {
	payload: {
		block: Buffer;
	};
}

export interface IPostBlockResponse {
	status: boolean;
	height: number;
}

export interface IPostPrecommitRequest extends Hapi.Request {
	payload: {
		precommit: Buffer;
	};
}

export interface IPostPrecommitResponse {}

export interface IPostPrevoteRequest extends Hapi.Request {
	payload: {
		prevote: Buffer;
	};
}

export interface IPostPrevoteResponse {}

export interface IPostProposalRequest extends Hapi.Request {
	payload: {
		proposal: Buffer;
	};
}

export interface IPostProposalResponse {}

export interface IPostTransactionsRequest extends Hapi.Request {
	payload: {
		transactions: Buffer[];
	};
}

export type IPostTransactionsResponse = string[];