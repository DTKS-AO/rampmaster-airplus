declare module 'jspdf-autotable' {
  export interface UserOptions {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    startY?: number;
    margin?: Partial<{
      top: number;
      right: number;
      bottom: number;
      left: number;
    }>;
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    tableWidth?: 'auto' | 'wrap' | number;
    theme?: 'striped' | 'grid' | 'plain';
    styles?: Partial<{
      font: string;
      fontStyle: string;
      fontSize: number;
      cellPadding: number;
      lineColor: number[];
      lineWidth: number;
      fontColor: number[];
      textColor: number[];
      fillColor: number[];
    }>;
    headStyles?: Partial<{
      fillColor: number[];
      textColor: number[];
      fontStyle: string;
      lineWidth: number;
      lineColor: number[];
    }>;
    bodyStyles?: Partial<{
      fillColor: number[];
      textColor: number[];
      fontStyle: string;
      lineWidth: number;
      lineColor: number[];
    }>;
    footStyles?: Partial<{
      fillColor: number[];
      textColor: number[];
      fontStyle: string;
      lineWidth: number;
      lineColor: number[];
    }>;
    alternateRowStyles?: Partial<{
      fillColor: number[];
    }>;
    columnStyles?: {
      [key: string]: Partial<{
        cellWidth: number | 'auto';
        minCellWidth: number;
        maxCellWidth: number;
        fontStyle: string;
        fontSize: number;
        cellPadding: number;
        fillColor: number[];
        textColor: number[];
        halign: 'left' | 'center' | 'right';
        valign: 'top' | 'middle' | 'bottom';
        overflow: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
      }>;
    };
  }

  export type UserConfig = UserOptions;
}