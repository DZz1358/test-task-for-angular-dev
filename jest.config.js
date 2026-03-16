const { createCjsPreset } = require('jest-preset-angular/presets');

module.exports = {
  ...createCjsPreset(),
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|@ng-bootstrap))'],
};
