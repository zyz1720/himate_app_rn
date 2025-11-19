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
          '@components': './src/components',
          '@pages': './src/pages',
          '@utils': './src/utils',
          '@assets': './src/assets',
          '@api': './src/api',
          '@const': './src/constants',
          '@store': './src/stores',
          '@style': './src/styles',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
