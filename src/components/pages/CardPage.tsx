'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { CardPageConfig } from '@/types/page';

const markdownComponents = {
    p: ({ children }: React.ComponentProps<'p'>) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }: React.ComponentProps<'ul'>) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
    ol: ({ children }: React.ComponentProps<'ol'>) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
    li: ({ children }: React.ComponentProps<'li'>) => <li className="mb-1">{children}</li>,
    a: ({ ...props }) => (
        <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
        />
    ),
    blockquote: ({ children }: React.ComponentProps<'blockquote'>) => (
        <blockquote className="border-l-4 border-accent/50 pl-4 italic my-4 text-neutral-600 dark:text-neutral-500">
            {children}
        </blockquote>
    ),
    strong: ({ children }: React.ComponentProps<'strong'>) => <strong className="font-semibold text-primary">{children}</strong>,
    em: ({ children }: React.ComponentProps<'em'>) => <em className="italic">{children}</em>,
    code: ({ children }: React.ComponentProps<'code'>) => (
        <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[0.95em]">{children}</code>
    ),
};

export default function CardPage({ config, embedded = false }: { config: CardPageConfig; embedded?: boolean }) {
    const galleryRef = useRef<HTMLDivElement | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
    const [imageRatios, setImageRatios] = useState<Record<string, number>>({});
    const galleryItems = useMemo(
        () => config.items.filter((item): item is typeof item & { image: string } => Boolean(item.image)),
        [config.items]
    );
    const isGalleryMode = Boolean(config.gallery);
    const { scrollYProgress } = useScroll({
        target: galleryRef,
        offset: ['start end', 'end start'],
    });
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.6 });
    const leftColY = useTransform(smoothProgress, [0, 1], [22, -22]);
    const centerColY = useTransform(smoothProgress, [0, 1], [-28, 28]);
    const rightColY = useTransform(smoothProgress, [0, 1], [22, -22]);
    const galleryColumns = useMemo(() => {
        const cols: Array<typeof galleryItems> = [[], [], []];
        const colHeights = [0, 0, 0];

        galleryItems.forEach((item) => {
            const ratio = imageRatios[item.image] ?? 1;
            const estimatedHeight = 1 / Math.max(ratio, 0.2);
            const targetCol = colHeights.indexOf(Math.min(...colHeights));
            cols[targetCol].push(item);
            colHeights[targetCol] += estimatedHeight;
        });

        return cols;
    }, [galleryItems, imageRatios]);
    const galleryItemIndexMap = useMemo(
        () => new Map(galleryItems.map((item, index) => [item.image, index])),
        [galleryItems]
    );

    useEffect(() => {
        if (galleryItems.length === 0) return;
        let isCancelled = false;

        const probes = galleryItems.map((item) => new Promise<[string, number]>((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                const ratio = img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
                resolve([item.image, ratio]);
            };
            img.onerror = () => resolve([item.image, 1]);
            img.src = item.image;
        }));

        Promise.all(probes).then((entries) => {
            if (isCancelled) return;
            setImageRatios(Object.fromEntries(entries));
        });

        return () => {
            isCancelled = true;
        };
    }, [galleryItems]);

    useEffect(() => {
        if (activeImageIndex === null || galleryItems.length === 0) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setActiveImageIndex(null);
                return;
            }
            if (event.key === 'ArrowRight') {
                setActiveImageIndex((prev) => (prev === null ? 0 : (prev + 1) % galleryItems.length));
            }
            if (event.key === 'ArrowLeft') {
                setActiveImageIndex((prev) =>
                    prev === null ? 0 : (prev - 1 + galleryItems.length) % galleryItems.length
                );
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [activeImageIndex, galleryItems.length]);

    useEffect(() => {
        if (activeImageIndex === null) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [activeImageIndex]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className={embedded ? "mb-4" : "mb-8"}>
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && (
                    <div className={`${embedded ? "text-base" : "text-lg"} text-neutral-600 dark:text-neutral-500 max-w-2xl leading-relaxed`}>
                        <ReactMarkdown components={markdownComponents}>
                            {config.description}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            {isGalleryMode ? (
                <div ref={galleryRef} className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5 overflow-hidden pt-10 pb-14">
                    {galleryColumns.map((columnItems, colIndex) => (
                        <motion.div
                            key={`gallery-col-${colIndex}`}
                            style={{
                                y: colIndex === 0 ? leftColY : colIndex === 1 ? centerColY : rightColY,
                            }}
                            className="space-y-4 md:space-y-5"
                        >
                            {columnItems.map((item, idx) => {
                                const originalIndex = galleryItemIndexMap.get(item.image) ?? 0;
                                return (
                                    <motion.button
                                        key={`${item.image}-${idx}`}
                                        type="button"
                                        initial={{ opacity: 0, y: 18 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.03 * (idx + colIndex) }}
                                        onClick={() => setActiveImageIndex(originalIndex)}
                                        className="group block w-full text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-[1.6rem]"
                                    >
                                        <div className="w-full rounded-[1.6rem] overflow-hidden bg-transparent">
                                            <img
                                                src={item.image}
                                                alt={`Photo ${originalIndex + 1}`}
                                                className="block w-full h-auto object-contain rounded-[1.6rem] transition-transform duration-700 ease-out group-hover:scale-[1.012]"
                                                loading="lazy"
                                            />
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className={`grid ${embedded ? "gap-4" : "gap-6"}`}>
                    {config.items.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * index }}
                            className={`bg-white dark:bg-neutral-900 ${embedded ? "p-4" : "p-6"} rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200 hover:scale-[1.01]`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className={`${embedded ? "text-lg" : "text-xl"} font-semibold text-primary`}>{item.title}</h3>
                                {item.date && (
                                    <span className="text-sm text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                                        {item.date}
                                    </span>
                                )}
                            </div>
                            {item.subtitle && (
                                <p className={`${embedded ? "text-sm" : "text-base"} text-accent font-medium mb-3`}>{item.subtitle}</p>
                            )}
                            {item.image && (
                                <div className="mb-4 relative aspect-video rounded-lg overflow-hidden">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 100vw, 66vw"
                                    />
                                </div>
                            )}
                            {item.content && (
                                <div className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-500 leading-relaxed`}>
                                    <ReactMarkdown components={markdownComponents}>
                                        {item.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                            {item.tags && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1 rounded border border-neutral-100 dark:border-neutral-800">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isGalleryMode && activeImageIndex !== null && galleryItems[activeImageIndex] && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="fixed inset-0 z-50 bg-black/82 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setActiveImageIndex(null)}
                    >
                        <button
                            type="button"
                            onClick={() => setActiveImageIndex(null)}
                            className="absolute top-5 right-5 text-white/90 hover:text-white text-2xl leading-none"
                            aria-label="Close image preview"
                        >
                            ×
                        </button>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                setActiveImageIndex((prev) => (prev === null ? 0 : (prev - 1 + galleryItems.length) % galleryItems.length));
                            }}
                            className="absolute left-4 md:left-8 text-white/80 hover:text-white text-3xl px-2 transition-transform duration-200 hover:scale-110"
                            aria-label="Previous image"
                        >
                            ‹
                        </button>
                        <motion.div
                            key={galleryItems[activeImageIndex].image}
                            initial={{ opacity: 0, y: 24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 14, scale: 0.99 }}
                            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                            className="relative w-full max-w-6xl h-[80vh]"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <Image
                                src={galleryItems[activeImageIndex].image}
                                alt={`Photo ${activeImageIndex + 1}`}
                                fill
                                className="object-contain"
                                sizes="100vw"
                                priority
                            />
                        </motion.div>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                setActiveImageIndex((prev) => (prev === null ? 0 : (prev + 1) % galleryItems.length));
                            }}
                            className="absolute right-4 md:right-8 text-white/80 hover:text-white text-3xl px-2 transition-transform duration-200 hover:scale-110"
                            aria-label="Next image"
                        >
                            ›
                        </button>
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.24 }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 text-sm px-3 py-1 rounded-full bg-black/40 border border-white/15"
                        >
                            {activeImageIndex + 1}/{galleryItems.length}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
