import {getTypescriptConfig} from '@configs/ts';
import {getJsConfig} from '@configs/js';
import {FlatConfigComposer} from 'eslint-flat-config-utils';
import type {Linter} from 'eslint';
import {getImportConfig} from '@configs/import';
import {getReactConfig} from '@configs/react';
import {getPrettierConfig} from '@configs/prettier';
import {getUnicornConfig} from '@configs/unicorn';
import {getVitestConfig} from '@configs/vitest';
import {getJsxA11yConfig} from '@configs/jsxA11y';
import {getVueConfig} from '@configs/vue';
import {isPackageExists} from 'local-pkg';
import type {EnableOption} from '@utils/types';
import {
  resolveOptions,
  resolveReactOptions,
  resolveTsOptions,
  resolveVueOptions,
} from '@utils/options';
import type {ReactVersion} from '@utils/internal';

export type EslintConfigOptions = {
  ignores?: Linter.Config['ignores'];
  react?: EnableOption<{version?: ReactVersion; compiler?: boolean}>;
  ts?: EnableOption<{
    parseOptions?: Linter.ParserOptions;
  }>;
  prettier?: EnableOption;
  unicorn?: EnableOption;
  vitestGlobals?: EnableOption;
  jsxA11y?: EnableOption;
  vue?: EnableOption<{version?: 2 | 3}>;
  js?: EnableOption;
  import?: EnableOption;
};

const BASE_IGNORES = [
  '**/node_modules',
  '**/dist',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/pnpm-lock.yaml',
  '**/CHANGELOG.md',
  '**/LICENSE',
];

type MaybePromise<T> = T | Promise<T>;

export default async function eslintConfig(
  options?: EslintConfigOptions,
  ...configs: MaybePromise<Linter.Config | FlatConfigComposer<any, any>>[]
) {
  const {
    ignores = BASE_IGNORES,
    react: enableReact = isPackageExists('react'),
    ts: enableTypescript = isPackageExists('typescript'),
    prettier: enablePrettier = isPackageExists('prettier'),
    unicorn: enableUnicorn = true,
    vitestGlobals = isPackageExists('vitest'),
    jsxA11y: enableJsxA11y = false,
    vue: enableVue = isPackageExists('vue'),
    js: enableJs = true,
    import: enableImport = true,
  } = options ?? {};

  const vueOptions = resolveVueOptions(enableVue),
    reactOptions = resolveReactOptions(enableReact),
    tsOptions = resolveTsOptions(enableTypescript),
    prettierOptions = resolveOptions(enablePrettier),
    unicornOptions = resolveOptions(enableUnicorn),
    jsxA11yOptions = resolveOptions(enableJsxA11y),
    jsOptions = resolveOptions(enableJs),
    importOptions = resolveOptions(enableImport);

  const tsExts = [],
    tsFiels = [];

  if (vueOptions.enable) {
    tsExts.push('.vue');
    tsFiels.push('**/*.vue');
  }

  const configList: MaybePromise<Linter.Config>[] = [
    {
      ignores,
    },
    jsOptions.enable && getJsConfig({overrides: jsOptions.overrides}),
    unicornOptions.enable &&
      getUnicornConfig({overrides: unicornOptions.overrides}),
    tsOptions.enable &&
      getTypescriptConfig({
        overrides: tsOptions.overrides,
        exts: tsExts,
        files: tsFiels,
        parseOptions: tsOptions.parseOptions,
      }),
    importOptions.enable &&
      getImportConfig({
        overrides: importOptions.overrides,
        enableTs: tsOptions.enable,
      }),
    reactOptions.enable && getReactConfig({...reactOptions}),
    vitestGlobals && getVitestConfig(),
    jsxA11yOptions.enable &&
      getJsxA11yConfig({overrides: jsxA11yOptions.overrides}),
    vueOptions.enable &&
      getVueConfig({
        enableTs: tsOptions.enable,
        version: vueOptions.version,
        overrides: vueOptions.overrides,
      }),
  ].filter(Boolean);

  const composer = new FlatConfigComposer();

  composer.append(...configList, ...(configs as any[]));

  prettierOptions.enable &&
    composer.append(getPrettierConfig({overrides: prettierOptions.overrides}));

  return composer;
}
