const path = require('path');

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    'project': path.join(__dirname, 'tsconfig.json'),
    'sourceType': 'module'
  },
  plugins: [
    '@globalid',
  ],
  extends: [
    'plugin:@globalid/node-svc',
    'plugin:@globalid/mocha',
  ],
  overrides: [
    {  // TODO: this is just temp
      files: ['*.*'],
      rules: {
        '@typescript-eslint/no-namespace': 'off', // TODO: temp disabled, too many errors
        'import/no-namespace': 'off', // TODO: temp disabled, too many errors
        'prefer-arrow/prefer-arrow-functions': 'off', // TODO: too many issues now
      },
    }
  ]
};
