const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for Metro "dependencies is not iterable" error in RN 0.81+ (2026)
// This error occurs when the experimental "exports" support in Metro fails to parse certain libraries.
if (config.resolver) {
  config.resolver.unstable_enablePackageExports = false;
}

module.exports = config;
