import { createObjectURL, revokeObjectURL } from '../helpers/window.mock';
import { imageCache, thumbnailCache, mostViewedCache } from '../../src/util/objectUrlCache';

describe('util/objectUrlCache', () => {
	Object.defineProperty(window, 'URL', {
		value: {
			createObjectURL: createObjectURL,
			revokeObjectURL: revokeObjectURL,
		},
	});
	describe('imageCache', () => {
		it('Returns undefined when cache is empty', () => {
			// given
			const cache = imageCache;

			// when
			const result = cache.getIfPresent(123);

			// then
			expect(result).toBe(undefined);
		});
		it('Returns cached string', () => {
			// given
			const id = 123;
			const url = 'testUrl123456';
			const cache = imageCache;
			cache.add(url, id);

			// when
			const result = cache.getIfPresent(id);

			// then
			expect(result).toBe(url);
		});
		it('Revokes all cached urls', () => {
			// given
			const ids = [123, 456, 789];
			const cache = imageCache;
			ids.forEach((id) => cache.add('urlasd', id));

			// when
			cache.revokeAll();
			const result0 = cache.getIfPresent(ids[0]);
			const result1 = cache.getIfPresent(ids[1]);
			const result2 = cache.getIfPresent(ids[2]);

			// then
			expect(result0).toBe(undefined);
			expect(result1).toBe(undefined);
			expect(result2).toBe(undefined);
		});
		it('Removes first element in cache when another is added', () => {
			// given
			const ids = [123, 456, 789, 147, 258, 369];
			const cache = imageCache;
			ids.forEach((id) => cache.add('urlasd', id));

			// when
			const result0 = cache.getIfPresent(ids[0]);
			const result1 = cache.getIfPresent(ids[1]);

			// then
			expect(result0).toBe(undefined);
			expect(result1).toBe('urlasd');
		});
	});
	describe('thumbnailCache', () => {
		it('Returns undefined when cache is empty', () => {
			// given
			const cache = thumbnailCache;

			// when
			const result = cache.getIfPresent(123);

			// then
			expect(result).toBe(undefined);
		});
		it('Returns cached string', () => {
			// given
			const id = 123;
			const url = 'testUrl123456';
			const cache = thumbnailCache;
			cache.add(url, id);

			// when
			const result = cache.getIfPresent(id);

			// then
			expect(result).toBe(url);
		});
		it('Revokes all cached urls', () => {
			// given
			const ids = [123, 456, 789];
			const cache = thumbnailCache;
			ids.forEach((id) => cache.add('urlasd', id));

			// when
			cache.revokeAll();
			const result0 = cache.getIfPresent(ids[0]);
			const result1 = cache.getIfPresent(ids[1]);
			const result2 = cache.getIfPresent(ids[2]);

			// then
			expect(result0).toBe(undefined);
			expect(result1).toBe(undefined);
			expect(result2).toBe(undefined);
		});
	});
	describe('mostViewedCache', () => {
		it('Returns undefined when cache is empty', () => {
			// given
			const cache = mostViewedCache;

			// when
			const result = cache.getIfPresent(123);

			// then
			expect(result).toBe(undefined);
		});
		it('Returns cached string', () => {
			// given
			const id = 123;
			const url = 'testUrl123456';
			const cache = mostViewedCache;
			cache.add(url, id);

			// when
			const result = cache.getIfPresent(id);

			// then
			expect(result).toBe(url);
		});
		it('Revokes all cached urls', () => {
			// given
			const ids = [123, 456, 789];
			const cache = mostViewedCache;
			ids.forEach((id) => cache.add('urlasd', id));

			// when
			cache.revokeAll();
			const result0 = cache.getIfPresent(ids[0]);
			const result1 = cache.getIfPresent(ids[1]);
			const result2 = cache.getIfPresent(ids[2]);

			// then
			expect(result0).toBe(undefined);
			expect(result1).toBe(undefined);
			expect(result2).toBe(undefined);
		});
	});
});
