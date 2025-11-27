module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-recommended-vue',
    'stylelint-config-prettier-scss',
  ],
  customSyntax: 'postcss-html',
  rules: {
    'selector-class-pattern': null,
  },
};
