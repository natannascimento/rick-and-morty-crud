import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  transformIgnorePatterns: ['node_modules/(?!@angular|rxjs)'],
  moduleNameMapper: {
    '@app/(.*)': '<rootDir>/src/app/$1',
  },
};

export default config;