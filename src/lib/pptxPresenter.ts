let initPptx: any = null;

async function getPptxInit() {
  if (!initPptx) {
    const module = await import('pptx-preview');
    initPptx = module.init;
  }
  return initPptx;
}

export async function loadPPTX(container: HTMLElement, data: ArrayBuffer): Promise<any> {
  const init = await getPptxInit();
  const width = window.innerWidth;
  const height = window.innerHeight;

  const pptxPreviewer = init(container, {
    width,
    height,
    mode: 'slide'
  });

  await pptxPreviewer.preview(data);
  return pptxPreviewer;
}
