## TODO

- Make Tag page actually useful
- Tests
- Loader in ImageView
- Typesafe IPC
- Refactor excluded/selected tags components
- Thumbnails downlaoding
- Add option to move selected/all favorites between directories
- Expand active posts to not use only one state
- Import/Export database
- Add sorting of searches
- ~~Option to load dashboard stats on app start~~
- ~~Favorites categories~~
- ~~Change base64 based dtos with blob based ones~~
- ~~Loader when starting up app~~
- ~~Implement Download Search onClick~~
- ~~Fix layout of settings page~~
- ~~Add splashscreen~~
- ~~Dont save search if it already exists~~
- ~~Pagination for offline search~~
- ~~Refactor DB to modules~~
- ~~Exclude tag from search~~
- ~~Extract DB work to worker~~
- ~~Replace all Object.assign with spread operator~~

## CONSIDER

- Adding last search from DB to one? level cache
- Extract API service and/or parsing to worker
- ~~Refresh button on dashboard instead of loading resources on every render~~
- ~~Add tasks page with past/current downloads~~

## BUG

- Fix scroll to thumbnail
- Recheck images path settings reload from DB with IPC communication 
- ~~Fix buggy behaviour of tag search with debounce~~
- ~~Two searches in quick succession sometimes add the results together instead of overwriting the first one~~
- ~~Gifs with Height > Width go offscreen~~
- ~~Fix light mode~~
- ~~Gifs not played, due to canvas not supporting them - change to native \<img\>~~
- ~~Investigate escaping of characters in URL, ie. plus in "6+girls" is sent unescaped~~
- ~~Unable to start search at page 1+~~
- ~~Selected posts from pages higher than 0 not downloading(maybe even all posts?)~~

## REFACTOR

- ~~WithProgressBar to actually make sense~~

## LOW PRIORITY

- Make forms responsive
- Investigate slow API key input box
- Extract all inlined urls
- Add toggles for loading stats on app start
- Limit download tasks, maybe add a way to view older tasks. Add task retention setting.
- Change cancelling of settings modal to not reload from DB