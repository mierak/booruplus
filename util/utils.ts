import { Tag } from '../types/gelbooruTypes';

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
