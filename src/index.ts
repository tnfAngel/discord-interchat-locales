import translator from 'google-translate-api-x';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import * as yaml from 'js-yaml';

const settings = {
	langPaths: ['./src/locales/'],
	rootLangFiles: ['./src/locales/en.yml'],
	rootLangCode: 'en',
	outputLangs: [
		'en',
		'id',
		'da',
		'de',
		'es',
		'fr',
		'hr',
		'it',
		'lt',
		'hu',
		'nl',
		'no',
		'pl',
		'pt',
		'ro',
		'fi',
		'sv',
		'vi',
		'tr',
		'cs',
		'el',
		'bg',
		'ru',
		'uk',
		'hi',
		'th',
		['zh-CN', 'zh'],
		'ja',
		'ko',
	],
	translateDelay: 100,
	debug: true,
};

const colors = {
	blue: (str: string): string => `\x1B[1;34m${str}\x1B[1;0m`,
	green: (str: string): string => `\x1B[1;32m${str}\x1B[1;0m`,
	magenta: (str: string): string => `\x1B[1;35m${str}\x1B[1;0m`,
};

const debug = (text: string): void => {
	if (settings.debug) return console.log(text);
};

debug(
	`Welcome to the ${colors.green(
		'InterChat Translation Service',
	)} - Made by tnfAngel and LautyDev`,
);

const translatorError = (text: string): void => {
	throw new Error(` ${text}`);
};

const wait = (time: number) => new Promise((res) => setTimeout(res, time));

const getArrayKey = (array: string | string[]) =>
	Array.isArray(array) ? array[0] : array;

const getArrayValue = (array: string | string[]) =>
	Array.isArray(array) ? array[1] : array;

const writeYamlFileSync = (filePath: string, content: Record<string, any>) => {
	const yamlContent = yaml.dump(content, {
		lineWidth: Number.MAX_SAFE_INTEGER,
	});
	writeFileSync(filePath, yamlContent, 'utf8');
};

const main = async () => {
	try {
		let i = 0;

		for (const langPath of settings.langPaths) {
			const rootLangCode = getArrayKey(settings.rootLangCode);
			const rootLangCodeFilename = getArrayValue(settings.rootLangCode);

			debug(
				`[${colors.blue(
					'main',
				)}] Starting translation service (${colors.green(
					rootLangCodeFilename,
				)})`,
			);

			const rootFilePath = settings.rootLangFiles[i];

			if (!existsSync(rootFilePath)) {
				translatorError(
					'[main] Invalid path provided on rootLangFile.',
				);
			}

			debug(
				`[${colors.blue('main')}] Opening root file: ${colors.green(
					rootFilePath,
				)}`,
			);

			const rootFileContent = readFileSync(rootFilePath, 'utf8');

			let rootFileObject = null;

			try {
				rootFileObject = yaml.load(rootFileContent);
			} catch (error: any) {
				translatorError(
					`[main] The content in the root file ${rootFilePath} is not a valid yml object: ${error.message}`,
				);
			}

			if (!rootFileObject) {
				translatorError('[main] Invalid root file object.');
			}

			for (const outputLangs of settings.outputLangs) {
				const langCode = getArrayKey(outputLangs);
				const langCodeFilename = getArrayValue(outputLangs);

				debug(
					`[${colors.blue(rootLangCodeFilename)} => ${colors.blue(
						langCodeFilename,
					)}] Starting translation service (${colors.green(
						langCodeFilename,
					)})`,
				);

				const filePath = `${langPath}${langCodeFilename}.yml`;

				if (!existsSync(filePath)) {
					debug(
						`[${colors.blue(rootLangCodeFilename)} => ${colors.blue(
							langCodeFilename,
						)}] Creating file: ${colors.green(filePath)}`,
					);

					writeFileSync(filePath, 'key1: value1');
				}

				debug(
					`[${colors.blue(rootLangCodeFilename)} => ${colors.blue(
						langCodeFilename,
					)}] Opening file: ${colors.green(filePath)}`,
				);

				const fileContent = readFileSync(filePath, 'utf8');

				let fileObject = null;

				try {
					fileObject = yaml.load(fileContent);
				} catch (error: any) {
					throw new Error(
						`[${rootLangCodeFilename} => ${langCodeFilename}] Error loading YAML content in ${filePath}: ${error.message}`,
					);
				}

				if (!fileObject || typeof fileObject !== 'object') {
					throw new Error(
						`[${rootLangCodeFilename} => ${langCodeFilename}] Invalid or empty file object in ${filePath}. Make sure the YAML file contains a valid object.`,
					);
				}

				const rootFileObjPath = {};
				deepMap(fileObject, ['root'], rootFileObjPath);

				const result: any = await translate(
					rootFileObject,
					rootLangCode,
					rootLangCodeFilename,
					langCode,
					langCodeFilename,
					['root'],
					rootFileObjPath,
					filePath,
				);

				writeYamlFileSync(filePath, result);

				debug(
					`[${colors.blue(rootLangCodeFilename)} => ${colors.blue(
						langCode,
					)}] Translation ended for ${colors.green(
						langCode,
					)}, written in ${filePath}`,
				);
			}

			i++;
			debug(
				`${colors.green(
					'All translated',
				)} - Made by tnfAngel and LautyDev`,
			);
		}
	} catch (error: any) {
		console.error(`An error occurred: ${error.message}`);
		console.error(error.stack);
	}
};

