const csv = require('csvtojson');
const fs = require('fs');

function getNumber(str) {
  if (str.charAt(0) === '$') {
    return parseFloat(str.substr(1));
  } else {
    return parseFloat(str);
  }
}

async function importCsvFile(csvFilePath) {
  let res;
  try {
    res = await csv().fromFile(csvFilePath);
  } catch (e) {
    throw new Error('Error parsing CSV:', e);
  }

  let currentProduct;

  const products = [];

  for (const row of res) {
    if (row['Shopify Recipe Name']) {
      if (currentProduct) products.push({ ...currentProduct });

      currentProduct = {
        title: row['Shopify Recipe Name'],
        label: {
          title: undefined,
          instructions: undefined,
        },
        jar: false,
        // packaging: '',
        recipe: {
          quantity: getNumber(row['qty per recipe']),
          unit: getNumber(row['Qty unit']),
          ingredients: [],
          instructions: [],
        },
      };
    }

    if (row['Recipe Instructions']) {
      currentProduct.recipe.instructions.push(row['Recipe Instructions']);
    }

    const ingredientName = row['Ingredient'].trim();
    const lowerCased = ingredientName.toLowerCase();
    if (ingredientName) {
      if (lowerCased === 'jar') {
        currentProduct.jar = true;
      } else if (
        lowerCased === 'total' ||
        lowerCased === 'per cup' ||
        lowerCased === 'per tin' ||
        lowerCased === 'full 1-lb' ||
        lowerCased === 'per half pint' ||
        lowerCased === 'quart' ||
        lowerCased === 'pint' ||
        lowerCased === 'dozen' ||
        lowerCased === 'half dozen' ||
        lowerCased === 'tin' ||
        lowerCased === 'container'
      ) {
        // do nothing
      } else {
        const isProduct = ingredientName.substr(0, 7) === 'RECIPE:';

        const ingredient = {
          ingredient: ingredientName,
          quantity: getNumber(row['qty per recipe']),
          unit: row['Qty unit'],
          note: row['Notes'],
          price: getNumber(row['Current Price']),
          source: '',
          product: isProduct,
        };

        currentProduct.recipe.ingredients.push(ingredient);
      }
    }
  }

  products.push(currentProduct);

  return products;
}

const filePath = process.argv[2];

if (!filePath) throw 'No file path was given.';

importCsvFile(filePath).then((products) => {
  for (const product of products) {
    const productFilePath = `./src/products/${product.title}.json`;

    if (fs.existsSync(productFilePath)) {
      console.log('Recipe Already Exists! Skipping ' + product.title);
      continue;
    }

    fs.writeFileSync(productFilePath, JSON.stringify(product, undefined, 2));
  }
});
