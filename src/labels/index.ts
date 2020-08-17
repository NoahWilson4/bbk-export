import _PDFDoc from 'pdfkit';
import {
  Orders,
  getOrderTotals,
  getOrdersByLocation,
  getOrdersByCustomerName,
} from '../utils';
import blobStream from 'blob-stream';
import { DateTime } from 'luxon';
import { Product } from '../products/index';
import radish from './radish-opaque.png';
import { drawItemLabel } from './order-item-label';
import { drawCustomerLabel } from './customer-labels';
import { drawExtrasLabel } from './extras-labels';

export const PDFDocument: typeof _PDFDoc = (window as any).PDFDocument;

export const DEFAULT_MARGINS = {
  top: 35,
  left: 10,
  bottom: 35,
  right: 10,
};

export const PAGE_WIDTH = 612;
export const PAGE_HEIGHT = 790;

export const CONTENT_WIDTH =
  PAGE_WIDTH - DEFAULT_MARGINS.left - DEFAULT_MARGINS.right;
export const CONTENT_HEIGHT =
  PAGE_HEIGHT - DEFAULT_MARGINS.top - DEFAULT_MARGINS.bottom;

export const LABEL_COLUMN_COUNT = 3;
export const LABEL_ROW_COUNT = 10;

export const SPACER_X = 5;
export const SPACER_Y = 1;

export const LABEL_WIDTH =
  (CONTENT_WIDTH - SPACER_X * (LABEL_COLUMN_COUNT - 1)) / LABEL_COLUMN_COUNT;
export const LABEL_HEIGHT =
  (CONTENT_HEIGHT - SPACER_Y * (LABEL_ROW_COUNT - 1)) / 10;

export const LABEL_PADDING = 5;

export function getLabelX(column: number) {
  if (column === 0) return DEFAULT_MARGINS.left;
  else if (column === 1) return DEFAULT_MARGINS.left + LABEL_WIDTH + SPACER_X;
  else return DEFAULT_MARGINS.left + LABEL_WIDTH * 2 + SPACER_X * 2;
}

export function getLabelY(row: number) {
  return DEFAULT_MARGINS.top + row * LABEL_HEIGHT + row * SPACER_Y;
}

export function getLabelColumn(count: number) {
  return count % LABEL_COLUMN_COUNT;
}

export function getLabelRow(count: number) {
  return Math.floor(count / LABEL_COLUMN_COUNT);
}

export async function getImageDataUri(
  path: string
): Promise<ArrayBuffer | undefined> {
  try {
    const res = await fetch(path);

    return await ((await res.blob()) as any).arrayBuffer();
  } catch (e) {
    console.warn(e);
  }
}

export function getNextTuesday(date: DateTime) {
  let count = 0;
  let tuesday: DateTime | undefined;
  let nextDate = date;

  while (!tuesday) {
    if (count > 7) break;

    if (nextDate.toFormat('cccc') === 'Tuesday') {
      tuesday = nextDate;
    }

    nextDate = nextDate.plus({
      day: 1,
    });

    count++;
  }

  return tuesday;
}

export async function createLabels(
  orders: Orders,
  products: Product[]
): Promise<string> {
  const imageBlob = await getImageDataUri(radish);

  return new Promise((resolve, reject) => {
    const now = DateTime.fromMillis(Date.now());
    const nextTuesday = getNextTuesday(now);

    const doc = new PDFDocument({
      info: {
        Title: `BBK Order Export ${now.toLocaleString(
          DateTime.DATETIME_SHORT
        )}`,
        Author: 'Back to Basics Kitchen',
      },
      layout: 'portrait',
      margins: DEFAULT_MARGINS,
    });

    const stream = doc.pipe(blobStream());

    let labelCount = 0;

    function next() {
      labelCount++;

      if (labelCount >= LABEL_COLUMN_COUNT * LABEL_ROW_COUNT) {
        labelCount = 0;
        doc.addPage();
      }
    }

    const menuItems = getOrderTotals(orders);

    for (const title of Object.keys(menuItems).sort()) {
      const { variants } = menuItems[title];

      const product = products.find((p) => p.title === title);

      for (const variantTitle of Object.keys(variants)) {
        const { quantity } = variants[variantTitle];

        for (let i = quantity; i > 0; i--) {
          drawItemLabel(
            doc,
            getLabelRow(labelCount),
            getLabelColumn(labelCount),
            {
              title: product?.label?.title || title,
              variant: variantTitle,
              instructions: product?.label?.instructions,
            },
            nextTuesday,
            imageBlob
          );

          next();
        }

        // add blank label between products
        next();
      }
    }

    const ordersByLocation = getOrdersByLocation(orders);

    for (const locationTitle of Object.keys(ordersByLocation).sort()) {
      const location = ordersByLocation[locationTitle];

      for (const customerName of Object.keys(location).sort()) {
        const customerOrder = location[customerName];

        drawCustomerLabel(
          doc,
          getLabelRow(labelCount),
          getLabelColumn(labelCount),
          locationTitle,
          customerOrder,
          nextTuesday,
          imageBlob
        );

        next();
      }
    }

    const extrasOrders = getOrdersByCustomerName(orders, 'extras extras');

    for (const extraOrder of extrasOrders) {
      for (const item of extraOrder.items) {
        drawExtrasLabel(
          doc,
          getLabelRow(labelCount),
          getLabelColumn(labelCount),
          {
            title: item.title,
            variant: item.variantTitle,
            price: parseFloat(
              item.originalUnitPriceSet.shopMoney.amount
            ).toFixed(2),
          },
          imageBlob
        );

        next();
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
