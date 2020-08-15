interface ThumbnailsUrlCache {
	add: (objectUrl: string, postId: number) => void;
	revokeAll: () => void;
	returnIfExists: (postId: number) => string | undefined;
}

interface UrlCache {
	[key: string]: string;
}

interface ImageUrlCache {
	postId: number;
	objectUrl: string;
}

const createPermanentCache = (): ThumbnailsUrlCache => {
	const log = window.log;
	let cache: UrlCache = {};

	const add = (objectUrl: string, postId: number): void => {
		cache = {
			...cache,
			[postId.toString()]: objectUrl,
		};
	};

	const revokeAll = (): void => {
		const prevCache = { ...cache };
		cache = {};

		const keys = Object.keys(prevCache);
		keys.forEach((key) => {
			URL.revokeObjectURL(cache[key]);
		});
		log.debug(`Revoked ${keys.length} object urls.`);
	};

	const returnIfExists = (postId: number): string | undefined => {
		const url = cache[postId.toString()];
		return url ? url : undefined;
	};

	return { add, revokeAll, returnIfExists };
};

const createRotatingCache = (): ThumbnailsUrlCache => {
	const log = window.log;
	const cacheSize = 5;
	let cache: ImageUrlCache[] = [];

	const add = (objectUrl: string, postId: number): void => {
		if (!cache.find((c) => c.postId === postId)) {
			if (cache.length < cacheSize) {
				cache = [...cache, { postId, objectUrl }];
			} else {
				URL.revokeObjectURL(cache[0].objectUrl);
				cache = [...cache.slice(1), { postId, objectUrl }];
			}
		}
	};

	const revokeAll = (): void => {
		const prevCache = [...cache];
		cache = [];

		prevCache.forEach((c) => {
			URL.revokeObjectURL(c.objectUrl);
		});
		log.debug(`Revoked ${prevCache.length} object urls.`);
	};

	const returnIfExists = (postId: number): string | undefined => {
		return cache.find((c) => c.postId === postId)?.objectUrl;
	};

	return { add, revokeAll, returnIfExists };
};

export const imageCache = createRotatingCache();

export const thumbnailCache = createPermanentCache();
