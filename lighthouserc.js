module.exports = {
  ci: {
    collect: {
      // Start the server on port 3005 directly using next start to avoid port 3000 conflicts
      startServerCommand: 'npx next start -p 3005',
      startServerReadyPattern: 'localhost:3005',
      url: [
        'http://localhost:3005/en',
        'http://localhost:3005/en/1',
        'http://localhost:3005/en/my-quran',
        'http://localhost:3005/en/reciters',
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --headless --disable-gpu',
      },
    },
    assert: {
      assertions: {
        // Enforce strict scores across all key categories
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.90 }],
        
        // Assert specific core performance budgets (warnings for non-blocking profiling)
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'interactive': ['warn', { maxNumericValue: 3500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
