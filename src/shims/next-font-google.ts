// Minimal shim for next/font/google for Vite SPA builds.
// This provides functions that return a simple object with a `variable` className
// matching the API used in the app's layout.

type FontOptions = {
  subsets?: string[];
  display?: string;
  variable?: string;
  weight?: string[] | string;
};

function makeFont(opts?: FontOptions) {
  return {
    className: opts?.variable ? `font-${opts.variable.replace('--font-', '')}` : '',
    style: {},
    variable: opts?.variable || '',
  } as const;
}

export const PT_Sans = (opts?: FontOptions) => makeFont(opts);
export default {};