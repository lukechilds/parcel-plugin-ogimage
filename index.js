const fs = require('fs');
const path = require('path');
const url = require('url');
const ora = require('ora');
const chalk = require('chalk');
const prettyMs = require('pretty-ms');

const getMetaTag = (html, property, spinner) => {
	const regex = new RegExp(`<meta[^>]*property=["|']${property}["|'][^>]*>`, 'i');
	const executedRegex = regex.exec(html);

	if (!executedRegex) {
		spinner.fail(`Missing ${property}`);

		return;
	}

	return executedRegex[0];
};

const getMetaTagContent = (metaTagHtml, property, spinner) => {
	const regex = /content=["]([^"]*)["]/i;
	const executedRegex = regex.exec(metaTagHtml);

	if (!executedRegex) {
		spinner.fail(`Missing content attribute in ${property}`);

		return;
	}

	return executedRegex[1];
};

module.exports = bundler => {
	bundler.on('buildEnd', async () => {
		if (process.env.NODE_ENV !== 'production') {
			return;
		}

		const spinner = ora(chalk.grey('Fixing og:image link')).start();
		const start = Date.now();

		const htmlPath = path.join(bundler.options.outDir, 'index.html');
		const html = fs.readFileSync(htmlPath).toString();

		const ogImageTag = getMetaTag(html, 'og:image', spinner);
		const ogImageContent = getMetaTagContent(ogImageTag, 'og:image', spinner);

		const ogUrlTag = getMetaTag(html, 'og:url', spinner);
		const ogUrlContent = getMetaTagContent(ogUrlTag, 'og:url', spinner);

		const hasErrors = !ogUrlTag || !ogUrlContent || !ogImageTag || !ogImageContent;

		if (!hasErrors) {
			const absoluteOgImageUrl = url.resolve(ogUrlContent, ogImageContent);
			const ogImageTagAbsoluteUrl = ogImageTag.replace(ogImageContent, absoluteOgImageUrl);
			const patchedHtml = html.replace(ogImageTag, ogImageTagAbsoluteUrl);

			fs.writeFileSync(htmlPath, patchedHtml);
		}

		const end = Date.now();
		const symbol = hasErrors ? chalk.red('✖') : '✨ ';
		const text = hasErrors
			? chalk.red('Failed to fix og:image link. Please fix the above errors.')
			: chalk.green(`Fixed og:image link in ${prettyMs(end - start)}.`);

		spinner.stopAndPersist({
			symbol,
			text,
		});
	});
};
