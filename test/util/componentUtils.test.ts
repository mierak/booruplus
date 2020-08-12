import { getThumbnailBorder } from '../../src/util/componentUtils';

describe('componentUtils', () => {
	describe('getThumbnailBorder', () => {
		it('Returns correct CSS border value', () => {
			// given

			// when
			const result1 = getThumbnailBorder('true', 'dark', false);
			const result2 = getThumbnailBorder('false', 'dark', false);
			const result3 = getThumbnailBorder('true', 'light', false);
			const result4 = getThumbnailBorder('false', 'light', false);
			const result5 = getThumbnailBorder('false', 'light', true);
			const result6 = getThumbnailBorder('true', 'light', true);

			// then
			expect(result1).toBe('dashed 1px white');
			expect(result2).toBe(undefined);
			expect(result3).toBe('dashed 1px black');
			expect(result4).toBe(undefined);
			expect(result5).toBe('solid 1px #177ddc');
			expect(result6).toBe('dashed 1px #177ddc');
		});
	});
});
