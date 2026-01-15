const path = require('path');

module.exports = (options, webpack) => {
  // Get the externals and filter out our workspace packages
  const filteredExternals = [];

  if (options.externals) {
    for (const external of options.externals) {
      if (typeof external === 'function') {
        // Wrap the function to exclude our packages
        filteredExternals.push((ctx, callback) => {
          const request = ctx.request;
          if (request && (request.startsWith('@nimora/') || request.includes('shared-types') || request.includes('shared-utils'))) {
            return callback();
          }
          return external(ctx, callback);
        });
      } else if (typeof external === 'object') {
        const filtered = { ...external };
        delete filtered['@nimora/shared-types'];
        delete filtered['@nimora/shared-utils'];
        if (Object.keys(filtered).length > 0) {
          filteredExternals.push(filtered);
        }
      } else {
        filteredExternals.push(external);
      }
    }
  }

  return {
    ...options,
    resolve: {
      ...options.resolve,
      alias: {
        ...options.resolve?.alias,
        '@nimora/shared-types': path.resolve(__dirname, '../../packages/shared-types/src'),
        '@nimora/shared-utils': path.resolve(__dirname, '../../packages/shared-utils/src'),
      },
    },
    externals: filteredExternals,
  };
};
