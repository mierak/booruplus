module.exports = {
	verbose: true,
	// testMatch: ['<rootDir>/test/**/*.(test).{js,jsx,ts,tsx}', '<rootDir>/test/**/?(*.)(spec|test).{js,jsx,ts,tsx}'],
	testPathIgnorePatterns: ['<rootDir>/test.helpers'],
	// transform: {
	// 	'^.+\\.(ts|tsx)$': 'ts-jest',
	// },
	// coveragePathIgnorePatterns: ['node_modules', 'helper.ts', '.mock.ts'],
	// moduleFileExtensions: ['ts', 'tsx', 'js'],
	// setupFilesAfterEnv: ['./test/jest.setup.ts'],
	projects: [
		{
			displayName: 'Components',
			testMatch: ['<rootDir>/test/components/**/*.(test).{js,jsx,ts,tsx}', '<rootDir>/test/components/**/?(*.)(spec|test).{js,jsx,ts,tsx}'],
			testPathIgnorePatterns: ['<rootDir>/test.helpers'],
			setupFilesAfterEnv: ['./test/components/jest.setup.ts', './test/jest.setup.ts'],
			transform: {
				'^.+\\.(ts|tsx)$': 'ts-jest',
			},
			coveragePathIgnorePatterns: ['node_modules', 'helper.ts', '.mock.ts'],
			moduleNameMapper: {
				'\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
				'\\.(css|less)$': 'identity-obj-proxy',
			},
		},
		{
			displayName: 'Tests',
			testMatch: ['<rootDir>/test/**/*.(test).{js,jsx,ts,tsx}', '<rootDir>/test/**/?(*.)(spec|test).{js,jsx,ts,tsx}'],
			testPathIgnorePatterns: ['<rootDir>/test.helpers', '<rootDir>/test/components/'],
			transform: {
				'^.+\\.(ts|tsx)$': 'ts-jest',
			},
			coveragePathIgnorePatterns: ['node_modules', 'helper.ts', '.mock.ts'],
			setupFilesAfterEnv: ['./test/jest.setup.ts'],
		},
	],
};