const isString = <Value>(val: Value): boolean => typeof val === 'string';

const isObject = <Value>(val: Value): boolean =>
	val === Object(val) &&
	Object.prototype.toString.call(val) !== '[object Array]';

const isArray = <Value>(val: Value): boolean => Array.isArray(val);

const translateString = async (
	text: string,
	fromLangCode: string,
	fromLangCodeFilename: string,
	toLangCode: string,
	toLangCodeFilename: string,
	rootObjPath: string[],
	rootFileObjPath: Record<string, any>,
): Promise<string> => {
	const rootText = rootFileObjPath[rootObjPath.join('')];

	let translationResult;

	if (rootText && rootText !== 'untranslated') {
		debug(
			`[${colors.blue(fromLangCodeFilename)} => ${colors.blue(
				toLangCodeFilename,
			)}] [${colors.magenta('skipped')}] ${colors.green(
				rootObjPath.join(''),
			)} ==> ${colors.blue(rootText)}`,
		);

		translationResult = formatString(text, rootText);
	} else {
		debug(
			`[${colors.blue(fromLangCodeFilename)} => ${colors.blue(
				toLangCodeFilename,
			)}] Starting translation for ${colors.green(
				rootObjPath.join(''),
			)} ==> ${colors.blue(text)}`,
		);

		await wait(settings.translateDelay);

		const result = await translator(text, {
			from: fromLangCode,
			to: toLangCode,
		});

		const translation = formatString(
			text,
			Array.isArray(result) ? result[0].text : result.text.toString(),
		);

		debug(
			`[${colors.blue(fromLangCodeFilename)} => ${colors.blue(
				toLangCode,
			)}] Translation ended for ${colors.green(
				rootObjPath.join(''),
			)} ==> ${colors.blue(translation)}`,
		);

		translationResult = translation;
	}

	return translationResult;
};

const deepArray = (
	array: any[],
	rootObjPath: string[],
	rootFileObjPath: any,
): any[] => {
	const result = [];

	let iteration = 0;

	for (const value of array) {
		if (iteration === 0) {
			rootObjPath.push(`[${iteration}]`);
		} else {
			rootObjPath.splice(rootObjPath.length - 1, 1);
			rootObjPath.push(`[${iteration}]`);
		}

		const deepValue = deepMap(value, rootObjPath, rootFileObjPath);

		result.push(deepValue);

		iteration = iteration + 1;

		if (iteration === array.length) {
			rootObjPath.splice(rootObjPath.length - 1, 1);
		}
	}

	return result;
};

const deepMap = (
	source: any,
	rootObjPath: string[],
	rootFileObjPath: any,
): any => {
	if (isString(source))
		return deepString(source, rootObjPath, rootFileObjPath);

	if (isObject(source))
		return deepObject(source, rootObjPath, rootFileObjPath);

	if (isArray(source)) return deepArray(source, rootObjPath, rootFileObjPath);

	return source;
};

const translateObject = async <
	TObject extends Record<string, any>,
	RObject extends Record<string, any>,
