const ora = require('ora');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const prettyMs = require('pretty-ms');

module.exports = bundler => {
  bundler.on('buildEnd', async () => {
    if (process.env.NODE_ENV !== 'production') return;
    console.log('');
    const spinner = ora(chalk.grey('Fixing og:image link')).start();
		const start = Date.now();

		const htmlPath = path.join(bundler.options.outDir, 'index.html');
		const html = fs.openSync(htmlPath).toString();

		console.log(html);

    const end = Date.now();
    spinner.stopAndPersist({
      symbol: '✨ ',
      text: chalk.green(`Fixed og:image link in ${prettyMs(end - start)}.`)
    });
};
