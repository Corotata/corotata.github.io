import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ImageWithPlaceholderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
}

const ImageWithPlaceholder = ({
    src,
    alt,
    className,
    onDrag, onDragEnd, onDragStart, onDragEnter, onDragLeave, onDragOver, onDrop,
    onAnimationStart, onAnimationEnd, onAnimationIteration,
    ...props
}: ImageWithPlaceholderProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <div className={`relative overflow-hidden bg-white/5 ${className}`}>
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center bg-white/10 animate-pulse z-10"
                    >
                        <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.img
                src={src}
                alt={alt}
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoading ? 0 : 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setError(true);
                }}
                className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
                loading="lazy"
                decoding="async"
                {...props}
            />

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-gray-500 text-xs">
                    Failed to load
                </div>
            )}
        </div>
    );
};

export default ImageWithPlaceholder;
