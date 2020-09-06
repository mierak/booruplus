import moment from 'moment';

import { Tag, Rating, PostDto, Post } from '@appTypes/gelbooruTypes';
import { Entity } from '@db/types';

export const getTagColor = (tag: Tag | string): string | undefined => {
	const type = typeof tag === 'string' ? tag : tag.type;
	switch (type) {
		case 'artist':
			return 'volcano';
		case 'copyright':
			return 'magenta';
		case 'metadata':
			return 'orange';
		case 'tag':
			return 'blue';
		case 'character':
			return 'green';
		default:
			return undefined;
	}
};

export const getImageExtensionFromFilename = (fileName: string): string => {
	const regExpResult = fileName.match('[^.]+$');
	if (fileName.includes('.') && regExpResult) {
		return regExpResult[0];
	} else {
		throw new Error('Could not infer extension from filename');
	}
};

export const intersection = <T extends Entity>(...arrays: T[][]): T[] => {
	const ordered = arrays.length === 1 ? arrays : arrays.sort((a1, a2) => a1.length - a2.length),
		shortest = ordered[0],
		set = new Set(),
		result = [];
	for (let i = 0; i < shortest.length; i++) {
		const item = shortest[i];
		let every = true;
		for (let j = 1; j < ordered.length; j++) {
			if (ordered[j].some((p) => p.id === item.id)) continue;
			every = false;
			break;
		}
		if (!every || set.has(item)) continue;
		set.add(item);
		result[result.length] = item;
	}
	return result;
};

export const capitalize = (string: string): string => {
	return `${string.charAt(0).toUpperCase()}${string.slice(1)}`;
};

export const delay = (ms: number): Promise<void> => new Promise((_) => setTimeout(_, ms));

export const isExtensionVideo = (extension: string): boolean => {
	return extension === 'mp4' || extension === 'webm';
};

export const isFilenameVideo = (filename: string): boolean => {
	return isExtensionVideo(getImageExtensionFromFilename(filename));
};

export const getRatingName = (rating: Rating): string => {
	switch (rating) {
		case 'any':
			return 'any';
		case 'explicit':
			return 'e';
		case 'questionable':
			return 'q';
		case 'safe':
			return 's';
	}
};

export const escapeTag = (tag: string): string => {
	return tag.replace('+', '%2b');
};

export const sortTagsByType = (tags: Tag[]): Tag[] => {
	const copyrightTags: Tag[] = [];
	const tagTags: Tag[] = [];
	const artistTags: Tag[] = [];
	const metadataTags: Tag[] = [];
	const characterTags: Tag[] = [];

	for (const tag of tags) {
		switch (tag.type) {
			case 'artist':
				artistTags.push(tag);
				break;
			case 'character':
				characterTags.push(tag);
				break;
			case 'copyright':
				copyrightTags.push(tag);
				break;
			case 'metadata':
				metadataTags.push(tag);
				break;
			case 'tag':
				tagTags.push(tag);
				break;
		}
	}
	return [...artistTags, ...characterTags, ...copyrightTags, ...metadataTags, ...tagTags];
};

/**
 * Compares two arrays of tags
 * @param arr1 first array to compare
 * @param arr2 second array to compare
 * @returns False if arrays have different length and when arrays dont contain the same tags. True if all tags are in both arrays
 */
export const compareTagArrays = (arr1: Tag[], arr2: Tag[]): boolean => {
	if (arr1.length !== arr2.length) {
		return false;
	}

	const arr1Strings = arr1.map((tag) => tag.tag);
	const arr2Strings = arr2.map((tag) => tag.tag);

	const both = [...arr1Strings, ...arr2Strings];

	return both.every((tag) => arr1Strings.includes(tag) && arr2Strings.includes(tag));
};

export const validateApiKey = (key?: string): boolean => {
	if (!key || key.length === 0) {
		return true;
	} else {
		return /^(?=.*&api_key=)(?=.*&user_id=)(?=.*[a-z0-9]{64})(?=.*[0-9]{1,}).*$/.test(key);
	}
};

export const toAscii = (c: string): number => {
	if (c.length > 1) throw new Error('Cannot convert character to ASCII because supplied string has more than 1 character');
	return c.charCodeAt(0);
};

export const postParser = (): ((params: PostDto) => Post) => {
	const domParser = new DOMParser();

	const parseTags = (tagString: string): string[] => {
		const array = tagString.split(' ');
		const result = array.map((tag) => {
			const parsed = domParser.parseFromString(tag, 'text/html').documentElement.textContent;
			if (parsed === null || parsed === undefined) throw `Could not parse tag ${tag}`;
			return parsed;
		});
		return result;
	};

	const parsePost = (params: PostDto): Post => {
		const post: Post = {
			source: params.source,
			directory: params.directory,
			hash: params.hash,
			height: params.height,
			width: params.width,
			id: params.id,
			owner: params.owner,
			parentId: params.parent_id,
			rating: params.rating,
			sample: params.sample,
			sampleHeight: params.sample_height,
			sampleWidth: params.sample_width,
			score: params.score,
			fileUrl: params.file_url,
			createdAt: moment(params.created_at).unix(),
			image: params.image,
			blacklisted: params.blacklisted !== undefined ? params.blacklisted : 0,
			downloaded: params.downloaded !== undefined ? params.downloaded : 0,
			selected: false,
			tags: parseTags(params.tags),
			extension: getImageExtensionFromFilename(params.image),
			viewCount: 0,
		};
		return post;
	};

	return parsePost;
};

export const blobToBase64 = (blob: Blob): Promise<string | undefined> => {
	const reader = new FileReader();
	return new Promise((resolve, reject) => {
		reader.onerror = (): void => {
			reader.abort();
			reject(new Error('Error while converting blob to base64'));
		};
		reader.onload = (): void => {
			const result = reader.result;
			if (typeof result === 'string') {
				resolve(result);
			} else {
				resolve(undefined);
			}
		};
		reader.readAsDataURL(blob);
	});
};

interface IndexFromRowColParams {
	rowIndex: number;
	columnIndex: number;
	columns: number;
}
export const getIndexFromRowCol = ({ rowIndex, columnIndex, columns }: IndexFromRowColParams): number => {
	return rowIndex * columns + columnIndex;
};

interface RowColFromIndexParams {
	index: number;
	columns: number;
}
export const getRowColFromIndex = ({ index, columns }: RowColFromIndexParams): { rowIndex: number; columnIndex: number } => {
	return {
		rowIndex: Math.floor(index / columns),
		columnIndex: index % columns,
	};
};

export const addThousandsSeparator = (number: number, separator?: string): string => {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator ?? ' ');
};

export const formatPercentProgress = (done: number, total: number): string => {
	return `${addThousandsSeparator(Math.round(done / 1024 / 1024))} MB / ${addThousandsSeparator(Math.round(total / 1024 / 1024))} MB.`;
};
