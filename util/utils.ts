import { Tag, Entity } from '../types/gelbooruTypes';

export const getTagColor = (tag: Tag): string => {
	switch (tag.type) {
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

export const prefixDataWithContentType = (data: string, extension: string): string => {
	let prefix = 'data:';
	const suffix = ';base64,';
	switch (extension) {
		case 'jpg':
			prefix += 'image/jpg';
			break;
		case 'jpeg':
			prefix += 'image/jpeg';
			break;
		case 'png':
			prefix += 'image/png';
			break;
		case 'gif':
			prefix += 'image/gif';
			break;
		case 'webm':
			prefix += 'video/webm';
			break;
		case 'mp4':
			prefix += 'video/mp4';
			break;
		default:
			throw 'Unsupported content type';
	}
	return `${prefix}${suffix}${data}`;
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
