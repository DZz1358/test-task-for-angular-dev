const baseConfig = require('../../jest.config');

module.exports = {
  ...baseConfig,
  roots: ['<rootDir>/src'],
  coverageDirectory: '<rootDir>/../../reports/ng-x-rocket',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@core$': '<rootDir>/src/app/@core',
    '^@core/(.*)$': '<rootDir>/src/app/@core/$1',
    '^@shared$': '<rootDir>/src/app/@shared',
    '^@shared/(.*)$': '<rootDir>/src/app/@shared/$1',
    '^@env$': '<rootDir>/src/environments/environment',
    '^@env/(.*)$': '<rootDir>/src/environments/$1',
    '^@ng-x-rocket/block-builder$': '<rootDir>/../../libs/block-builder/src/index.ts',
    '^@ng-x-rocket/weather$': '<rootDir>/../../libs/weather/src/index.ts',
    '^@ng-x-rocket/weather/state$': '<rootDir>/../../libs/weather/state/src/index.ts',
    '^@ng-x-rocket/weather/ui$': '<rootDir>/../../libs/weather/ui/src/index.ts',
  },
};
