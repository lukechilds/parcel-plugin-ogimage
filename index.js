const fs = require('fs');
const path = require('path');
const url = require('url');
const ora = require('ora');
const chalk = require('chalk');
const prettyMs = require('pretty-ms');
const glob = require('glob');

const getMetaTag = (html, property) => {
	const regex = new RegExp(`<meta[^>]*property=["|']${property}["|'][^>]*>`, 'i');

	if (regex.exec(html)) {
		return regex.exec(html)[0];
	}
};

const getMetaTagContent = metaTagHtml => {
	const regex = /content=["]([^"]*)["]/i;

	return regex.exec(metaTagHtml)[1];
};

module.exports = bundler => {
	bundler.on('buildEnd', async () => {
		if (process.env.NODE_ENV !== 'production') {
			return;
		}
		console.log('');
		const spinner = ora(chalk.grey('Fixing og:image link')).start();
		const start = Date.now();

		glob.sync(`${bundler.options.outDir}/**/*.html`).forEach(file => {
			const htmlPath = path.resolve(file);
			const html = fs.readFileSync(htmlPath).toString();
			const ogImageTag = getMetaTag(html, 'og:image');

			if (ogImageTag) {
				const ogImageContent = getMetaTagContent(ogImageTag);
				const ogUrlTag = getMetaTag(html, 'og:url');
				const ogUrlContent = getMetaTagContent(ogUrlTag);
				const absoluteOgImageUrl = url.resolve(ogUrlContent, ogImageContent);
				const ogImageTagAbsoluteUrl = ogImageTag.replace(ogImageContent, absoluteOgImageUrl);
				const patchedHtml = html.replace(ogImageTag, ogImageTagAbsoluteUrl);

				fs.writeFileSync(htmlPath, patchedHtml);
			}
		});

		const end = Date.now();
		spinner.stopAndPersist({
			symbol: '✨ ',
			text: chalk.green(`Fixed og:image link in ${prettyMs(end - start)}.`)
		});
	});
};
