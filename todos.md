## TODO

- Make Tag page actually useful
- Tests
- Loader in ImageView
- Typesafe IPC
- Make forms responsive
- Refactor excluded/selected tags components
- Thumbnails downlaoding
- Option to load dashboard stats on app start
- Add option to move selected/all favorites between directories
- Expand active posts to not use only one state
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
- ~~Refresh button on dashboard instead of loading resources on every render~~
- Add tasks page with past/current downloads
- Extract API service and/or parsing to worker

## BUG

- Fix buggy behaviour of tag search with debounce
- Fix light mode
- Two searches in quick succession sometimes add the results together instead of overwriting the first one
- ~~Gifs not played, due to canvas not supporting them - change to native \<img\>~~
- ~~Investigate escaping of characters in URL, ie. plus in "6+girls" is sent unescaped~~
- ~~Unable to start search at page 1+~~
- ~~Selected posts from pages higher than 0 not downloading(maybe even all posts?)~~

## REFACTOR

- WithProgressBar to actually make sense
- Make task ID start at 0

## LOW PRIORITY

- Extract all inlined urls