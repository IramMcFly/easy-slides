let pdfjsLib: any = null;
const activeRenderTasks = new Map<HTMLCanvasElement, any>();

async function getPdfjsLib() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }
  return pdfjsLib;
}

export async function loadPDF(data: ArrayBuffer): Promise<any> {
  const lib = await getPdfjsLib();
  const loadingTask = lib.getDocument({ data });
  return await loadingTask.promise;
}

export async function renderPage(
  pdfDoc: any,
  pageNum: number,
  totalPages: number,
  canvas: HTMLCanvasElement
): Promise<void> {
  if (!pdfDoc || pageNum < 1 || pageNum > totalPages) {
    clearCanvas(canvas);
    return;
  }

  try {
    const page = await pdfDoc.getPage(pageNum);
    const ctx = canvas.getContext('2d')!;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const unscaledViewport = page.getViewport({ scale: 1 });
    const scaleX = viewportWidth / unscaledViewport.width;
    const scaleY = viewportHeight / unscaledViewport.height;
    const scale = Math.min(scaleX, scaleY);

    const dpr = window.devicePixelRatio || 1;
    const viewport = page.getViewport({ scale: scale * dpr });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const displayWidth = viewport.width / dpr;
    const displayHeight = viewport.height / dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Cancel active render task on this canvas if any exists
    if (activeRenderTasks.has(canvas)) {
      activeRenderTasks.get(canvas).cancel();
    }

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    const renderTask = page.render(renderContext);
    activeRenderTasks.set(canvas, renderTask);

    await renderTask.promise;
    activeRenderTasks.delete(canvas);
  } catch (error: any) {
    if (error.name !== 'RenderingCancelledException') {
      console.error(`Error rendering page ${pageNum}:`, error);
    }
  }
}

export async function renderCurrentView(
  pdfDoc: any,
  currentPageNum: number,
  totalPages: number,
  canvases: { left: HTMLCanvasElement; center: HTMLCanvasElement; right: HTMLCanvasElement }
): Promise<void> {
  if (!pdfDoc) return;

  // Render main center page
  await renderPage(pdfDoc, currentPageNum, totalPages, canvases.center);

  // Pre-render left page (previous)
  if (currentPageNum > 1) {
    renderPage(pdfDoc, currentPageNum - 1, totalPages, canvases.left);
  } else {
    clearCanvas(canvases.left);
  }

  // Pre-render right page (next)
  if (currentPageNum < totalPages) {
    renderPage(pdfDoc, currentPageNum + 1, totalPages, canvases.right);
  } else {
    clearCanvas(canvases.right);
  }
}

export function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  canvas.style.width = '0px';
  canvas.style.height = '0px';
  canvas.width = 0;
  canvas.height = 0;
}

export function cancelAllActiveTasks(): void {
  for (const [canvas, task] of activeRenderTasks.entries()) {
    try {
      task.cancel();
    } catch (e) {
      // Ignored
    }
    activeRenderTasks.delete(canvas);
  }
}
