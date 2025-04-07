# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)




# Lunr.js Search Implementation

This guide explains how the Lunr.js search functionality has been integrated into the cosmetic procedures website.

## Overview

We've implemented a client-side search engine using [Lunr.js](https://lunrjs.com/) that provides fast, full-text search capabilities without requiring additional server requests for each search query. This approach:

1. Loads all searchable data once
2. Creates an in-memory search index
3. Performs searches and filtering entirely on the client-side
4. Maintains state across navigation with URL parameters

## Key Components

### 1. API Endpoint for Search Index

The new `/api/procedures/search-index` endpoint provides all the procedure data needed to build the search index:

```javascript
// In app.js
app.get('/api/procedures/search-index', async (req, res) => {
  // Fetches all procedures with their associated data for indexing
});
```

### 2. Search Utilities

The `searchUtils.js` file contains essential functions for search functionality:

- `createSearchIndex()`: Creates a Lunr search index with configurable field weights
- `performSearch()`: Executes searches with fallback to simple text matching if needed
- `applyFilters()`: Applies multiple filters to search results
- `paginateResults()`: Handles pagination of search results

### 3. Search State Management

The `useSearchState.js` custom hook manages search state with URL parameters:

- Keeps search parameters in the URL for bookmarking and sharing
- Persists search state across page navigation
- Provides functions to update search state and navigate with search parameters

### 4. Procedures Component

The updated `Procedures.jsx` component:

- Loads all procedures data and builds the search index
- Uses URL parameters to maintain search state
- Performs searches with Lunr and applies filters
- Displays results with highlighted search terms

### 5. Home Page Integration

The `FindCosmetics.jsx` component on the home page integrates with the search system:

- Uses the same search state management
- Provides a simplified search interface
- Navigates to the main search page with parameters

## Implementation Steps

1. Install Lunr.js:
   ```bash
   npm install lunr --save
   ```

2. Set up the search-index API endpoint in your backend.

3. Create the search utilities in `src/utils/searchUtils.js`.

4. Create the search state hook in `src/hooks/useSearchState.js`.

5. Update the Procedures component to use Lunr search.

6. Connect the home page search to the same system.

7. Create the SearchResultCard component for better results display.

## Search Configuration

The search index is configured with field weights to prioritize certain content:

```javascript
const idx = createSearchIndex(transformedData, {
  fields: {
    name: { boost: 7 },       // Procedure name
    doctorInfo: { boost: 4 },  // Clinic name
    doctor: { boost: 2 },      // Provider name
    category: { boost: 7 },
    specialty: { boost: 4 },
    City: { boost: 8 },
    State: { boost: 9 }
  }
});
```

You can adjust these weights to change search relevance.

## Advanced Features

### Term Highlighting

Search results highlight matching terms in the procedure name:

```jsx
const highlightSearchTerm = (title, term) => {
  if (!term || !title) return title;
  
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = title.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-100 px-[1px] rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};
```

### URL Parameter Persistence

Search parameters are stored in the URL for bookmarking and sharing:

```javascript
// Update URL when search state changes
useEffect(() => {
  const params = new URLSearchParams();
  
  Object.entries(searchState).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      params.set(key, value);
    }
  });
  
  setSearchParams(params);
}, [searchState, setSearchParams]);
```

## Troubleshooting

If you encounter issues with the search functionality:

- Check browser console for errors
- Verify the search index is being loaded correctly
- Ensure the API is returning the expected data
- Test with simple search terms to narrow down problems

## Performance Considerations

The client-side search approach works well for datasets up to several thousand procedures. For larger datasets, consider:

1. Implementing server-side search (e.g., with SQL full-text search)
2. Adding pagination to the search index API
3. Implementing lazy loading for search results

## Future Improvements

Potential enhancements to consider:

1. Add typo-tolerance (fuzzy matching)
2. Implement search suggestions/autocomplete
3. Add search analytics to track common searches
4. Create a more sophisticated relevance algorithm