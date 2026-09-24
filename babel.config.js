// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // react-native-reanimated phải là plugin CUỐI CÙNG
      'react-native-reanimated/plugin',
    ],
  };
};
