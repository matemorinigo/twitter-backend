import { Config } from '@jest/types';
import { defaults } from 'jest-config';

const config: Config.InitialOptions = {
  rootDir: './',
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@server$': '<rootDir>/src/server',
    '^@swagger$': '<rootDir>/src/swagger',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@utils$': '<rootDir>/src/utils',
    '^@domains/(.*)$': '<rootDir>/src/domains/$1',
    '^@domains$': '<rootDir>/src/domains',
    '^@app$': '<rootDir>/src/app',
    '^@router$': '<rootDir>/src/router',
    '^@test$': '<rootDir>/__tests__/',
    '^@test/__mocks__/(.*)$': '<rootDir>/__tests__/__mocks__/$1',
  },
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'mts'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleDirectories: ['node_modules', '<rootDir>'],
};

export default config;
