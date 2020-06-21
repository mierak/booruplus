import React from 'react';
import { render, screen } from '@testing-library/react';
import TagSelectOption from '../../src/components/TagSelectOption';
import { mTag } from '../helpers/test.helper';

describe('TagSelectOption', () => {
	it('Renders tag correctly', () => {
		// given
		const tag = mTag({
			id: 123,
			tag: 'Test_tag123',
			type: 'character',
		});

		// when
		render(<TagSelectOption tag={tag} />);

		// then
		expect(screen.queryByText('Character')).not.toBeNull();
		expect(screen.queryByText('Test_tag123 | Count: 123')).not.toBeNull();
	});
});
