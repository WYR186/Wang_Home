'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { useEffect, useMemo, useRef, useState } from 'react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function withBasePath(url: string): string {
  if (!url.startsWith('/')) return url;
  if (!basePath) return url;
  return `${basePath}${url}`;
}

interface FirstImage {
  alt: string;
  src: string;
}

interface PretextArticleProps {
  title: string;
  subtitle: string;
  markdown: string;
  referencesTitle: string;
}

function extractFirstImage(markdown: string): { firstImage: FirstImage | null; content: string } {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
  const match = markdown.match(imageRegex);

  if (!match) {
    return { firstImage: null, content: markdown };
  }

  const [, alt, src] = match;
  const content = markdown.replace(imageRegex, '').replace(/\n{3,}/g, '\n\n').trim();

  return {
    firstImage: {
      alt: alt.trim(),
      src: src.trim(),
    },
    content,
  };
}

export default function PretextArticle({
  title,
  subtitle,
  markdown,
  referencesTitle,
}: PretextArticleProps) {
  const { firstImage, content } = extractFirstImage(markdown);
  const obstacleRef = useRef<HTMLDivElement | null>(null);
  const [obstacleWidth, setObstacleWidth] = useState(0);
  const [imageRatio, setImageRatio] = useState<number>(860 / 1400);

  useEffect(() => {
    if (!obstacleRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setObstacleWidth(entry.contentRect.width);
    });
    observer.observe(obstacleRef.current);
    return () => observer.disconnect();
  }, []);

  const obstacleHeight = useMemo(() => {
    if (!firstImage || obstacleWidth <= 0) return undefined;
    const renderedImageHeight = obstacleWidth * imageRatio;
    // Reserve extra travel room so sticky can pin and release smoothly.
    return Math.max(renderedImageHeight + 180, 420);
  }, [firstImage, imageRatio, obstacleWidth]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <header className="mb-10">
        <h1 className="text-3xl lg:text-5xl font-serif font-bold text-primary leading-tight">
          {title}
        </h1>
        <p className="mt-4 text-base lg:text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
          {subtitle}
        </p>
      </header>

      <div className="min-w-0">
        {firstImage && (
          <figure className="w-full mb-8 lg:hidden">
            <Image
              src={encodeURI(withBasePath(firstImage.src))}
              alt={firstImage.alt || 'Article lead image'}
              width={1400}
              height={860}
              className="w-full h-auto rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm"
              sizes="100vw"
              priority={false}
            />
            {firstImage.alt && (
              <figcaption className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {firstImage.alt}
              </figcaption>
            )}
          </figure>
        )}

        <div className="text-[1.02rem] lg:text-[1.08rem] leading-8 text-neutral-700 dark:text-neutral-300 min-w-0">
          {firstImage && (
            <aside
              ref={obstacleRef}
              aria-hidden="true"
              className="hidden lg:block float-right w-[44%] ml-8 mb-6"
              style={obstacleHeight ? { height: `${obstacleHeight}px` } : undefined}
            >
              <figure className="w-full sticky top-28">
                <Image
                  src={encodeURI(withBasePath(firstImage.src))}
                  alt={firstImage.alt || 'Article lead image'}
                  width={1400}
                  height={860}
                  className="w-full h-auto rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm"
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  priority={false}
                  onLoadingComplete={(img) => {
                    if (img.naturalWidth > 0) {
                      setImageRatio(img.naturalHeight / img.naturalWidth);
                    }
                  }}
                />
                {firstImage.alt && (
                  <figcaption className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {firstImage.alt}
                  </figcaption>
                )}
              </figure>
            </aside>
          )}

          <div className="min-w-0">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="text-2xl lg:text-3xl font-serif font-semibold text-primary mt-10 mb-4 clear-none">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-primary mt-8 mb-3 clear-none">
                    {children}
                  </h3>
                ),
                p: ({ children }) => <p className="mb-5 text-justify break-words">{children}</p>,
                ul: ({ children }) => <ul className="list-disc ml-6 mb-6 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-6 mb-6 space-y-2">{children}</ol>,
                li: ({ children }) => <li className="leading-7 break-words">{children}</li>,
                a: ({ href, ...props }: React.ComponentProps<'a'>) => (
                  <a
                    {...props}
                    href={href ? withBasePath(href) : href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline underline-offset-4 break-all"
                  />
                ),
                hr: () => <hr className="my-10 border-neutral-200 dark:border-neutral-800" />,
              }}
            >
              {content}
            </ReactMarkdown>
            </div>
          </div>
      </div>

      <footer className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{referencesTitle}</p>
      </footer>
    </motion.article>
  );
}
