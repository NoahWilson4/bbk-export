import _PDFDoc from 'pdfkit';
import {
  getLabelX,
  getLabelY,
  LABEL_HEIGHT,
  LABEL_PADDING,
  LABEL_WIDTH,
} from './index';

export const PDFDocument: typeof _PDFDoc = (window as any).PDFDocument;

export function drawExtrasLabel(
  doc: typeof _PDFDoc,
  row: number,
  column: number,
  item: {
    title: string;
    variant: string;
    price: string;
  },
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

  const titleFontSize = 12;
  const priceFontSize = 11;
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
    .lineGap(1)
    .fontSize(priceFontSize)
    .font('Helvetica')
    .text(`$${item.price}`, {
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
}
