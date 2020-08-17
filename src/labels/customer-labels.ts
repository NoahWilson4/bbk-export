import _PDFDoc from 'pdfkit';
import { CustomerOrder } from '../utils';
import { DateTime } from 'luxon';
import {
  getLabelX,
  getLabelY,
  LABEL_HEIGHT,
  LABEL_PADDING,
  LABEL_WIDTH,
} from './index';

export function drawCustomerLabel(
  doc: typeof _PDFDoc,
  row: number,
  column: number,
  location: string,
  order: CustomerOrder,
  nextTuesday?: DateTime,
  imageBlob?: ArrayBuffer
) {
  const x = getLabelX(column);
  const y = getLabelY(row);

  // this draws lines that mimic where the labels are cut
  // doc.roundedRect(x, y, LABEL_WIDTH, LABEL_HEIGHT, 5).stroke();

  if (imageBlob) {
    doc.image(
      imageBlob,
      x + LABEL_PADDING, // + LABEL_WIDTH * 0.75,
      y + LABEL_PADDING + LABEL_HEIGHT / 3.75,
      {
        width: LABEL_WIDTH / 5,
      }
    );
  }

  const titleFontSize = 10;
  const addressFontSize = 7;
  const urlFontSize = 7;
  const dateFontSize = 8;
  const locationFontSize = 7;

  doc
    .fontSize(titleFontSize)
    .font('Helvetica-Bold')
    .text(`${order.shipping.name}`, x + LABEL_PADDING, y + LABEL_PADDING, {
      width: LABEL_WIDTH - LABEL_PADDING * 2,
      align: 'center',
    });

  if (location.toLowerCase().includes('delivery')) {
    if (order.shipping.address1) {
      doc
        .lineGap(0)
        .fontSize(addressFontSize)
        .font('Helvetica')
        .text(order.shipping.address1, {
          width: LABEL_WIDTH - LABEL_PADDING * 2,
          align: 'center',
        });
    }

    if (order.shipping.address2) {
      doc
        .lineGap(0)
        .fontSize(addressFontSize)
        .font('Helvetica')
        .text(order.shipping.address2, {
          width: LABEL_WIDTH - LABEL_PADDING * 2,
          align: 'center',
        });
    }

    if (order.shipping.zip) {
      doc
        .lineGap(0)
        .fontSize(addressFontSize)
        .font('Helvetica')
        .text(`${order.shipping.city}, ${order.shipping.zip}`, {
          width: LABEL_WIDTH - LABEL_PADDING * 2,
          align: 'center',
        });
    }

    if (order.shipping.phone) {
      doc
        .lineGap(0)
        .fontSize(addressFontSize)
        .font('Helvetica')
        .text(order.shipping.phone, {
          width: LABEL_WIDTH - LABEL_PADDING * 2,
          align: 'center',
        });
    }
  }

  doc
    .lineGap(0)
    .fontSize(locationFontSize)
    .font('Helvetica')
    .text(location, {
      width: LABEL_WIDTH - LABEL_PADDING * 2,
      align: 'center',
    });

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

  const nextTuesdayString = nextTuesday?.toLocaleString(DateTime.DATE_SHORT);

  if (nextTuesdayString) {
    doc
      .fontSize(dateFontSize)
      .font('Helvetica')
      .text(
        nextTuesdayString,
        x + LABEL_PADDING,
        y + LABEL_HEIGHT - LABEL_PADDING - dateFontSize,
        {
          width: LABEL_WIDTH - LABEL_PADDING * 2 - 10,
          align: 'right',
        }
      );
  }
}
