# Changelog
## 0.1.4 - TITLE - DATE
- Thumbnails Page now scrolls to active post
- BUG FIX: Tasks completely failing when no tasks were present in DB
- BUG FIX: Tasks cancellation was not saved to database
- BUG FIX: Blacklisted posts not removing from currently displayed posts
- BUG FIX: Online search showing blacklisted posts

## 0.1.3 - New Tags page - 9.5.2020
- Changed Settings to be contained in a Modal window
- Added options to disable loading of dashboard statistics on App start
- Add pagination to Tags page, disabled filters for now
- Added Loader to FullSizeImage
- Favorites directories can now be renamed
- Tags page can now be searched by pattern and tag type with proper pagination
- Added options to sort both online and offline searches
- BUG FIX: Fixed most favorited tags and favorite post count not using data from the new tree structure.
- BUG FIX: Fixed autoscrolling of thumbnails list in side panel

## 0.1.2 - Download tasks panel - 30.4.2020
- Added basic controls (show tags, open in browser) to gifs and videos
- Added Downloads drawer which saves all your batch downloads and allows you to view what posts were downloaded. For now it stores an infinite amount of download tasks
- Light Mode:
	- Fixed scrollbars background and border
	- Fixed active thumbnail border in thumbnails view
- Backend:
	- Completely refactored all thunks to use createAsyncThunk
	- With above change, all slices now react to thunks via extreReducers with builder pattern
	- Installed circular dependency plugin and removed all circular dependencies from store codebase
- BUG FIX: Animated gifs were showing only the first frame
- BUG FIX: Animated gifs were sometimes going outside frame
- BUG FIX: Search buttons now get disabled on press and reenabled on search finish to prevent accidental double search
- BUG FIX: TagOptions in search forms now properly clear on input box clear

## 0.1.1 - Favorites directory tree - 24.4.2020
- Added directory tree to favorites view
	- Create folder structure and save favorites post in them
	- Folders can be create/delete
	- Posts can be freely moved between directories
- Completely revamped modals
- Some more notifications are shown as a response to users actions