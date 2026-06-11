export function initTheme(): string {
  const savedTheme = localStorage.getItem('easy-slides-theme') || 'dark';
  setTheme(savedTheme);
  return savedTheme;
}

export function setTheme(theme: string): void {
  localStorage.setItem('easy-slides-theme', theme);
  const htmlEl = document.documentElement;

  if (theme === 'light') {
    htmlEl.classList.add('light');
  } else {
    htmlEl.classList.remove('light');
  }

  // Toggle sun/moon icons
  const sunIcons = document.querySelectorAll('.icon-sun');
  const moonIcons = document.querySelectorAll('.icon-moon');

  if (theme === 'light') {
    sunIcons.forEach(el => ((el as HTMLElement).style.display = 'none'));
    moonIcons.forEach(el => ((el as HTMLElement).style.display = 'block'));
  } else {
    sunIcons.forEach(el => ((el as HTMLElement).style.display = 'block'));
    moonIcons.forEach(el => ((el as HTMLElement).style.display = 'none'));
  }
}

export function toggleTheme(currentTheme: string): string {
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
  return nextTheme;
}
