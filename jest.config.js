const { createCjsPreset } = require('jest-preset-angular/presets');

module.exports = {
  ...createCjsPreset(),
  roots: ['<rootDir>/src'],
  coverageDirectory: '<rootDir>/reports',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@core$': '<rootDir>/src/app/@core',
    '^@core/(.*)$': '<rootDir>/src/app/@core/$1',
    '^@shared$': '<rootDir>/src/app/@shared',
    '^@shared/(.*)$': '<rootDir>/src/app/@shared/$1',
    '^@env$': '<rootDir>/src/environments/environment',
    '^@env/(.*)$': '<rootDir>/src/environments/$1',
  },
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|@ng-bootstrap))'],
};
