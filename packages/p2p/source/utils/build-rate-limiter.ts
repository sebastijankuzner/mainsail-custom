import { Routes } from "../enums.js";
import { RateLimiter } from "../rate-limiter.js";

export const buildRateLimiter = (options) =>
	new RateLimiter({
		configurations: {
			endpoints: [
				{
					endpoint: Routes.GetBlocks,
					rateLimit: 5,
				},
				{
					endpoint: Routes.GetPeers,
					rateLimit: 1,
				},
				{
					endpoint: Routes.GetStatus,
					rateLimit: 2,
				},
				{
					duration: 2,
					endpoint: Routes.PostProposal,
					rateLimit: 2,
				},
				{
					endpoint: Routes.PostPrevote,
					rateLimit: options.roundValidators,
				},
				{
					endpoint: Routes.PostPrecommit,
					rateLimit: options.roundValidators,
				},
				{
					endpoint: Routes.GetMessages,
					rateLimit: 5,
				},
				{
					endpoint: Routes.GetProposal,
					rateLimit: 5,
				},
			],
			global: {
				rateLimit: options.rateLimit,
			},
		},
		whitelist: [...options.whitelist, ...options.remoteAccess],
	});
