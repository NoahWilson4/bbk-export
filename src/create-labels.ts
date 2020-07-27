import _PDFDoc from 'pdfkit';
import { Orders, getOrderTotals } from './utils';
import blobStream from 'blob-stream';
import { DateTime } from 'luxon';
import { Product, instructionDefaults } from './products/index';
import radish from './radish-opaque.png';

const PDFDocument: typeof _PDFDoc = (window as any).PDFDocument;

const DEFAULT_MARGINS = {
  top: 35,
  left: 10,
  bottom: 35,
  right: 10,
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 790;

const CONTENT_WIDTH = PAGE_WIDTH - DEFAULT_MARGINS.left - DEFAULT_MARGINS.right;
const CONTENT_HEIGHT =
  PAGE_HEIGHT - DEFAULT_MARGINS.top - DEFAULT_MARGINS.bottom;

const LABEL_COLUMN_COUNT = 3;
const LABEL_ROW_COUNT = 10;

const SPACER_X = 5;
const SPACER_Y = 1;

const LABEL_WIDTH =
  (CONTENT_WIDTH - SPACER_X * (LABEL_COLUMN_COUNT - 1)) / LABEL_COLUMN_COUNT;
const LABEL_HEIGHT = (CONTENT_HEIGHT - SPACER_Y * (LABEL_ROW_COUNT - 1)) / 10;

const LABEL_PADDING = 5;

function getLabelX(column: number) {
  if (column === 0) return DEFAULT_MARGINS.left;
  else if (column === 1) return DEFAULT_MARGINS.left + LABEL_WIDTH + SPACER_X;
  else return DEFAULT_MARGINS.left + LABEL_WIDTH * 2 + SPACER_X * 2;
}

function getLabelY(row: number) {
  return DEFAULT_MARGINS.top + row * LABEL_HEIGHT + row * SPACER_Y;
}

function getLabelColumn(count: number) {
  return count % LABEL_COLUMN_COUNT;
}

function getLabelRow(count: number) {
  return Math.floor(count / LABEL_COLUMN_COUNT);
}

async function getImageDataUri(path: string): Promise<ArrayBuffer | undefined> {
  try {
    const res = await fetch(path);

    return await ((await res.blob()) as any).arrayBuffer();
  } catch (e) {
    console.warn(e);
  }
}

function drawLabel(
  doc: typeof _PDFDoc,
  row: number,
  column: number,
  item: { title: string; variant: string; instructions?: string },
  imageBlob?: ArrayBuffer
) {
  const x = getLabelX(column);
  const y = getLabelY(row);

  // doc.roundedRect(x, y, LABEL_WIDTH, LABEL_HEIGHT, 5).stroke();
  doc.image(
    imageBlob,
    x + LABEL_PADDING, // + LABEL_WIDTH * 0.75,
    y + LABEL_PADDING + LABEL_HEIGHT / 3.75,
    {
      width: LABEL_WIDTH / 5,
    }
  );

  const titleFontSize = 11;
  const instructionsFontSize = 9;
  const urlFontSize = 7;

  doc
    .fontSize(titleFontSize)
    .font('Helvetica-Bold')
    .text(
      `${item.title} - ${item.variant}`,
      x + LABEL_PADDING,
      y + LABEL_PADDING,
      {
        width: LABEL_WIDTH - LABEL_PADDING * 2,
        align: 'center',
      }
    );

  doc
    .lineGap(0)
    .fontSize(instructionsFontSize)
    .font('Helvetica')
    .text(
      item.instructions ||
        instructionDefaults[item.variant] ||
        instructionDefaults.default,
      {
        width: LABEL_WIDTH - LABEL_PADDING * 2,
        align: 'center',
      }
    );

  doc
    .fontSize(urlFontSize)
    .font('Helvetica')
    .text(
      'backtobasicskitchen.com',
      x + LABEL_PADDING,
      y + LABEL_HEIGHT - LABEL_PADDING - urlFontSize,
      {
        width: LABEL_WIDTH - LABEL_PADDING * 2,
        align: 'center',
      }
    );
}

export async function createLabels(
  orders: Orders,
  products: Product[]
): Promise<string> {
  const imageBlob = await getImageDataUri(radish);

  return new Promise((resolve, reject) => {
    const menuItems = getOrderTotals(orders);

    const now = DateTime.fromMillis(Date.now()).toLocaleString(
      DateTime.DATETIME_SHORT
    );

    const doc = new PDFDocument({
      info: {
        Title: `BBK Order Export ${now}`,
        Author: 'Back to Basics Kitchen',
      },
      layout: 'portrait',
      margins: DEFAULT_MARGINS,
    });
    const stream = doc.pipe(blobStream());

    let labelCount = 0;

    for (const title of Object.keys(menuItems)) {
      const { variants } = menuItems[title];

      const product = products.find((p) => p.title === title);

      for (const variantTitle of Object.keys(variants)) {
        const { quantity } = variants[variantTitle];

        for (let i = quantity; i > 0; i--) {
          drawLabel(
            doc,
            getLabelRow(labelCount),
            getLabelColumn(labelCount),
            {
              title: product?.label?.title || title,
              variant: variantTitle,
              instructions: product?.label?.instructions,
            },
            imageBlob
          );

          labelCount++;

          if (labelCount >= LABEL_COLUMN_COUNT * LABEL_ROW_COUNT) {
            labelCount = 0;
            doc.addPage();
          }
        }
      }
    }

    doc.end();
    stream.on('finish', () => {
      // get a blob you can do whatever you like with
      //   const blob = stream.toBlob('application/pdf');

      // or get a blob URL for display in the browser
      const url = stream.toBlobURL('application/pdf');

      resolve(url);
    });

    stream.on('error', (e) => {
      reject(e);
    });
  });
}

// const _orders: Orders = [
//   {
//     id: 'gid://shopify/Order/2521316196440',
//     note: '',
//     shippingAddress: {
//       name: 'Carole Almond',
//       address1: '1480 W Midway Blvd',
//       address2: '',
//       city: 'Broomfield',
//       zip: '80020',
//       phone: '(303) 862-4975',
//     },
//     tags: ['Broomfield Store Pick Up'],
//     items: [
//       {
//         quantity: 1,
//         name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//         title: 'Silky Coconut Panna Cotta with Peach Compote',
//         variantTitle: 'Half Pint',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Nourishing Blueberry Lemon Granola (Paleo) - Snack / Paleo',
//         title: 'Nourishing Blueberry Lemon Granola (Paleo)',
//         variantTitle: 'Snack / Paleo',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Grassfed Housemade Corned Beef Hash - Pint',
//         title: 'Grassfed Housemade Corned Beef Hash',
//         variantTitle: 'Pint',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//     ],
//   },
//   {
//     id: 'gid://shopify/Order/2521292570712',
//     note: '',
//     shippingAddress: {
//       name: 'Kate  Biers',
//       address1: '1806 Larchmont Court',
//       address2: '',
//       city: 'Lafayette',
//       zip: '80026',
//       phone: '(303) 666-6884',
//     },
//     tags: ['Lafayette Home Delivery'],
//     items: [
//       {
//         quantity: 1,
//         name: 'Lemon Poppy Seed Muffins (Paleo) - Four Muffins',
//         title: 'Lemon Poppy Seed Muffins (Paleo)',
//         variantTitle: 'Four Muffins',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Nourishing Blueberry Lemon Granola (Paleo) - Quart / Paleo',
//         title: 'Nourishing Blueberry Lemon Granola (Paleo)',
//         variantTitle: 'Quart / Paleo',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Cheesy Black Bean Tamale Pie - One Tin',
//         title: 'Cheesy Black Bean Tamale Pie',
//         variantTitle: 'One Tin',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Asian Style Cod and Vegetable Soup - Quart',
//         title: 'Asian Style Cod and Vegetable Soup',
//         variantTitle: 'Quart',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Grassfed Housemade Corned Beef Hash - Quart',
//         title: 'Grassfed Housemade Corned Beef Hash',
//         variantTitle: 'Quart',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//     ],
//   },
//   {
//     id: 'gid://shopify/Order/2521137807448',
//     note: '',
//     shippingAddress: {
//       name: 'Joshua Krinsky',
//       address1: '1900 Chalcis Dr',
//       address2: 'Unit C',
//       city: 'Lafayette',
//       zip: '80026',
//       phone: '7203087575',
//     },
//     tags: ['Lafayette Home Delivery'],
//     items: [
//       {
//         quantity: 1,
//         name: 'Frozen Creamy Pesto Quinoa Chicken Bake - Frozen Tin',
//         title: 'Frozen Creamy Pesto Quinoa Chicken Bake',
//         variantTitle: 'Frozen Tin',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Organic Almond Super Cookies (Paleo) - One Dozen',
//         title: 'Organic Almond Super Cookies (Paleo)',
//         variantTitle: 'One Dozen',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Lemon Poppy Seed Muffins (Paleo) - Half Dozen',
//         title: 'Lemon Poppy Seed Muffins (Paleo)',
//         variantTitle: 'Half Dozen',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//         title: 'Silky Coconut Panna Cotta with Peach Compote',
//         variantTitle: 'Half Pint',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Asian Style Cod and Vegetable Soup - Quart',
//         title: 'Asian Style Cod and Vegetable Soup',
//         variantTitle: 'Quart',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Grassfed Housemade Corned Beef Hash - Quart',
//         title: 'Grassfed Housemade Corned Beef Hash',
//         variantTitle: 'Quart',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//     ],
//   },
//   {
//     id: 'gid://shopify/Order/2520111349848',
//     note: '',
//     shippingAddress: {
//       name: 'Jaclyn Hamlin',
//       address1: '1480 W Midway Blvd',
//       address2: '',
//       city: 'Broomfield',
//       zip: '80020',
//       phone: '+18458072102',
//     },
//     tags: ['Broomfield Store Pick Up'],
//     items: [
//       {
//         quantity: 1,
//         name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//         title: 'Silky Coconut Panna Cotta with Peach Compote',
//         variantTitle: 'Half Pint',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Cheesy Black Bean Tamale Pie - One Tin',
//         title: 'Cheesy Black Bean Tamale Pie',
//         variantTitle: 'One Tin',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Grassfed Housemade Corned Beef Hash - Quart',
//         title: 'Grassfed Housemade Corned Beef Hash',
//         variantTitle: 'Quart',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//     ],
//   },
//   {
//     id: 'gid://shopify/Order/2519964123224',
//     note: '',
//     shippingAddress: {
//       name: 'Ingrid Julyk',
//       address1: '1480 W Midway Blvd',
//       address2: '',
//       city: 'Broomfield',
//       zip: '80020',
//       phone: '+13035967869',
//     },
//     tags: ['Broomfield Store Pick Up'],
//     items: [
//       {
//         quantity: 1,
//         name: 'Mustard and Rosemary Turkey Burgers - Four Burgers',
//         title: 'Mustard and Rosemary Turkey Burgers',
//         variantTitle: 'Four Burgers',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//     ],
//   },
//   {
//     id: 'gid://shopify/Order/2519860707416',
//     note: '',
//     shippingAddress: {
//       name: 'Jeff Doktor',
//       address1: '2510 47th Street',
//       address2: '',
//       city: 'Boulder',
//       zip: '80301',
//       phone: '(303) 545-6829',
//     },
//     tags: ['Boulder Fermentation pick up'],
//     items: [
//       {
//         quantity: 1,
//         name: "Devil's Food Dark Chocolate Cupcakes (Paleo) - Four Cupcakes",
//         title: "Devil's Food Dark Chocolate Cupcakes (Paleo)",
//         variantTitle: 'Four Cupcakes',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Spanish Rice with Sweet Peas - Frozen Pint',
//         title: 'Spanish Rice with Sweet Peas',
//         variantTitle: 'Frozen Pint',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name:
//           'Greek Zucchini Ankara with Meatballs and Optional Feta Cheese - Frozen Pint / Feta',
//         title: 'Greek Zucchini Ankara with Meatballs and Optional Feta Cheese',
//         variantTitle: 'Frozen Pint / Feta',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'So Tasty Beet Hummus (Paleo) - Half Pint',
//         title: 'So Tasty Beet Hummus (Paleo)',
//         variantTitle: 'Half Pint',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 2,
//         name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//         title: 'Silky Coconut Panna Cotta with Peach Compote',
//         variantTitle: 'Half Pint',
//         fulfillableQuantity: 2,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Cheesy Black Bean Tamale Pie - One Tin',
//         title: 'Cheesy Black Bean Tamale Pie',
//         variantTitle: 'One Tin',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Grassfed Housemade Corned Beef Hash - Quart',
//         title: 'Grassfed Housemade Corned Beef Hash',
//         variantTitle: 'Quart',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//     ],
//   },
//   {
//     id: 'gid://shopify/Order/2518126198872',
//     note: '',
//     shippingAddress: {
//       name: 'Katherine Courage',
//       address1: '1710 3rd Ave.',
//       address2: '',
//       city: 'Longmont',
//       zip: '80501',
//       phone: '+19186334640',
//     },
//     tags: ['Longmont Home Delivery'],
//     items: [
//       {
//         quantity: 1,
//         name: 'Grassfed Beef Sloppy Joes - Frozen Pint',
//         title: 'Grassfed Beef Sloppy Joes',
//         variantTitle: 'Frozen Pint',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       {
//         quantity: 1,
//         name: 'Frozen Creamy Pesto Quinoa Chicken Bake - Frozen Tin',
//         title: 'Frozen Creamy Pesto Quinoa Chicken Bake',
//         variantTitle: 'Frozen Tin',
//         fulfillableQuantity: 1,
//         nonFulfillableQuantity: 0,
//       },
//       // {
//       //   quantity: 2,
//       //   name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//       //   title: 'Silky Coconut Panna Cotta with Peach Compote',
//       //   variantTitle: 'Half Pint',
//       //   fulfillableQuantity: 2,
//       //   nonFulfillableQuantity: 0,
//       // },
//       // {
//       //   quantity: 1,
//       //   name: 'Grassfed Housemade Corned Beef Hash - Quart',
//       //   title: 'Grassfed Housemade Corned Beef Hash',
//       //   variantTitle: 'Quart',
//       //   fulfillableQuantity: 1,
//       //   nonFulfillableQuantity: 0,
//       // },
//       // {
//       //   quantity: 2,
//       //   name: 'Mustard and Rosemary Turkey Burgers - Four Burgers',
//       //   title: 'Mustard and Rosemary Turkey Burgers',
//       //   variantTitle: 'Four Burgers',
//       //   fulfillableQuantity: 2,
//       //   nonFulfillableQuantity: 0,
//       // },
//     ],
//   },
//   // {
//   //   id: 'gid://shopify/Order/2517931196504',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Miwa Mack',
//   //     address1: '4887 Kings Ridge Boulevard',
//   //     address2: '',
//   //     city: 'Boulder',
//   //     zip: '80301',
//   //     phone: '+13037184481',
//   //   },
//   //   tags: ['Boulder Home Delivery'],
//   //   items: [
//   //     {
//   //       quantity: 2,
//   //       name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//   //       title: 'Silky Coconut Panna Cotta with Peach Compote',
//   //       variantTitle: 'Half Pint',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Beef Sloppy Joes - Frozen Pint',
//   //       title: 'Grassfed Beef Sloppy Joes',
//   //       variantTitle: 'Frozen Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Frozen Housemade Bone Broths - Frozen CHICKEN',
//   //       title: 'Frozen Housemade Bone Broths',
//   //       variantTitle: 'Frozen CHICKEN',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 2,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Quart',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Quart',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Mustard and Rosemary Turkey Burgers - Four Burgers',
//   //       title: 'Mustard and Rosemary Turkey Burgers',
//   //       variantTitle: 'Four Burgers',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2517598863448',
//   //   note:
//   //     'I will actually be picking this up tonight from you Susanna! Thank you AND if anything is unavailable, just credit a gift card for me to use later for the amount! Thank you A MILLION for this, you are amazing! Hugs~ Erin ',
//   //   shippingAddress: {
//   //     name: 'Erin Furman',
//   //     address1: '1480 W Midway Blvd',
//   //     address2: '',
//   //     city: 'Broomfield',
//   //     zip: '80020',
//   //     phone: '+13038841197',
//   //   },
//   //   tags: ['Broomfield Store Pick Up'],
//   //   items: [
//   //     {
//   //       quantity: 3,
//   //       name: 'Frozen Housemade Bone Broths - Frozen CHICKEN',
//   //       title: 'Frozen Housemade Bone Broths',
//   //       variantTitle: 'Frozen CHICKEN',
//   //       fulfillableQuantity: 3,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Creamy Pesto Lasagna with Greens and Cheese - Frozen Tin',
//   //       title: 'Creamy Pesto Lasagna with Greens and Cheese',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Frozen Creamy Pesto Quinoa Chicken Bake - Frozen Tin',
//   //       title: 'Frozen Creamy Pesto Quinoa Chicken Bake',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Quart',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Quart',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 3,
//   //       name: 'Mustard and Rosemary Turkey Burgers - Two Burgers',
//   //       title: 'Mustard and Rosemary Turkey Burgers',
//   //       variantTitle: 'Two Burgers',
//   //       fulfillableQuantity: 3,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Cheesy Black Bean Tamale Pie - Frozen Tin',
//   //       title: 'Cheesy Black Bean Tamale Pie',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 2,
//   //       name:
//   //         'Greek Zucchini Ankara with Meatballs and Optional Feta Cheese - Frozen Pint / DAIRY FREE',
//   //       title: 'Greek Zucchini Ankara with Meatballs and Optional Feta Cheese',
//   //       variantTitle: 'Frozen Pint / DAIRY FREE',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 3,
//   //       name: 'Spanish Rice with Sweet Peas - Frozen Pint',
//   //       title: 'Spanish Rice with Sweet Peas',
//   //       variantTitle: 'Frozen Pint',
//   //       fulfillableQuantity: 3,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 3,
//   //       name: 'Nourishing Blueberry Lemon Granola (Paleo) - Quart / Paleo',
//   //       title: 'Nourishing Blueberry Lemon Granola (Paleo)',
//   //       variantTitle: 'Quart / Paleo',
//   //       fulfillableQuantity: 3,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 2,
//   //       name: 'So Tasty Beet Hummus (Paleo) - Frozen Half Pint',
//   //       title: 'So Tasty Beet Hummus (Paleo)',
//   //       variantTitle: 'Frozen Half Pint',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2517557117016',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Carla Hoehn',
//   //     address1: '1155 Berea Drive',
//   //     address2: '',
//   //     city: 'Boulder',
//   //     zip: '80305',
//   //     phone: '+1 303-378-3048',
//   //   },
//   //   tags: ['Boulder Home Delivery'],
//   //   items: [
//   //     {
//   //       quantity: 2,
//   //       name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//   //       title: 'Silky Coconut Panna Cotta with Peach Compote',
//   //       variantTitle: 'Half Pint',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Creamy Pesto Lasagna with Greens and Cheese - Frozen Tin',
//   //       title: 'Creamy Pesto Lasagna with Greens and Cheese',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2517422571608',
//   //   note:
//   //     'So very sorry to hear about Amy.  Please let her know we are thinking of her and sending all best wishes/prayers.\r\nI have been wanting to again suggest you enlarge the lettering on your labels and maybe now is the time.  I have  to use my handy magnifying glass.  The ones you improvised this week are great!  Thank you to your significant other!!',
//   //   shippingAddress: {
//   //     name: 'Johannah Franke',
//   //     address1: '1730 Norwood Avenue',
//   //     address2: '',
//   //     city: 'Boulder',
//   //     zip: '80304-1218',
//   //     phone: '+13034473967',
//   //   },
//   //   tags: ['Boulder Home Delivery'],
//   //   items: [
//   //     {
//   //       quantity: 2,
//   //       name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//   //       title: 'Silky Coconut Panna Cotta with Peach Compote',
//   //       variantTitle: 'Half Pint',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Asian Style Cod and Vegetable Soup - Quart',
//   //       title: 'Asian Style Cod and Vegetable Soup',
//   //       variantTitle: 'Quart',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 3,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Pint',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Pint',
//   //       fulfillableQuantity: 3,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Mustard and Rosemary Turkey Burgers - Four Burgers',
//   //       title: 'Mustard and Rosemary Turkey Burgers',
//   //       variantTitle: 'Four Burgers',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2517113733208',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Jessica Tozlowski',
//   //     address1: '1480 W Midway Blvd',
//   //     address2: '',
//   //     city: 'Broomfield',
//   //     zip: '80020',
//   //     phone: '(978) 987-0886',
//   //   },
//   //   tags: ['Broomfield Curbside'],
//   //   items: [
//   //     {
//   //       quantity: 2,
//   //       name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//   //       title: 'Silky Coconut Panna Cotta with Peach Compote',
//   //       variantTitle: 'Half Pint',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2516643840088',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Jennifer Towle',
//   //     address1: '541 Locust Place',
//   //     address2: '',
//   //     city: 'Boulder',
//   //     zip: '80304',
//   //     phone: '+17203525518',
//   //   },
//   //   tags: ['Boulder Home Delivery'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Quart',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Quart',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Mustard and Rosemary Turkey Burgers - Four Burgers',
//   //       title: 'Mustard and Rosemary Turkey Burgers',
//   //       variantTitle: 'Four Burgers',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2516267270232',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Jamie Harkins',
//   //     address1: '1480 W Midway Blvd',
//   //     address2: '',
//   //     city: 'Broomfield',
//   //     zip: '80020',
//   //     phone: '+17204324128',
//   //   },
//   //   tags: ['Broomfield Curbside'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Chewy Cinnamon Raisin Cookies (Paleo) - Half Dozen',
//   //       title: 'Chewy Cinnamon Raisin Cookies (Paleo)',
//   //       variantTitle: 'Half Dozen',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Beef Sloppy Joes - Frozen Pint',
//   //       title: 'Grassfed Beef Sloppy Joes',
//   //       variantTitle: 'Frozen Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Mustard and Rosemary Turkey Burgers - Two Burgers',
//   //       title: 'Mustard and Rosemary Turkey Burgers',
//   //       variantTitle: 'Two Burgers',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2516101005400',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Frances Mosakowski',
//   //     address1: '1480 W Midway Blvd',
//   //     address2: '',
//   //     city: 'Broomfield',
//   //     zip: '80020',
//   //     phone: '(720) 470-3077',
//   //   },
//   //   tags: ['Broomfield Curbside'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//   //       title: 'Silky Coconut Panna Cotta with Peach Compote',
//   //       variantTitle: 'Half Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 2,
//   //       name: 'Asian Style Cod and Vegetable Soup - Pint',
//   //       title: 'Asian Style Cod and Vegetable Soup',
//   //       variantTitle: 'Pint',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 2,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Pint',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Pint',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515919143000',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Melissa Schmierbach',
//   //     address1: '817 Incorrigible Circle',
//   //     address2: '',
//   //     city: 'Longmont',
//   //     zip: '80504',
//   //     phone: '(303) 903-3260',
//   //   },
//   //   tags: ['Longmont Home Delivery'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Nourishing Blueberry Lemon Granola (Paleo) - Snack / Paleo',
//   //       title: 'Nourishing Blueberry Lemon Granola (Paleo)',
//   //       variantTitle: 'Snack / Paleo',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Organic Almond Super Cookies (Paleo) - Half Dozen',
//   //       title: 'Organic Almond Super Cookies (Paleo)',
//   //       variantTitle: 'Half Dozen',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Beef Sloppy Joes - Frozen Pint',
//   //       title: 'Grassfed Beef Sloppy Joes',
//   //       variantTitle: 'Frozen Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Creamy Pesto Lasagna with Greens and Cheese - Frozen Tin',
//   //       title: 'Creamy Pesto Lasagna with Greens and Cheese',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Frozen Creamy Pesto Quinoa Chicken Bake - Frozen Tin',
//   //       title: 'Frozen Creamy Pesto Quinoa Chicken Bake',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Cheesy Black Bean Tamale Pie - Frozen Tin',
//   //       title: 'Cheesy Black Bean Tamale Pie',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Mustard and Rosemary Turkey Burgers - Four Burgers',
//   //       title: 'Mustard and Rosemary Turkey Burgers',
//   //       variantTitle: 'Four Burgers',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515749535832',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Lacey Taylor',
//   //     address1: '2510 47th Street',
//   //     address2: '',
//   //     city: 'Boulder',
//   //     zip: '80301',
//   //     phone: '+1 914-584-2370',
//   //   },
//   //   tags: ['Boulder Fermentation pick up'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Quart',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Quart',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Mustard and Rosemary Turkey Burgers - Four Burgers',
//   //       title: 'Mustard and Rosemary Turkey Burgers',
//   //       variantTitle: 'Four Burgers',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515738886232',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Leisa Jackson',
//   //     address1: '2510 47th Street',
//   //     address2: '',
//   //     city: 'Boulder',
//   //     zip: '80301',
//   //     phone: '+13037041073',
//   //   },
//   //   tags: ['Boulder Fermentation pick up'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Asian Style Cod and Vegetable Soup - Quart',
//   //       title: 'Asian Style Cod and Vegetable Soup',
//   //       variantTitle: 'Quart',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Organic Almond Super Cookies (Paleo) - One Dozen',
//   //       title: 'Organic Almond Super Cookies (Paleo)',
//   //       variantTitle: 'One Dozen',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Lemon Poppy Seed Muffins (Paleo) - Four Muffins',
//   //       title: 'Lemon Poppy Seed Muffins (Paleo)',
//   //       variantTitle: 'Four Muffins',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Quart',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Quart',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515717062744',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Charlotte Bujol',
//   //     address1: '1935 Tincup Court',
//   //     address2: '',
//   //     city: 'Boulder',
//   //     zip: '80305',
//   //     phone: '(225) 405-2000',
//   //   },
//   //   tags: ['Boulder Home Delivery'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Organic Almond Super Cookies (Paleo) - One Dozen',
//   //       title: 'Organic Almond Super Cookies (Paleo)',
//   //       variantTitle: 'One Dozen',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 2,
//   //       name: 'Chewy Cinnamon Raisin Cookies (Paleo) - Dozen',
//   //       title: 'Chewy Cinnamon Raisin Cookies (Paleo)',
//   //       variantTitle: 'Dozen',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Creamy Pesto Lasagna with Greens and Cheese - Frozen Tin',
//   //       title: 'Creamy Pesto Lasagna with Greens and Cheese',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 4,
//   //       name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//   //       title: 'Silky Coconut Panna Cotta with Peach Compote',
//   //       variantTitle: 'Half Pint',
//   //       fulfillableQuantity: 4,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Frozen Creamy Pesto Quinoa Chicken Bake - Frozen Tin',
//   //       title: 'Frozen Creamy Pesto Quinoa Chicken Bake',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515647463512',
//   //   note:
//   //     'My mom, Lauren Kingsbery, loves you guys. Excited for our first order!!',
//   //   shippingAddress: {
//   //     name: 'Kate Cole',
//   //     address1: '1480 W Midway Blvd',
//   //     address2: '',
//   //     city: 'Broomfield',
//   //     zip: '80020',
//   //     phone: '(303) 579-9329',
//   //   },
//   //   tags: ['Broomfield Curbside'],
//   //   items: [
//   //     {
//   //       quantity: 2,
//   //       name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//   //       title: 'Silky Coconut Panna Cotta with Peach Compote',
//   //       variantTitle: 'Half Pint',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Fresh from Scratch Refried Pinto Beans - Frozen Pint',
//   //       title: 'Fresh from Scratch Refried Pinto Beans',
//   //       variantTitle: 'Frozen Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Frozen Creamy Pesto Quinoa Chicken Bake - Frozen Tin',
//   //       title: 'Frozen Creamy Pesto Quinoa Chicken Bake',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Cheesy Black Bean Tamale Pie - Frozen Tin',
//   //       title: 'Cheesy Black Bean Tamale Pie',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515466846296',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Kathryn Wendell',
//   //     address1: '1055 8th Street',
//   //     address2: '',
//   //     city: 'Boulder',
//   //     zip: '80302',
//   //     phone: '+14123103512',
//   //   },
//   //   tags: ['Boulder Home Delivery'],
//   //   items: [
//   //     {
//   //       quantity: 3,
//   //       name: 'Frozen Creamy Pesto Quinoa Chicken Bake - Frozen Tin',
//   //       title: 'Frozen Creamy Pesto Quinoa Chicken Bake',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 3,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 2,
//   //       name:
//   //         'Greek Zucchini Ankara with Meatballs and Optional Feta Cheese - Frozen Pint / Feta',
//   //       title: 'Greek Zucchini Ankara with Meatballs and Optional Feta Cheese',
//   //       variantTitle: 'Frozen Pint / Feta',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 2,
//   //       name: 'Asian Style Cod and Vegetable Soup - Quart',
//   //       title: 'Asian Style Cod and Vegetable Soup',
//   //       variantTitle: 'Quart',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515430572120',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Kendi Davies',
//   //     address1: '2895 Colby Drive',
//   //     address2: '',
//   //     city: 'Boulder',
//   //     zip: '80305',
//   //     phone: '+17202555902',
//   //   },
//   //   tags: ['Boulder Home Delivery'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Asian Style Cod and Vegetable Soup - Pint',
//   //       title: 'Asian Style Cod and Vegetable Soup',
//   //       variantTitle: 'Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Spanish Rice with Sweet Peas - Frozen Pint',
//   //       title: 'Spanish Rice with Sweet Peas',
//   //       variantTitle: 'Frozen Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Cheesy Black Bean Tamale Pie - Frozen Tin',
//   //       title: 'Cheesy Black Bean Tamale Pie',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515398590552',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Christina Pulaski',
//   //     address1: '3034 Shoshone Trail',
//   //     address2: '',
//   //     city: 'Lafayette',
//   //     zip: '80026',
//   //     phone: '+1 303-330-8658',
//   //   },
//   //   tags: ['Lafayette Home Delivery'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: "Devil's Food Dark Chocolate Cupcakes (Paleo) - Half Dozen",
//   //       title: "Devil's Food Dark Chocolate Cupcakes (Paleo)",
//   //       variantTitle: 'Half Dozen',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Lemon Poppy Seed Muffins (Paleo) - Half Dozen',
//   //       title: 'Lemon Poppy Seed Muffins (Paleo)',
//   //       variantTitle: 'Half Dozen',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Organic Almond Super Cookies (Paleo) - One Dozen',
//   //       title: 'Organic Almond Super Cookies (Paleo)',
//   //       variantTitle: 'One Dozen',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//   //       title: 'Silky Coconut Panna Cotta with Peach Compote',
//   //       variantTitle: 'Half Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 3,
//   //       name: 'Mustard and Rosemary Turkey Burgers - Four Burgers',
//   //       title: 'Mustard and Rosemary Turkey Burgers',
//   //       variantTitle: 'Four Burgers',
//   //       fulfillableQuantity: 3,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515378896984',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Christine Grosser',
//   //     address1: '924 Main St',
//   //     address2: '',
//   //     city: 'Louisville',
//   //     zip: '80027',
//   //     phone: '(303) 408-6375',
//   //   },
//   //   tags: ['Louisville Family Center'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Mustard and Rosemary Turkey Burgers - Four Burgers',
//   //       title: 'Mustard and Rosemary Turkey Burgers',
//   //       variantTitle: 'Four Burgers',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 2,
//   //       name: 'Local Pork Chorizo Taco Filling - Frozen Pint',
//   //       title: 'Local Pork Chorizo Taco Filling',
//   //       variantTitle: 'Frozen Pint',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 2,
//   //       name: 'So Tasty Beet Hummus (Paleo) - Frozen Half Pint',
//   //       title: 'So Tasty Beet Hummus (Paleo)',
//   //       variantTitle: 'Frozen Half Pint',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515367034968',
//   //   note:
//   //     'Also add two frozen items from previous missed pick up when bagging this order.',
//   //   shippingAddress: {
//   //     name: 'Jennifer Walsh',
//   //     address1: '1480 W Midway Blvd',
//   //     address2: '',
//   //     city: 'Broomfield',
//   //     zip: '80020',
//   //     phone: '+13038425414',
//   //   },
//   //   tags: ['Broomfield Curbside'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Spanish Rice with Sweet Peas - Frozen Pint',
//   //       title: 'Spanish Rice with Sweet Peas',
//   //       variantTitle: 'Frozen Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Creamy Pesto Lasagna with Greens and Cheese - Frozen Tin',
//   //       title: 'Creamy Pesto Lasagna with Greens and Cheese',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Asian Style Cod and Vegetable Soup - Pint',
//   //       title: 'Asian Style Cod and Vegetable Soup',
//   //       variantTitle: 'Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Quart',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Quart',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515360579672',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'KELLY SCHOMER',
//   //     address1: '1480 W Midway Blvd',
//   //     address2: '',
//   //     city: 'Broomfield',
//   //     zip: '80020',
//   //     phone: '+17203357330',
//   //   },
//   //   tags: ['Broomfield Curbside'],
//   //   items: [
//   //     {
//   //       quantity: 2,
//   //       name: 'So Tasty Beet Hummus (Paleo) - Frozen Half Pint',
//   //       title: 'So Tasty Beet Hummus (Paleo)',
//   //       variantTitle: 'Frozen Half Pint',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//   //       title: 'Silky Coconut Panna Cotta with Peach Compote',
//   //       variantTitle: 'Half Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Quart',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Quart',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515324600408',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Gary Giglio',
//   //     address1: '1480 W Midway Blvd',
//   //     address2: '',
//   //     city: 'Broomfield',
//   //     zip: '80020',
//   //     phone: '(303) 469-2020',
//   //   },
//   //   tags: ['Broomfield Curbside'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Mustard and Rosemary Turkey Burgers - Four Burgers',
//   //       title: 'Mustard and Rosemary Turkey Burgers',
//   //       variantTitle: 'Four Burgers',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Asian Style Cod and Vegetable Soup - Quart',
//   //       title: 'Asian Style Cod and Vegetable Soup',
//   //       variantTitle: 'Quart',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515324141656',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Anna Teresa Mahaffy',
//   //     address1: '516 College Avenue',
//   //     address2: '',
//   //     city: 'Boulder',
//   //     zip: '80302',
//   //     phone: '+13037181783',
//   //   },
//   //   tags: ['Boulder Home Delivery'],
//   //   items: [
//   //     {
//   //       quantity: 10,
//   //       name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//   //       title: 'Silky Coconut Panna Cotta with Peach Compote',
//   //       variantTitle: 'Half Pint',
//   //       fulfillableQuantity: 10,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515296223320',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Deb Matlock',
//   //     address1: '445 London Avenue',
//   //     address2: '',
//   //     city: 'Lafayette',
//   //     zip: '80026',
//   //     phone: '+13036667847',
//   //   },
//   //   tags: ['Lafayette Home Delivery'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Chewy Cinnamon Raisin Cookies (Paleo) - Dozen',
//   //       title: 'Chewy Cinnamon Raisin Cookies (Paleo)',
//   //       variantTitle: 'Dozen',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Nourishing Blueberry Lemon Granola (Paleo) - Quart / Paleo',
//   //       title: 'Nourishing Blueberry Lemon Granola (Paleo)',
//   //       variantTitle: 'Quart / Paleo',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Crisp Cabbage Slaw with Lime Cumin Vinaigrette - Frozen Pint',
//   //       title: 'Crisp Cabbage Slaw with Lime Cumin Vinaigrette',
//   //       variantTitle: 'Frozen Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Fresh from Scratch Refried Pinto Beans - Frozen Pint',
//   //       title: 'Fresh from Scratch Refried Pinto Beans',
//   //       variantTitle: 'Frozen Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Spanish Rice with Sweet Peas - Frozen Pint',
//   //       title: 'Spanish Rice with Sweet Peas',
//   //       variantTitle: 'Frozen Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'So Tasty Beet Hummus (Paleo) - Frozen Half Pint',
//   //       title: 'So Tasty Beet Hummus (Paleo)',
//   //       variantTitle: 'Frozen Half Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 3,
//   //       name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//   //       title: 'Silky Coconut Panna Cotta with Peach Compote',
//   //       variantTitle: 'Half Pint',
//   //       fulfillableQuantity: 3,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Frozen Creamy Pesto Quinoa Chicken Bake - Frozen Tin',
//   //       title: 'Frozen Creamy Pesto Quinoa Chicken Bake',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Mustard and Rosemary Turkey Burgers - Four Burgers',
//   //       title: 'Mustard and Rosemary Turkey Burgers',
//   //       variantTitle: 'Four Burgers',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515282853976',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Lisa Denison',
//   //     address1: '1480 W Midway Blvd',
//   //     address2: '',
//   //     city: 'Broomfield',
//   //     zip: '80020',
//   //     phone: '(303) 593-2865',
//   //   },
//   //   tags: ['Broomfield Store Pick Up'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Quart',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Quart',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 2,
//   //       name: 'Mustard and Rosemary Turkey Burgers - Four Burgers',
//   //       title: 'Mustard and Rosemary Turkey Burgers',
//   //       variantTitle: 'Four Burgers',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515125207128',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Lynate Pettengill',
//   //     address1: '2510 47th Street',
//   //     address2: '',
//   //     city: 'Boulder',
//   //     zip: '80301',
//   //     phone: '+17853315556',
//   //   },
//   //   tags: ['Boulder Fermentation pick up'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Frozen Creamy Pesto Quinoa Chicken Bake - Frozen Tin',
//   //       title: 'Frozen Creamy Pesto Quinoa Chicken Bake',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name:
//   //         'Greek Zucchini Ankara with Meatballs and Optional Feta Cheese - Frozen Pint / Feta',
//   //       title: 'Greek Zucchini Ankara with Meatballs and Optional Feta Cheese',
//   //       variantTitle: 'Frozen Pint / Feta',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Cheesy Black Bean Tamale Pie - Frozen Tin',
//   //       title: 'Cheesy Black Bean Tamale Pie',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Quart',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Quart',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//   //       title: 'Silky Coconut Panna Cotta with Peach Compote',
//   //       variantTitle: 'Half Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515120750680',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Rebecca Ellis',
//   //     address1: '924 Main St',
//   //     address2: '',
//   //     city: 'Louisville',
//   //     zip: '80027',
//   //     phone: '(303) 359-6710',
//   //   },
//   //   tags: ['Louisville Family Center'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Cheesy Black Bean Tamale Pie - Frozen Tin',
//   //       title: 'Cheesy Black Bean Tamale Pie',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Pint',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Cheesy Black Bean Tamale Pie - One Tin',
//   //       title: 'Cheesy Black Bean Tamale Pie',
//   //       variantTitle: 'One Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2515084410968',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Nicole Piekarski',
//   //     address1: '1480 W Midway Blvd',
//   //     address2: '',
//   //     city: 'Broomfield',
//   //     zip: '80020',
//   //     phone: '(219) 916-5733',
//   //   },
//   //   tags: ['Broomfield Curbside'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Pint',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Quart',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Quart',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Beef Sloppy Joes - Frozen Pint',
//   //       title: 'Grassfed Beef Sloppy Joes',
//   //       variantTitle: 'Frozen Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2514540101720',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Patricia Retka',
//   //     address1: '1480 W Midway Blvd',
//   //     address2: '',
//   //     city: 'Broomfield',
//   //     zip: '80020',
//   //     phone: '+18459886254',
//   //   },
//   //   tags: ['Broomfield Curbside'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Purity Organic Coffee (Toxin Free) - Pint / Caffeine',
//   //       title: 'Purity Organic Coffee (Toxin Free)',
//   //       variantTitle: 'Pint / Caffeine',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Frozen Creamy Pesto Quinoa Chicken Bake - Frozen Tin',
//   //       title: 'Frozen Creamy Pesto Quinoa Chicken Bake',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Organic Almond Super Cookies (Paleo) - Half Dozen',
//   //       title: 'Organic Almond Super Cookies (Paleo)',
//   //       variantTitle: 'Half Dozen',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: "Devil's Food Dark Chocolate Cupcakes (Paleo) - Four Cupcakes",
//   //       title: "Devil's Food Dark Chocolate Cupcakes (Paleo)",
//   //       variantTitle: 'Four Cupcakes',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Pint',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Mustard and Rosemary Turkey Burgers - Four Burgers',
//   //       title: 'Mustard and Rosemary Turkey Burgers',
//   //       variantTitle: 'Four Burgers',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2514369052760',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Dale Gaar',
//   //     address1: '1946 Hardscrabble Drive',
//   //     address2: '',
//   //     city: 'Boulder',
//   //     zip: '80305',
//   //     phone: '+13034754464',
//   //   },
//   //   tags: ['Boulder Home Delivery'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Chewy Cinnamon Raisin Cookies (Paleo) - Dozen',
//   //       title: 'Chewy Cinnamon Raisin Cookies (Paleo)',
//   //       variantTitle: 'Dozen',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Organic Almond Super Cookies (Paleo) - One Dozen',
//   //       title: 'Organic Almond Super Cookies (Paleo)',
//   //       variantTitle: 'One Dozen',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: "Devil's Food Dark Chocolate Cupcakes (Paleo) - Four Cupcakes",
//   //       title: "Devil's Food Dark Chocolate Cupcakes (Paleo)",
//   //       variantTitle: 'Four Cupcakes',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 2,
//   //       name:
//   //         'Greek Zucchini Ankara with Meatballs and Optional Feta Cheese - Frozen Pint / Feta',
//   //       title: 'Greek Zucchini Ankara with Meatballs and Optional Feta Cheese',
//   //       variantTitle: 'Frozen Pint / Feta',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 2,
//   //       name: 'Frozen Creamy Pesto Quinoa Chicken Bake - Frozen Tin',
//   //       title: 'Frozen Creamy Pesto Quinoa Chicken Bake',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 3,
//   //       name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//   //       title: 'Silky Coconut Panna Cotta with Peach Compote',
//   //       variantTitle: 'Half Pint',
//   //       fulfillableQuantity: 3,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 3,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Pint',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Pint',
//   //       fulfillableQuantity: 3,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 2,
//   //       name: 'Mustard and Rosemary Turkey Burgers - Four Burgers',
//   //       title: 'Mustard and Rosemary Turkey Burgers',
//   //       variantTitle: 'Four Burgers',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2514354471000',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Jason Colley',
//   //     address1: '1480 W Midway Blvd',
//   //     address2: '',
//   //     city: 'Broomfield',
//   //     zip: '80020',
//   //     phone: '+17203202151',
//   //   },
//   //   tags: ['Broomfield Curbside'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Sanctuary Honey Chai Concentrate - Traditional',
//   //       title: 'Sanctuary Honey Chai Concentrate',
//   //       variantTitle: 'Traditional',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Creamy Pesto Lasagna with Greens and Cheese - Frozen Tin',
//   //       title: 'Creamy Pesto Lasagna with Greens and Cheese',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//   //       title: 'Silky Coconut Panna Cotta with Peach Compote',
//   //       variantTitle: 'Half Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Quart',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Quart',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2513542217816',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'megan dudley',
//   //     address1: '1480 W Midway Blvd',
//   //     address2: '',
//   //     city: 'Broomfield',
//   //     zip: '80020',
//   //     phone: '+15413067295',
//   //   },
//   //   tags: ['Broomfield Store Pick Up'],
//   //   items: [
//   //     {
//   //       quantity: 1,
//   //       name: 'Creamy Pesto Lasagna with Greens and Cheese - Frozen Tin',
//   //       title: 'Creamy Pesto Lasagna with Greens and Cheese',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Frozen Creamy Pesto Quinoa Chicken Bake - Frozen Tin',
//   //       title: 'Frozen Creamy Pesto Quinoa Chicken Bake',
//   //       variantTitle: 'Frozen Tin',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Crisp Cabbage Slaw with Lime Cumin Vinaigrette - Frozen Pint',
//   //       title: 'Crisp Cabbage Slaw with Lime Cumin Vinaigrette',
//   //       variantTitle: 'Frozen Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: "Devil's Food Dark Chocolate Cupcakes (Paleo) - Dozen",
//   //       title: "Devil's Food Dark Chocolate Cupcakes (Paleo)",
//   //       variantTitle: 'Dozen',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name:
//   //         'Greek Zucchini Ankara with Meatballs and Optional Feta Cheese - Frozen Pint / Feta',
//   //       title: 'Greek Zucchini Ankara with Meatballs and Optional Feta Cheese',
//   //       variantTitle: 'Frozen Pint / Feta',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Mustard and Rosemary Turkey Burgers - Two Burgers',
//   //       title: 'Mustard and Rosemary Turkey Burgers',
//   //       variantTitle: 'Two Burgers',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Grassfed Housemade Corned Beef Hash - Pint',
//   //       title: 'Grassfed Housemade Corned Beef Hash',
//   //       variantTitle: 'Pint',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 2,
//   //       name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//   //       title: 'Silky Coconut Panna Cotta with Peach Compote',
//   //       variantTitle: 'Half Pint',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Nourishing Blueberry Lemon Granola (Paleo) - Snack / Paleo',
//   //       title: 'Nourishing Blueberry Lemon Granola (Paleo)',
//   //       variantTitle: 'Snack / Paleo',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //     {
//   //       quantity: 1,
//   //       name: 'Organic Almond Super Cookies (Paleo) - Half Dozen',
//   //       title: 'Organic Almond Super Cookies (Paleo)',
//   //       variantTitle: 'Half Dozen',
//   //       fulfillableQuantity: 1,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
//   // {
//   //   id: 'gid://shopify/Order/2513443553368',
//   //   note: '',
//   //   shippingAddress: {
//   //     name: 'Beth Marbach',
//   //     address1: '1480 W Midway Blvd',
//   //     address2: '',
//   //     city: 'Broomfield',
//   //     zip: '80020',
//   //     phone: '+17209824250',
//   //   },
//   //   tags: ['Broomfield Store Pick Up'],
//   //   items: [
//   //     {
//   //       quantity: 2,
//   //       name: 'Silky Coconut Panna Cotta with Peach Compote - Half Pint',
//   //       title: 'Silky Coconut Panna Cotta with Peach Compote',
//   //       variantTitle: 'Half Pint',
//   //       fulfillableQuantity: 2,
//   //       nonFulfillableQuantity: 0,
//   //     },
//   //   ],
//   // },
// ];
