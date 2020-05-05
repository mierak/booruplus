import React from 'react';
import { Tag } from 'antd';

import { Tag as GelbooruTag } from '../../types/gelbooruTypes';
import { getTagColor, capitalize } from '../../util/utils';

interface Props {
	className?: string;
	tag: GelbooruTag;
}

const TagSelectOption: React.FunctionComponent<Props> = (props: Props) => {
	return (
		<>
			<Tag color={getTagColor(props.tag)}>{capitalize(props.tag.type)}</Tag>
			{props.tag.tag} | Count: {props.tag.count}
		</>
	);
};

export default TagSelectOption;
