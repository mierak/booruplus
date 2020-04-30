# Changelog
## 0.1.2 - TITLE - DATE
- Added basic controls (show tags, open in browser) to gifs and videos
- Added Downloads drawer which saves all your batch downloads and allows you to view what posts were downloaded. For now it stores an infinite amount of download tasks.
- Light Mode:
	- Fixed scrollbars background and border
	- Fixed active thumbnail border in thumbnails view
- BUG FIX: Animated gifs were showing only the first frame
- Backend:
	- Completely refactored all thunks to use createAsyncThunk
	- With above change, all slices now react to thunks via extreReducers with builder pattern
	- Installed circular dependency plugin and removed all circular dependencies from store codebase

## 0.1.1 - Favorites directory tree - 24.4.2020
- Added directory tree to favorites view
	- Create folder structure and save favorites post in them
	- Folders can be create/delete
	- Posts can be freely moved between directories
- Completely revamped modals
- Some more notifications are shown as a response to users actions