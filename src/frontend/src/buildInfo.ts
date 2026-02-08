// Build version information
// This value should change with each deployment to help identify which version is loaded
const BUILD_VERSION = 
  import.meta.env.VITE_APP_VERSION || 
  import.meta.env.VITE_GIT_SHA?.substring(0, 7) || 
  import.meta.env.VITE_APP_BUILD || 
  `v${Date.now().toString(36)}`;

export const buildInfo = {
  version: BUILD_VERSION,
  timestamp: new Date().toISOString(),
};
