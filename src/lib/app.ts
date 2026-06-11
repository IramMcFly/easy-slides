import { initTheme, toggleTheme } from './theme';
import { initLanguage, toggleLanguage, setLanguage } from './i18n';
import { loadPDF, renderCurrentView, renderPage, clearCanvas, cancelAllActiveTasks } from './pdfPresenter';
import { loadPPTX } from './pptxPresenter';
import { translations } from './translations';

// --- State Variables ---
let pdfDoc: any = null;
let pptxPreviewer: any = null;
let isPPTXMode = false;
let fileData: ArrayBuffer | null = null;

let currentPageNum = 1;
let totalPages = 0;
let isTransitioning = false;

let errorTimeoutId: any = null;
let idleTimeoutId: any = null;

let currentLang = 'es';
let currentTheme = 'dark';

// --- DOM Element References ---
let landingScreen: HTMLElement;
let viewerScreen: HTMLElement;
let dropzone: HTMLElement;
let fileInput: HTMLInputElement;
let browseButton: HTMLButtonElement;
let errorBanner: HTMLElement;
let errorMessage: HTMLElement;
let loadingOverlay: HTMLElement;
let loadingText: HTMLElement;
let controlBar: HTMLElement;
let pageDisplay: HTMLElement;

let btnPrev: HTMLButtonElement;
let btnNext: HTMLButtonElement;
let btnFullscreen: HTMLButtonElement;
let btnCloseView: HTMLButtonElement;

let btnThemeToggle: HTMLElement;
let btnLangToggle: HTMLElement;

// Slide containers & canvases
let slideL: HTMLElement;
let slideC: HTMLElement;
let slideR: HTMLElement;

let canvasRoleL: HTMLCanvasElement;
let canvasRoleC: HTMLCanvasElement;
let canvasRoleR: HTMLCanvasElement;

let pptxContainer: HTMLElement;

export function initApp(): void {
  // Query Elements
  landingScreen = document.getElementById('landing')!;
  viewerScreen = document.getElementById('viewer')!;
  dropzone = document.getElementById('dropzone')!;
  fileInput = document.getElementById('file-input') as HTMLInputElement;
  browseButton = dropzone.querySelector('.browse-button') as HTMLButtonElement;
  errorBanner = document.getElementById('error-banner')!;
  errorMessage = document.getElementById('error-message')!;
  loadingOverlay = document.getElementById('loading-overlay')!;
  loadingText = document.getElementById('loading-text')!;
  controlBar = document.getElementById('control-bar')!;
  pageDisplay = document.getElementById('page-display')!;
  
  btnPrev = document.getElementById('btn-prev') as HTMLButtonElement;
  btnNext = document.getElementById('btn-next') as HTMLButtonElement;
  btnFullscreen = document.getElementById('btn-fullscreen') as HTMLButtonElement;
  btnCloseView = document.getElementById('btn-close-view') as HTMLButtonElement;

  btnThemeToggle = document.getElementById('btn-theme-toggle')!;
  btnLangToggle = document.getElementById('btn-lang-toggle')!;

  slideL = document.getElementById('slide-left')!;
  slideC = document.getElementById('slide-center')!;
  slideR = document.getElementById('slide-right')!;

  canvasRoleL = slideL.querySelector('canvas')!;
  canvasRoleC = slideC.querySelector('canvas')!;
  canvasRoleR = slideR.querySelector('canvas')!;

  pptxContainer = document.getElementById('pptx-container')!;

  // Initialize Language & Theme
  currentLang = initLanguage();
  currentTheme = initTheme();

  // Bind Events
  setupThemeLangEvents();
  setupUploadEvents();
  setupViewerEvents();
  setupKeyboardEvents();
  setupResizeEvents();
  setupIdleEvents();
}

function setupThemeLangEvents() {
  btnThemeToggle.addEventListener('click', () => {
    currentTheme = toggleTheme(currentTheme);
  });

  btnLangToggle.addEventListener('click', () => {
    currentLang = toggleLanguage(currentLang);
  });
}

