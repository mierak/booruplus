import { getThumbnailBorder } from '../../src/util/componentUtils';

describe('componentUtils', () => {
	describe('getThumbnailBorder', () => {
		it('Returns correct CSS border value', () => {
			// given

			// when
			const result1 = getThumbnailBorder('true', 'dark');
			const result2 = getThumbnailBorder('false', 'dark');
			const result3 = getThumbnailBorder('true', 'light');
			const result4 = getThumbnailBorder('false', 'light');

			// then
			expect(result1).toBe('dashed 1px white');
			expect(result2).toBe(undefined);
			expect(result3).toBe('dashed 1px black');
			expect(result4).toBe(undefined);
		});
	});
});
