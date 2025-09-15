export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function dl(light: string, dark: string, isDark: boolean) {
  return isDark ? dark : light;
}
