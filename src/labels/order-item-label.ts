import _PDFDoc from 'pdfkit';
import {
  getLabelX,
  getLabelY,
  LABEL_HEIGHT,
  LABEL_PADDING,
  LABEL_WIDTH,
} from './index';
import { DateTime } from 'luxon';
import {
  ProductLabelInstructions,
  instructionDefaults,
} from '../products/index';
export const PDFDocument: typeof _PDFDoc = (window as any).PDFDocument;

export function drawItemLabel(
  doc: typeof _PDFDoc,
  row: number,
  column: number,
  item: {
    title: string;
    variant: string;
    instructions?: ProductLabelInstructions;
  },
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

  const titleFontSize = 11;
  const instructionsFontSize = 9;
  const urlFontSize = 7;
  const dateFontSize = 9;

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

  const itemInstructions = item.instructions
    ? item.instructions[item.variant] || item.instructions['default']
    : undefined;

  doc
    .lineGap(0)
    .fontSize(instructionsFontSize)
    .font('Helvetica')
    .text(
      itemInstructions ||
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