>(
	object: TObject,
	fromLangCode: string,
	fromLangCodeFilename: string,
	toLangCode: string,
	toLangCodeFilename: string,
	rootObjPath: string[],
	rootFileObjPath: RObject,
	filePath: string,
) => {
	const result: Record<string, any> = {};

	let iteration = 0;

	const entries = Object.entries(object);

	for (const [key, value] of entries) {
		if (iteration === 0) {
			rootObjPath.push(`['${key}']`);
		} else {
			rootObjPath.splice(rootObjPath.length - 1, 1);
			rootObjPath.push(`['${key}']`);
		}

		const translatedValue = await translate(
			value,
			fromLangCode,
			fromLangCodeFilename,
			toLangCode,
			toLangCodeFilename,
			rootObjPath,
			rootFileObjPath,
			filePath,
		);

		result[key] = translatedValue;

		iteration = iteration + 1;

		if (iteration === entries.length)
			rootObjPath.splice(rootObjPath.length - 1, 1);
	}

	return result;
};

const translateArray = async <TArray, RObject extends Record<string, any>>(
	array: TArray[],
	fromLangCode: string,
	fromLangCodeFilename: string,
	toLangCode: string,
	toLangCodeFilename: string,
	rootObjPath: string[],
	rootFileObjPath: RObject,
	filePath: string,
) => {
	const result = [];

	let iteration = 0;

	for (const value of array) {
		if (iteration === 0) {
			rootObjPath.push(`[${iteration}]`);
		} else {
			rootObjPath.splice(rootObjPath.length - 1, 1);
			rootObjPath.push(`[${iteration}]`);
		}

		const translatedValue = await translate(
			value,
			fromLangCode,
			fromLangCodeFilename,
			toLangCode,
			toLangCodeFilename,
			rootObjPath,
			rootFileObjPath,
			filePath,
		);

		result.push(translatedValue);

		iteration = iteration + 1;

		if (iteration === array.length) {
			rootObjPath.splice(rootObjPath.length - 1, 1);
		}
	}

	return result;
};

const translate = async <TSource, RObject extends Record<string, any>>(
	source: TSource,
	fromLangCode: string,
	fromLangCodeFilename: string,
	toLangCode: string,
	toLangCodeFilename: string,
	rootObjPath: string[],
	rootFileObjPath: RObject,
	filePath: string,
): Promise<unknown> => {
	if (isString(source))
		return translateString(
			source as string,
			fromLangCode,
			fromLangCodeFilename,
			toLangCode,
			toLangCodeFilename,
			rootObjPath,
			rootFileObjPath,
		);

	if (isObject(source))
		return translateObject(
			source as Record<string, any>,
			fromLangCode,
			fromLangCodeFilename,
			toLangCode,
			toLangCodeFilename,
			rootObjPath,
			rootFileObjPath,
			filePath,
		);

	if (isArray(source))
		return translateArray(
			source as unknown[],
			fromLangCode,
			fromLangCodeFilename,
			toLangCode,
			toLangCodeFilename,
			rootObjPath,
			rootFileObjPath,
			filePath,
		);

	return source;
};

const deepString = (
	text: string,
	rootObjPath: string[],
	rootFileObjPath: any,
): string => {
	rootFileObjPath[rootObjPath.join('')] = text;

	return text;
};

const deepObject = (
	object: any,
	rootObjPath: string[],
	rootFileObjPath: any,
): any => {
	const result: Record<string, any> = {};

	let iteration = 0;

	const entries = Object.entries(object);

	for (const [key, value] of entries) {
		if (iteration === 0) {
			rootObjPath.push(`['${key}']`);
		} else {
			rootObjPath.splice(rootObjPath.length - 1, 1);
			rootObjPath.push(`['${key}']`);
		}

		const deepValue = deepMap(value, rootObjPath, rootFileObjPath);
		result[key] = deepValue;

		iteration = iteration + 1;

		if (iteration === entries.length) {
			rootObjPath.splice(rootObjPath.length - 1, 1);
		}
	}

	return result;
};

const formatString = (original: string, destination: string) => {
	const originalVars = original.match(/[{|"](.*?)[}|"]+/gi);

	let i = 0;

	return destination.replace(/[{|"](.*?)[}|"]+/gi, () => {
		const result = originalVars?.[i] ?? '';
		i++;
		return result;
	});
};

main().catch(() => null);
