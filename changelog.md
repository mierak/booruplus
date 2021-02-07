# Changelog

## 0.2.1 - TITLE - DATE
- Added loader for each separate thumbnail
- Saved Searches now show in tabs
- BUG FIX: Fix scroll bar not appearing on Saved Searches page
- BUG FIX: Fix post not being saved to db when adding it as saved search preview
- BUG FIX: Fixed several loaders not disappearing on network fail
- BUG FIX: Fix active image sometimes being replaced by previously viewed image when changing images too quickly

## 0.2.0 - Now you are thinking with tabs - 1.1.2020
- NEW FEATURE: Browser-like tabs for searches. You can now have multiple searches at once. Other features, like searching a specific tags or opening posts from download task now open in a new tab
- Added simple update notification on app startup
- Added Add to favorites button to fullsize image view
- Improved logging
- BUG FIX: Fixed posts sometimes saving with their selected status upon download
- BUG FIX: Fixed download tasks showing incorrect progress

## 0.1.7 - Check later queue - 16.12.2020
- NEW FEATURE: While browsing search results, you can now add images to a transient "Check Later" queue. A button will appear in the left menu where you can go through these images. This queue is cleared everytime you exit the application.
- Thumbnails Page renamed to Search Results
- Saving Search now automatically sets search mode to saved-search to let you add previews right away
- Favorites, Most Viewed Posts and the rest are now separated. This means that clicking on Favorites page or opening any posts there while having active search wont override it
- Only posts which you have either viewed full image of, favorited, blacklisted or downloaded are now saved to DB
- Post thumbnail actions now show a loading icon if it triggers a long running task (download)
- BUG FIX: Save Search button will not whos on thumbnails page when current search mode is saved-search
- BUG FIX: Added confirmation for Saved Search delete
- BUG FIX: No longer duplicate tags when drag and dropping selected tag on the Selected Tags field in search form. Same goes for excluded tags
- BUG FIX: Preview for videos without explicit preview file now shows Preview not available instead of infinite loader
- BUG FIX: Tags popover on fullsize image no longer refetches tags when image was not changed
- BUG FIX: Images Folder Path now does not save right away, but with the rest of the settings when Save button is pressed.
- BUG FIX: Editing API Key input won't rerender the whole app anymore
- BUG FIX: Fix favorites filter for offline search being ignored

## 0.1.6 - Image caching and Image hover - 4.9.2020
- Hovering over thumbnail in thumbnails list now shows a pop up preview after a short while. There is a new toggle that lets you disable this in the options.
- Added option to automatically download images that are missing on disk but marked as downloaded
- Thumbnails now get automatically downloaded along with posts.
- Missing images and thumbnails for downloaded posts now get redownloaded automatically next time you view given image/post.
- Thumbnails and images are now cached upon loading to not hit network/filesystem unnecesarily
- Show warning that user should change path to data on first app start
- Added ability to export downloaded images to an archive (as a backup or porting to a different PC) and import said backup to your current data folder path
- Pressing backspace while viewing full image in Image View now switches you back to thumbnails list

## 0.1.5 - Move multiple posts between directories - 12.8.2020
- Right clicking favorites directory when multiple posts are selected now shows move all to folder option
- Shift clickign on thumbnails list now allos you to select multiple posts. Just like you would do with files in your system.
- Favorites now have an undeletable default directory instead of using the root node
- Automatically switch to default directory after deleting favorites directory thats currently open
- Favorites directories can now be closed and opened. By default they are all opened
- Favorites directories sider can now be resized by dragging
- Change Thumbnails List top buttons to a more compact menu
- Add option to add selected/all current posts to Saved Search preview
- Add option to move all posts in one favorites directory to another by right clicking a directory name
- Previews now save the whole post and are clickable, which sets them as active posts
- Added export menu to Thumbnails page which lets you export images of current pots to a directory
- Added export option to context menu over favorites directory, which lets you export it to a directory
- Download tasks can now be removed from the list by clicking the X icon. This is permanent and unreversible.
- BUG FIX: Download tasks are now properly sorted in descending order
- BUG FIX: Fix bug with download task not setting its state to completed, when one or more posts were already downloaded
- BUG FIX: Fix issue with favorites directory loading
- BUG FIX: Loader now disappears when post fetching fails
- BUG FIX: Fix grid scroll in Favorites page
- BUG FIX: Post selected state should no longer be persisted

## 0.1.4 - Database Import/Export - 3.8.2020
- Changed Thumbnails Grid to use windowing
- Allow devtools even in packaged app through standard shortcut
- Added ability to create a backup of the whole database and later restore that backup
- Thumbnails Page now scrolls to active post
- Increased size of thumbnails to 175x175 since gelbooru now provides this size
- Saved Searches page now shows expand button only when saved search has 1 or more previews
- Table on Tags page now resizes according to window height
- Now sets first fetched post as active when Load More button finishes fetching posts
- BUG FIX: Tasks completely failing when no tasks were present in DB
- BUG FIX: Tasks cancellation was not saved to database
- BUG FIX: Blacklisted posts not removing from currently displayed posts
- BUG FIX: Online search showing blacklisted posts
- BUG FIX: All favorites directories are now set as expanded on app start
- BUG FIX: Fixed light theme loading
- BIG FIX: Fixed position of rating distibution chart spinner

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