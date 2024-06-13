import type {Linter} from 'eslint';
import rules from '@rules/react';
import type {BaseConfigOptions} from '@utils/types';

export async function getReactConfig({overrides}: BaseConfigOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const {default: react} = await import('eslint-plugin-react'),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    {default: reactHooks} = await import('eslint-plugin-react-hooks'),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    {default: reactRefresh} = await import('eslint-plugin-react-refresh'),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    {default: reactCompiler} = await import('eslint-plugin-react-compiler');

  const config: Linter.FlatConfig = {
    name: 'proste_react_config',
    files: ['**/*.?([cm])?([tj])s?(x)'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react-compiler': reactCompiler,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...rules,
      ...overrides,
    },
  };

  return config;
}
