import puppeteer from 'puppeteer';
import selectors from './selectors.js';

export default class Parser {
	#articles;

	constructor(articles) {
		this.#articles = articles;
	}

	#getUrl(article) {
		return `https://www.wildberries.ru/catalog/${article}/detail.aspx?targetUrl=KZ`;
	}

	#sleep(milliseconds) {
		return new Promise(resolve => setTimeout(resolve, milliseconds));
	}

	async getInfoItems() {
		const browser = await puppeteer.launch({
			headless: false,
			defaultViewport: null,
			args: ['--no-sandbox', '--start-maximized ']
		});

		const page = await browser.newPage();
		await page.setUserAgent(
			'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5639.210 Safari/537.36'
		);

		const result = [];

		for (const article of this.#articles) {
			page.setDefaultNavigationTimeout(0);

			await page.goto(this.#getUrl(article), {
				waitUntil: ['domcontentloaded', 'load']
			});
			await page.waitForSelector(selectors.blockListSizes, {
				visible: true
			});

			const buttonAllSizes = await page.$(selectors.buttonAllSizes);
			buttonAllSizes && (await buttonAllSizes.click());

			const sizesInStock = await this.#checkSoldOutSizes(page);

			result.push({ article, ...sizesInStock });
		}

		await browser.close();

		return result;
	}

	async #checkSoldOutSizes(page) {
		let inStock = {};

		const buttonsSizes = await page.$x(selectors.buttonSize);

		for (let i = 0; i < buttonsSizes.length; i++) {
			try {
				await buttonsSizes[i].click();
				const isSold = await page.$(selectors.sizeSoldOut);

				if (!isSold) {
					const size = await buttonsSizes[i].evaluate(el => el.textContent);
					inStock[size] = 1;

					const buttonAddItemToCart = await page.$x(
						selectors.buttonAddItemToCart
					);
					await buttonAddItemToCart[1].click();
					await this.#sleep(387);
				}
			} catch (e) {
				console.error(e);
			}
		}

		await page.click(selectors.buttonBasket);
		await this.#sleep(2_000);

		const itemsInStock = await this.#getItemsInStock(page);
		inStock = Object.entries(inStock);

		for (let i = 0; i < inStock.length; i++) inStock[i][1] = itemsInStock[i];

		return Object.fromEntries(inStock);
	}

	async #getItemsInStock(page) {
		const buttonsRemoveItem = await page.$$(selectors.buttonRemoveItem);

		const [buttonsAddOneItem, countPositions] = await Promise.all([
			page.$x(selectors.buttonAddOneItem),
			page.$x(selectors.countPositions)
		]);

		const itemsInStock = [];

		for (let i = 0; i < buttonsAddOneItem.length; i++) {
			while (true) {
				await buttonsAddOneItem[i].click();
				// await this.#sleep(87);

				const statusClick = await buttonsAddOneItem[i].evaluate(el =>
					el.getAttribute('class')
				);
				// await this.#sleep(481);

				if (statusClick === 'count__plus plus disabled') {
					const valueCountPositions = +(await page.evaluate(
						el => el.value,
						countPositions[i]
					));
					await buttonsRemoveItem[i].click();
					// await this.#sleep(481);

					itemsInStock.push(valueCountPositions);
					break;
				}
			}
		}

		return itemsInStock.reverse();
	}
}
