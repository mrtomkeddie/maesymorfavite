import React from 'react';

// Minimal shim for next/link to work in Vite/SPA builds.
// Note: This does NOT provide prefetching or router-aware navigation like Next.js.
// It simply renders a normal anchor tag. Only used for code reuse/compilation.
type AnchorProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;
export type NextLinkProps = AnchorProps & {
  href: string | { pathname?: string };
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
};

const Link = React.forwardRef<HTMLAnchorElement, NextLinkProps>(
  ({ href, children, ...rest }, ref) => {
    const resolvedHref = typeof href === 'string' ? href : href?.pathname || '#';
    return (
      <a ref={ref} href={resolvedHref} {...rest}>
        {children}
      </a>
    );
  }
);

Link.displayName = 'NextLinkShim';

export default Link;