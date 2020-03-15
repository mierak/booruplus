import * as posts from './posts';
import * as tags from './tags';
import * as savedSearches from './savedSearches';

export const { saveOrUpdatePostFromApi, updatePostInDb, bulkUpdatePostsInDb, getFavoritePosts, getPostsForTags } = posts;
export const {
	saveTag,
	saveTags,
	loadTags,
	getFavoritePostCountForTag,
	getDownloadedPostCountForTag,
	getBlacklistedPostCountForTag
} = tags;
export const { saveSearch, getSavedSearches, deleteSavedSearch } = savedSearches;
