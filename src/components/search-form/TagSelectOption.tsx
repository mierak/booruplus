import React from 'react';
import { Tag } from 'antd';

import { Tag as GelbooruTag } from '@appTypes/gelbooruTypes';
import { getTagColor, capitalize } from '@util/utils';

type Props = {
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
