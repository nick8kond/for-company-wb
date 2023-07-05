const selectors = {
	blockListSizes: '.sizes-list',
	buttonAllSizes: '.show-all-sizes',
	buttonSize: '//span[@class="sizes-list__size"]',
	sizeSoldOut: '.sold-out-product',
	buttonAddItemToCart: '//button[@class="btn-main"]',
	buttonBasket: 'a[data-wba-header-name="Cart"]',
	blockListItemsToCart: '.list-item__wrap',
	buttonAddOneItem: '//button[@class="count__plus plus"]',
	buttonRemoveItem: '.j-basket-item-del',
	countPositions: '//input[@data-link="{:quantity:}"]'
};

export default selectors;
