import React from 'react';
import { Tag } from 'antd';
import { Tag as GelbooruTag } from '../../types/gelbooruTypes';
import { getTagColor } from '../../util/utils';

interface Props {
	className?: string;
	tag: GelbooruTag;
}

const TagSelectOption: React.FunctionComponent<Props> = (props: Props) => {
	const capitalize = (string: string): string => {
		return `${string.charAt(0).toUpperCase()}${string.slice(1)}`;
	};

	return (
		<div>
			<Tag color={getTagColor(props.tag)}>{capitalize(props.tag.type)}</Tag>
			{props.tag.tag} | Count: {props.tag.count}
		</div>
	);
};

export default TagSelectOption;