function setupUploadEvents() {
  dropzone.addEventListener('click', (e) => {
    if (e.target !== browseButton) {
      fileInput.click();
    }
  });

  browseButton.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) {
      loadUploadedFile(file);
    }
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-active');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-active');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-active');
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      loadUploadedFile(file);
    }
  });
}

// Unified File Loader
function loadUploadedFile(file: File) {
  showLoading(true);

  const isPPTX = file.name.toLowerCase().endsWith('.pptx');
  const isPDF = file.name.toLowerCase().endsWith('.pdf');

  if (!isPPTX && !isPDF) {
    showError(translations[currentLang].errInvalidFile);
    showLoading(false);
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const arrayBuffer = e.target?.result as ArrayBuffer;
    if (arrayBuffer) {
      try {
        if (isPDF) {
          await initializePDF(arrayBuffer);
        } else {
          await initializePPTX(arrayBuffer);
        }
      } catch (err: any) {
        console.error('File load error:', err);
        showError(translations[currentLang].errInit);
        showLoading(false);
      }
    } else {
      showError(translations[currentLang].errRead);
      showLoading(false);
    }
  };

  reader.onerror = () => {
    showError(translations[currentLang].errRead);
    showLoading(false);
  };

  reader.readAsArrayBuffer(file);
}

// Initialize local PDF
async function initializePDF(data: ArrayBuffer) {
  isPPTXMode = false;
  fileData = data;
  
  try {
    pdfDoc = await loadPDF(data);
    totalPages = pdfDoc.numPages;
    currentPageNum = 1;

    // Switch viewport styles
    document.getElementById('slider-viewport')!.style.display = 'block';
    pptxContainer.style.display = 'none';

    // Show screens
    landingScreen.classList.add('hidden');
    viewerScreen.classList.remove('hidden');
    showLoading(false);

    resetSlideRoles();
    const canvases = { left: canvasRoleL, center: canvasRoleC, right: canvasRoleR };
    await renderCurrentView(pdfDoc, currentPageNum, totalPages, canvases);
    
    updatePDFControlsDisplay();
    resetIdleTimer();
  } catch (err) {
    throw err;
  }
}

// Initialize local PPTX
async function initializePPTX(data: ArrayBuffer) {
  isPPTXMode = true;
  fileData = data;

  try {
    // Switch viewport styles
    document.getElementById('slider-viewport')!.style.display = 'none';
    pptxContainer.style.display = 'flex';
    
    pptxContainer.innerHTML = '';

    // Show screens
    landingScreen.classList.add('hidden');
    viewerScreen.classList.remove('hidden');

    pptxPreviewer = await loadPPTX(pptxContainer, data);
    
    showLoading(false);
    updatePPTXControlsDisplay();
    resetIdleTimer();
  } catch (err) {
    throw err;
  }
}

function resetSlideRoles() {
  slideL = document.getElementById('slide-left')!;
  slideC = document.getElementById('slide-center')!;
  slideR = document.getElementById('slide-right')!;

  slideL.className = 'slide-frame slide-left';
  slideC.className = 'slide-frame slide-center';
  slideR.className = 'slide-frame slide-right';

  canvasRoleL = slideL.querySelector('canvas')!;
  canvasRoleC = slideC.querySelector('canvas')!;
  canvasRoleR = slideR.querySelector('canvas')!;
}

// --- SLIDING ENGINES ---
function goToNext() {
  if (isTransitioning) return;

  if (isPPTXMode) {
    if (pptxPreviewer && pptxPreviewer.currentIndex < pptxPreviewer.slideCount - 1) {
      pptxPreviewer.renderNextSlide();
      updatePPTXControlsDisplay();
    }
  } else {
    if (!pdfDoc || currentPageNum >= totalPages) return;
    isTransitioning = true;

    slideL.classList.add('animate');
    slideC.classList.add('animate');
    slideR.classList.add('animate');

    slideL.className = 'slide-frame slide-far-left animate';
    slideC.className = 'slide-frame slide-left animate';
    slideR.className = 'slide-frame slide-center animate';

    currentPageNum++;
    updatePDFControlsDisplay();

    setTimeout(() => {
      slideL.classList.remove('animate');
      slideC.classList.remove('animate');
      slideR.classList.remove('animate');

      const oldL = slideL;
      const oldC = slideC;
      const oldR = slideR;

      slideL = oldC;
      slideC = oldR;
      slideR = oldL;

      canvasRoleL = slideL.querySelector('canvas')!;
      canvasRoleC = slideC.querySelector('canvas')!;
      canvasRoleR = slideR.querySelector('canvas')!;

      slideL.className = 'slide-frame slide-left';
      slideC.className = 'slide-frame slide-center';
      slideR.className = 'slide-frame slide-right';

      renderPage(pdfDoc, currentPageNum + 1, totalPages, canvasRoleR);
      isTransitioning = false;
    }, 350);
  }
}

