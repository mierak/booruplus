import { SavedSearch } from '@appTypes/gelbooruTypes';
import { registerErrorNotification } from './errorNotificationRegistry';
import { ErrorWithNotification } from './types';

export class SavedSearchNotFoundError extends ErrorWithNotification {
	constructor(message: string) {
		super(message);
	}
}

registerErrorNotification(SavedSearchNotFoundError, {
	title: 'Saved Search not found',
	message: 'No Saved Search with given parameters was found.',
});

export class SavedSearchAlreadyExistsError extends ErrorWithNotification {
	readonly savedSearch: SavedSearch;

	constructor(savedSearch: SavedSearch) {
		super(
			`Saved Search already exists. Tags: [${savedSearch.tags
				.map((tag) => tag.tag)
				.join(', ')}] ExcludedTags: [${savedSearch.excludedTags.map((tag) => tag.tag).join(', ')}] Rating: [${savedSearch.rating}]`
		);
		this.savedSearch = savedSearch;
		this.name = 'SavedSearchAlreadyExistsError';
	}
}

registerErrorNotification(SavedSearchAlreadyExistsError, {
	icon: 'warning',
	title: 'Saved Search already exists',
	message: 'Could not save search because it already exists in the database. Existing saved search will be set as active!',
});

export class NoActiveSavedSearchError extends ErrorWithNotification {
	constructor() {
		super('Cannot add preview(s) to Saved Search. No Saved Search is set as active.');
		this.name = 'SavedSearchAlreadyExistsError';
	}
}

registerErrorNotification(NoActiveSavedSearchError, {
	title: 'Saved Search already exists',
	message: 'Could not save search because it already exists in the database. Existing saved search will be set as active!',
});
