import React, { useState } from 'react';
import { Checkbox, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { TagType } from '../../types/gelbooruTypes';
import { capitalize } from '../../util/utils';

interface Props {
	className?: string;
	visible: boolean;
	confirm: () => void;
	onSearch(types: TagType[]): void;
}

const TypeSearchFilter: React.FunctionComponent<Props> = (props: Props) => {
	const types: TagType[] = ['artist', 'character', 'copyright', 'metadata', 'tag'];
	const [selectedTypes, setSelectedTypes] = useState<TagType[]>(types);

	const handleConfirm = (): void => {
		props.onSearch(selectedTypes);
		props.confirm();
	};

	const handleReset = (): void => {
		setSelectedTypes(types);
		props.onSearch(types);
		props.confirm();
	};

	const handleCheckboxClick = (type: TagType, checked: boolean): void => {
		if (!checked) {
			setSelectedTypes(selectedTypes.filter((t) => type !== t));
		} else {
			setSelectedTypes([...selectedTypes, type]);
		}
	};

	const handleEnterPress = (event: React.KeyboardEvent<HTMLDivElement>): void => {
		if (event.key === 'Enter') {
			handleConfirm();
		}
	};

	return (
		<div style={{ padding: 8 }} onKeyPress={handleEnterPress} data-testid="type-search-filter-container">
			<Space direction="vertical">
				{types.map((type) => {
					return (
						<Checkbox
							key={type}
							checked={selectedTypes.includes(type)}
							onChange={(event): void => handleCheckboxClick(type, event.target.checked)}
						>
							{capitalize(type)}
						</Checkbox>
					);
				})}
				<Space direction="horizontal">
					<Button type="primary" onClick={handleConfirm} icon={<SearchOutlined />} size="small">
						OK
					</Button>
					<Button onClick={handleReset} size="small">
						Reset
					</Button>
				</Space>
			</Space>
		</div>
	);
};

export default TypeSearchFilter;