function goToPrev() {
  if (isTransitioning) return;

  if (isPPTXMode) {
    if (pptxPreviewer && pptxPreviewer.currentIndex > 0) {
      pptxPreviewer.renderPreSlide();
      updatePPTXControlsDisplay();
    }
  } else {
    if (!pdfDoc || currentPageNum <= 1) return;
    isTransitioning = true;

    slideL.classList.add('animate');
    slideC.classList.add('animate');
    slideR.classList.add('animate');

    slideL.className = 'slide-frame slide-center animate';
    slideC.className = 'slide-frame slide-right animate';
    slideR.className = 'slide-frame slide-far-right animate';

    currentPageNum--;
    updatePDFControlsDisplay();

    setTimeout(() => {
      slideL.classList.remove('animate');
      slideC.classList.remove('animate');
      slideR.classList.remove('animate');

      const oldL = slideL;
      const oldC = slideC;
      const oldR = slideR;

      slideL = oldR;
      slideC = oldL;
      slideR = oldC;

      canvasRoleL = slideL.querySelector('canvas')!;
      canvasRoleC = slideC.querySelector('canvas')!;
      canvasRoleR = slideR.querySelector('canvas')!;

      slideL.className = 'slide-frame slide-left';
      slideC.className = 'slide-frame slide-center';
      slideR.className = 'slide-frame slide-right';

      renderPage(pdfDoc, currentPageNum - 1, totalPages, canvasRoleL);
      isTransitioning = false;
    }, 350);
  }
}

function updatePDFControlsDisplay() {
  if (!pdfDoc) return;
  pageDisplay.textContent = `${currentPageNum} / ${totalPages}`;
  
  btnPrev.disabled = (currentPageNum <= 1);
  btnNext.disabled = (currentPageNum >= totalPages);
  
  btnPrev.style.opacity = btnPrev.disabled ? '0.4' : '1';
  btnNext.style.opacity = btnNext.disabled ? '0.4' : '1';
  btnPrev.style.cursor = btnPrev.disabled ? 'not-allowed' : 'pointer';
  btnNext.style.cursor = btnNext.disabled ? 'not-allowed' : 'pointer';
}

function updatePPTXControlsDisplay() {
  if (!pptxPreviewer) return;
  const current = pptxPreviewer.currentIndex + 1;
  const total = pptxPreviewer.slideCount;
  pageDisplay.textContent = `${current} / ${total}`;
  
  btnPrev.disabled = (current <= 1);
  btnNext.disabled = (current >= total);
  
  btnPrev.style.opacity = btnPrev.disabled ? '0.4' : '1';
  btnNext.style.opacity = btnNext.disabled ? '0.4' : '1';
  btnPrev.style.cursor = btnPrev.disabled ? 'not-allowed' : 'pointer';
  btnNext.style.cursor = btnNext.disabled ? 'not-allowed' : 'pointer';
}

function setupViewerEvents() {
  btnNext.addEventListener('click', (e) => {
    e.stopPropagation();
    goToNext();
  });

  btnPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    goToPrev();
  });

  btnFullscreen.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFullscreen();
  });

  btnCloseView.addEventListener('click', (e) => {
    e.stopPropagation();
    exitPresentation();
  });
}

