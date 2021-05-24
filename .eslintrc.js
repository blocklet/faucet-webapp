module.exports = {
  parser: 'babel-eslint',
  plugins: ['import'],
  extends: 'airbnb',
  env: {
    es6: true,
    browser: true,
    node: true,
    mocha: true,
    jest: true,
  },
  rules: {
    'react/jsx-filename-extension': 'off',
    'react/jsx-closing-bracket-location': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'react/forbid-prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'react/sort-comp': 'off',
    'object-curly-newline': 'off',
    'operator-linebreak': 'off',
    'class-methods-use-this': 'off',
    'react/jsx-no-undef': 'error',
    'max-len': [
      'error',
      {
        code: 120,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'arrow-parens': 'off',
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'ignore',
      },
    ],
    'no-param-reassign': [
      'error',
      {
        props: false,
      },
    ],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
  },
  globals: {
    logger: true,
  },
};
