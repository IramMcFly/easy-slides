export interface AppState {
  pdfDoc: any;
  pptxPreviewer: any;
  isPPTXMode: boolean;
  fileData: ArrayBuffer | null;
  currentPageNum: number;
  totalPages: number;
  isTransitioning: boolean;
  currentLang: string;
  currentTheme: string;
}

export type Translations = Record<string, Record<string, string>>;