function setupKeyboardEvents() {
  document.addEventListener('keydown', (e) => {
    if (viewerScreen.classList.contains('hidden')) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        if (e.shiftKey) {
          goToPrev();
        } else {
          goToNext();
        }
        break;
      case 'Enter':
        e.preventDefault();
        goToNext();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
      case 'Backspace':
        e.preventDefault();
        goToPrev();
        break;
    }
  });

  document.addEventListener('fullscreenchange', () => {
    const isFS = !!document.fullscreenElement;
    const enterIcon = btnFullscreen.querySelector('.icon-fs-enter') as SVGElement;
    const exitIcon = btnFullscreen.querySelector('.icon-fs-exit') as SVGElement;
    
    if (isFS) {
      enterIcon.style.display = 'none';
      exitIcon.style.display = 'block';
    } else {
      enterIcon.style.display = 'block';
      exitIcon.style.display = 'none';
    }
  });
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(`Fullscreen request failed: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

function exitPresentation() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }

  viewerScreen.classList.add('hidden');
  landingScreen.classList.remove('hidden');

  // Cancel any ongoing rendering
  cancelAllActiveTasks();

  // Clear variables
  pdfDoc = null;
  fileInput.value = '';
  totalPages = 0;
  currentPageNum = 1;

  clearCanvas(canvasRoleL);
  clearCanvas(canvasRoleC);
  clearCanvas(canvasRoleR);

  // Clear PPTX state
  if (pptxPreviewer) {
    try {
      pptxPreviewer.destroy();
    } catch (e) {
      console.error('Error destroying PPTX previewer:', e);
    }
    pptxPreviewer = null;
  }
  pptxContainer.innerHTML = '';
  
  fileData = null;
  isPPTXMode = false;
}

function setupResizeEvents() {
  let resizeTimeoutId: any = null;
  window.addEventListener('resize', () => {
    if (viewerScreen.classList.contains('hidden') || !fileData) return;
    
    clearTimeout(resizeTimeoutId);
    resizeTimeoutId = setTimeout(async () => {
      showLoading(true);

      if (isPPTXMode && pptxPreviewer) {
        // PPTX Resize: Destroy and rebuild with new viewport dims
        const savedIndex = pptxPreviewer.currentIndex;
        pptxPreviewer.destroy();
        pptxContainer.innerHTML = '';

        const width = window.innerWidth;
        const height = window.innerHeight;

        pptxPreviewer = await loadPPTX(pptxContainer, fileData);

        // Fast-forward to saved slide index
        for (let i = 0; i < savedIndex; i++) {
          pptxPreviewer.renderNextSlide();
        }
        
        updatePPTXControlsDisplay();
      } else {
        // PDF Resize: Re-render canvases
        cancelAllActiveTasks();
        resetSlideRoles();
        const canvases = { left: canvasRoleL, center: canvasRoleC, right: canvasRoleR };
        await renderCurrentView(pdfDoc, currentPageNum, totalPages, canvases);
      }

      showLoading(false);
    }, 150);
  });
}

function setupIdleEvents() {
  viewerScreen.addEventListener('mousemove', () => {
    resetIdleTimer();
  });

  controlBar.addEventListener('mouseenter', () => {
    clearTimeout(idleTimeoutId);
    controlBar.classList.remove('idle');
  });

  controlBar.addEventListener('mouseleave', () => {
    resetIdleTimer();
  });

  btnCloseView.addEventListener('mouseenter', () => {
    clearTimeout(idleTimeoutId);
    btnCloseView.classList.remove('idle');
  });

  btnCloseView.addEventListener('mouseleave', () => {
    resetIdleTimer();
  });
}

function resetIdleTimer() {
  controlBar.classList.remove('idle');
  btnCloseView.classList.remove('idle');
  clearTimeout(idleTimeoutId);
  
  idleTimeoutId = setTimeout(() => {
    if (!viewerScreen.classList.contains('hidden')) {
      controlBar.classList.add('idle');
      btnCloseView.classList.add('idle');
    }
  }, 2500);
}

// --- NOTIFICATION & LOADING UTILITIES ---
function showLoading(show: boolean) {
  loadingOverlay.style.display = show ? 'flex' : 'none';
}

function showError(msg: string) {
  clearTimeout(errorTimeoutId);
  errorMessage.textContent = msg;
  errorBanner.style.display = 'flex';

  errorTimeoutId = setTimeout(() => {
    errorBanner.style.display = 'none';
  }, 4000);
}
