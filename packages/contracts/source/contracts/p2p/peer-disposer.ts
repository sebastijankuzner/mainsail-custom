import { NesError } from "./nes.js";

export interface PeerDisposer {
	banPeer(ip: string, error: Error | NesError): void;
	disposePeer(ip: string): void;
	disposePeers(): Promise<void>;
	isBanned(ip: string): boolean;
	bannedPeers(): { ip: string; timeout: number }[];
}
