const fs = require('fs');
const path = require('path');
const url = require('url');
const ora = require('ora');
const chalk = require('chalk');
const prettyMs = require('pretty-ms');

const getMetaTag = (html, property) => {
	const regex = new RegExp(`<meta[^>]*[property|name]=["|']${property}["|'][^>]*>`, 'i');

	return regex.exec(html)[0];
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
		const spinner = ora(chalk.grey('Fixing og:image and twitter:image link')).start();
		const start = Date.now();

		const htmlPath = path.join(bundler.options.outDir, 'index.html');
		const html = fs.readFileSync(htmlPath).toString();

		const ogImageTag = getMetaTag(html, 'og:image');
		const ogImageContent = getMetaTagContent(ogImageTag);

		const twitterImageTag = getMetaTag(html, 'twitter:image');
		const twitterImageContent = getMetaTagContent(twitterImageTag);

		const ogUrlTag = getMetaTag(html, 'og:url');
		const ogUrlContent = getMetaTagContent(ogUrlTag);

		const absoluteOgImageUrl = url.resolve(ogUrlContent, ogImageContent);
		const ogImageTagAbsoluteUrl = ogImageTag.replace(ogImageContent, absoluteOgImageUrl);

		const absoluteTwitterImageUrl = url.resolve(ogUrlContent, twitterImageContent);
		const twitterImageTagAbsoluteUrl = twitterImageTag.replace(twitterImageContent, absoluteTwitterImageUrl);
		const patchedHtml =
			html.replace(ogImageTag, ogImageTagAbsoluteUrl).replace(twitterImageTag, twitterImageTagAbsoluteUrl);

		fs.writeFileSync(htmlPath, patchedHtml);

		const end = Date.now();
		spinner.stopAndPersist({
			symbol: '✨ ',
			text: chalk.green(`Fixed og:image and twitter:image link in ${prettyMs(end - start)}.`)
		});
	});
};
