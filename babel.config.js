module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        envName: 'RN_ENV',
        moduleName: '@env',
        path: '.env',
      },
    ],
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.js', '.jsx', '.json'],
        alias: {
          '@': './src',
          '@root': './',
          '@api': './src/api',
          '@pages': './src/pages',
          '@utils': './src/utils',
          '@store': './src/stores',
          '@style': './src/styles',
          '@assets': './src/assets',
          '@const': './src/constants',
          '@components': './src/components',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
