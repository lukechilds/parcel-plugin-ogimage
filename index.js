const fs = require('fs');
const path = require('path');
const url = require('url');
const ora = require('ora');
const chalk = require('chalk');
const prettyMs = require('pretty-ms');
const glob = require('glob');

const getMetaTag = (html, property) => {
	const regex = new RegExp(`<meta[^>]*property=["|']${property}["|'][^>]*>`, 'i');
	const regexExec = regex.exec(html);
	if (regexExec) {
		return regexExec[0];
	}
	return false;
};

const getMetaTagContent = metaTagHtml => {
	const regex = /content=["]([^"]*)["]/i;
	const regexExec = regex.exec(metaTagHtml);
	if (regexExec) {
		return regexExec[1];
	}
	return false;
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
			const ogUrlTag = getMetaTag(html, 'og:url');

			if (ogImageTag && ogUrlTag) {
				const ogImageContent = getMetaTagContent(ogImageTag);
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
