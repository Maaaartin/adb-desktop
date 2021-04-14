export function getColor(color: string) {
  const el = document.querySelector(':root');
  if (el) {
    return getComputedStyle(el).getPropertyValue(`--${color}`);
  } else {
    return color;
  }
}
