import {
	capitalize,
	isExtensionVideo,
	getRatingName,
	intersection,
	escapeTag,
	sortTagsByType,
	getTagColor,
	getImageExtensionFromFilename,
	compareTagArrays,
	toAscii,
	validateApiKey,
	isFilenameVideo,
} from '../src/util/utils';
import { mTag } from './helpers/test.helper';
import { Rating } from '../src/types/gelbooruTypes';

describe('utils/utils', () => {
	describe('capitalize()', () => {
		it('Correctly converts only the first character to upper case', () => {
			// given
			const testString = 'test123';

			// when
			const capitalized = capitalize(testString);

			// then
			expect(capitalized.charAt(0)).toEqual('T');
			expect(capitalized.substr(1)).toEqual('est123');
		});
	});
	describe('isExtensionVideo()', () => {
		it('Correctly asserts that extension is a video', () => {
			// given
			const gif = 'gif';
			const webm = 'webm';
			const mp4 = 'mp4';
			const avi = 'avi';

			// when
			const gifResult = isExtensionVideo(gif);
			const webmResult = isExtensionVideo(webm);
			const mp4Result = isExtensionVideo(mp4);
			const aviResult = isExtensionVideo(avi);

			// then
			expect(gifResult).toBe(false);
			expect(webmResult).toBe(true);
			expect(mp4Result).toBe(true);
			expect(aviResult).toBe(false);
		});
	});
	describe('isFilenameVideo()', () => {
		it('Correctly asserts that extension is a video', () => {
			// given
			const jpg = '03b03b20924cfe803694045c22ff6c92.jpg';
			const webm = '03b03b20924cfe803694045c22ff6c92.webm';
			const mp4 = '03b03b20924cfe803694045c22ff6c92.mp4';
			const png = '03b03b20924cfe803694045c22ff6c92.png';

			// when
			const jpgResult = isFilenameVideo(jpg);
			const webmResult = isFilenameVideo(webm);
			const mp4Result = isFilenameVideo(mp4);
			const pngResult = isFilenameVideo(png);

			// then
			expect(jpgResult).toBe(false);
			expect(webmResult).toBe(true);
			expect(mp4Result).toBe(true);
			expect(pngResult).toBe(false);
		});
	});
	describe('getRatingName()', () => {
		it('Correctly transforms any', () => {
			// given
			const rating: Rating = 'any';

			// when
			const result = getRatingName(rating);

			// then
			expect(result).toBe('any');
		});
		it('Correctly transforms safe', () => {
			// given
			const rating: Rating = 'safe';

			// when
			const result = getRatingName(rating);

			// then
			expect(result).toBe('s');
		});
		it('Correctly transforms questionable', () => {
			// given
			const rating: Rating = 'questionable';

			// when
			const result = getRatingName(rating);

			// then
			expect(result).toBe('q');
		});
		it('Correctly transforms explicit', () => {
			// given
			const rating: Rating = 'explicit';

			// when
			const result = getRatingName(rating);

			// then
			expect(result).toBe('e');
		});
	});
	describe('intersection()', () => {
		it('Correctly creates intersection of Entity arrays', () => {
			// given
			const arr1 = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
			const arr2 = [{ id: 2 }, { id: 3 }, { id: 5 }];
			const expected = [{ id: 2 }, { id: 3 }, { id: 5 }];

			// when
			const result = intersection(arr1, arr2);

			// then
			expect(result).toStrictEqual(expected);
		});
	});
	describe('escapeTag()', () => {
		it('Correctly escapes plus character', () => {
			// given
			const tag = 'test+test';
			const escapeTo = '%2b';

			// when
			const result = escapeTag(tag);

			// then
			expect(result).toBe(`test${escapeTo}test`);
		});
	});
	describe('sortTagsByType()', () => {
		it('Correctly sorts tags', () => {
			// given
			const tags = [
				mTag({ type: 'character', id: 1 }),
				mTag({ type: 'character', id: 2 }),
				mTag({ type: 'tag', id: 3 }),
				mTag({ type: 'tag', id: 4 }),
				mTag({ type: 'artist', id: 5 }),
				mTag({ type: 'artist', id: 6 }),
				mTag({ type: 'metadata', id: 7 }),
				mTag({ type: 'metadata', id: 8 }),
				mTag({ type: 'copyright', id: 9 }),
				mTag({ type: 'copyright', id: 10 }),
			];

			//when
			const result = sortTagsByType(tags);

			// then
			const resultIds = result.map((tag) => tag.id);
			expect(resultIds).toEqual([5, 6, 1, 2, 9, 10, 7, 8, 3, 4]);
		});
	});
	describe('getTagColor()', () => {
		it('Works for both string and Tag instance', () => {
			// given
			const tagString = 'artist';
			const tagInstance = mTag({ type: 'artist' });

			// when
			const tagStringResult = getTagColor(tagString);
			const tagInstanceResult = getTagColor(tagInstance);

			// then
			expect(tagStringResult).toBe('volcano');
			expect(tagInstanceResult).toBe('volcano');
		});
		it('Returns correct value for all possible arguments', () => {
			// given
			const artist = 'artist';
			const character = 'character';
			const metadata = 'metadata';
			const tag = 'tag';
			const copyright = 'copyright';
			const undef = 'asdf';

			// when
			const artistResult = getTagColor(artist);
			const characterResult = getTagColor(character);
			const metadataResult = getTagColor(metadata);
			const tagResult = getTagColor(tag);
			const copyrightResult = getTagColor(copyright);
			const undefResult = getTagColor(undef);

			// then
			expect(artistResult).toBe('volcano');
			expect(characterResult).toBe('green');
			expect(metadataResult).toBe('orange');
			expect(tagResult).toBe('blue');
			expect(copyrightResult).toBe('magenta');
			expect(undefResult).toBe(undefined);
		});
	});
	describe('getImageExtensionFromFilename()', () => {
		it('Correctly extracts extension from filename', () => {
			// given
			const filename1 = '03b03b20924cfe803694045c22ff6c92.jpg';
			const filename2 = '90cb4e09a446cc7fbee5693263cadaa2.png';
			const filename3 = '90cb4.e0.9a$44#6c%c7^fb&ee*56(93)26_=-!/3cadaa2.png';

			//when
			const result1 = getImageExtensionFromFilename(filename1);
			const result2 = getImageExtensionFromFilename(filename2);
			const result3 = getImageExtensionFromFilename(filename3);

			// then
			expect(result1).toBe('jpg');
			expect(result2).toBe('png');
			expect(result3).toBe('png');
		});
		it('Throws an error when theres no dot in filename', () => {
			// given
			const filename1 = '03b03b20924cfe803694045c22ff6c92jpg';

			//when
			const throwsError = (): void => {
				getImageExtensionFromFilename(filename1);
			};

			// then
			expect(throwsError).toThrow();
		});

		it('Throws an error when filename is empty', () => {
			// given
			const filename1 = '';

			//when
			const throwsError = (): void => {
				getImageExtensionFromFilename(filename1);
			};

			// then
			expect(throwsError).toThrow();
		});
	});
	describe('compareTagArrays()', () => {
		it('Returns false when arrays have different length', () => {
			// given
			const arr1 = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' })];
			const arr2 = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' }), mTag({ tag: 'tag3' })];

			// when
			const result = compareTagArrays(arr1, arr2);

			// then
			expect(result).toBe(false);
		});
		it('Returns false when arrays are of the same length but not equal', () => {
			// given
			const arr1 = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' })];
			const arr2 = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag3' })];

			// when
			const result = compareTagArrays(arr1, arr2);

			// then
			expect(result).toBe(false);
		});
		it('Returns true when arrays are equal', () => {
			// given
			const arr1 = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' })];
			const arr2 = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' })];

			// when
			const result = compareTagArrays(arr1, arr2);

			// then
			expect(result).toBe(true);
		});
	});
	describe('toAscii()', () => {
		it('Return ASCII code of character', () => {
			// given
			const character = 'A';

			// when
			const result = toAscii(character);

			// then
			expect(result).toBe(65);
		});
		it('Throws Error when supplied string is not a single character', () => {
			// given
			const str = 'asdf';

			// when
			const testCall = (): number => toAscii(str);

			// then
			expect(testCall).toThrowError('Cannot convert character to ASCII because supplied string has more than 1 character');
		});
	});
	describe('validateApiKey()', () => {
		it('Validates empty key', () => {
			// given
			const key = '';

			// when
			const result = validateApiKey(key);

			// then
			expect(result).toBe(true);
		});
		it('Validates correct API key', () => {
			// given
			const key = '&api_key=bfa4dc4a96d3ckb2hccf39be27fg9s74409cf50a9529696g85e7b18106as1fa0&user_id=120';

			// when
			const result = validateApiKey(key);

			// then
			expect(result).toBe(true);
		});
		it('Invalidates incorrect API key', () => {
			// given
			const key1 = '&api_key=bfa4dc4a96d3ckb2hccf39be27fg9s74409cf50a9529696g85e7b18106as1fa0&user_id120';
			const key2 = '&api_key=bfa4dc4a96d3ckb2hccf39be27fg9s74409cf50a9529696g85e7b18106as1fa0user_id=120';
			const key3 = '&api_key=bfa4dc4a96d3ckb2hccf39be27fg9s74409cf50a9529696g85e7b18106as1fa0&userid=120';
			const key4 = 'api_key=bfa4dc4a96d3ckb2hccf39be27fg9s74409cf50a9529696g85e7b18106as1fa0&user_id=120';
			const key5 = '&api_keybfa4dc4a96d3ckb2hccf39be27fg9s74409cf50a9529696g85e7b18106as1fa0&user_id=120';
			const key6 = '&api_key=bfa4dc4a96d3ckb2hccf39be27fg9s74409cf50a929696g85e7b18106as1fa0&user_id=120';

			// when
			const result1 = validateApiKey(key1);
			const result2 = validateApiKey(key2);
			const result3 = validateApiKey(key3);
			const result4 = validateApiKey(key4);
			const result5 = validateApiKey(key5);
			const result6 = validateApiKey(key6);

			// then
			expect(result1).toBe(false);
			expect(result2).toBe(false);
			expect(result3).toBe(false);
			expect(result4).toBe(false);
			expect(result5).toBe(false);
			expect(result6).toBe(false);
		});
	});
});
