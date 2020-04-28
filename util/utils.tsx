import { Tag, Rating } from '../types/gelbooruTypes';
import { Entity } from '../db/types';

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
	}
};

export const getImageExtensionFromFilename = (fileName: string): string => {
	const regExpResult = fileName.match('[^.]+$');
	if (regExpResult) {
		return regExpResult[0];
	} else {
		console.error('Could not infer extension from filename');
		throw 'Could not infer extension from filename';
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
