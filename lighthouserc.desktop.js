const mobileConfig = require('./lighthouserc.js');

module.exports = {
  ci: {
    ...mobileConfig.ci,
    collect: {
      ...mobileConfig.ci.collect,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --headless',
      },
    },
  },
};
