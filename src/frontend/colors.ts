export function getColor(type: string) {
  const el = document.querySelector(':root');
  if (el) {
    return getComputedStyle(el).getPropertyValue(`--${type}`);
  } else {
    return '';
  }
}
