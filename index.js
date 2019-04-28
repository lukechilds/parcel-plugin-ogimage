const fs = require('fs');
const path = require('path');
const url = require('url');
const ora = require('ora');
const chalk = require('chalk');
const prettyMs = require('pretty-ms');

const getMetaTag = (html, property) => {
	const regex = new RegExp(`<meta[^>]*property=["|']${property}["|'][^>]*>`, 'i');
	const results = regex.exec(html);

	if (!results) {
		throw new Error(`Missing ${property}`);
	}

	return results[0];
};

const getMetaTagContent = metaTagHtml => {
	const contentRegex = /content=["]([^"]*)["]/i;
	const results = contentRegex.exec(metaTagHtml);

	if (!results) {
		throw new Error(`Missing content attribute in ${chalk.bold(metaTagHtml)}`);
	}

	return results[1];
};

module.exports = bundler => {
	bundler.on('buildEnd', async () => {
		if (process.env.NODE_ENV !== 'production') {
			return;
		}
		console.log('');

		const spinner = ora(chalk.grey('Fixing og:image link')).start();
		const start = Date.now();

		const htmlPath = path.join(bundler.options.outDir, 'index.html');
		const html = fs.readFileSync(htmlPath).toString();
		let hasErrors = false;

		try {
			const ogImageTag = getMetaTag(html, 'og:image');
			const ogImageContent = getMetaTagContent(ogImageTag);

			const ogUrlTag = getMetaTag(html, 'og:url');
			const ogUrlContent = getMetaTagContent(ogUrlTag);

			const absoluteOgImageUrl = url.resolve(ogUrlContent, ogImageContent);
			const ogImageTagAbsoluteUrl = ogImageTag.replace(ogImageContent, absoluteOgImageUrl);
			const patchedHtml = html.replace(ogImageTag, ogImageTagAbsoluteUrl);

			fs.writeFileSync(htmlPath, patchedHtml);
		} catch (error) {
			spinner.fail(error.message);

			hasErrors = true;
		}

		const end = Date.now();
		const symbol = hasErrors ? chalk.red('✖') : '✨ ';
		const text = hasErrors ?
			chalk.red('Failed to fix og:image link.') :
			chalk.green(`Fixed og:image link in ${prettyMs(end - start)}.`);

		spinner.stopAndPersist({
			symbol,
			text
		});
	});
};
