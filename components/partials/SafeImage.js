import React from 'react';
import Image from 'next/image';

const SafeImage = React.forwardRef(({ src, alt, width, height, fill, sizes, priority, fetchPriority, style, ...rest }, ref) => {
  const imgProps = {
    src,
    alt,
    width,
    height,
    fill,
    sizes: sizes || (fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined),
    priority: priority || fill,
    style: {
      ...style,
      objectFit: fill ? 'cover' : undefined,
    },
    ...rest
  };

  // Convert fetchPriority to lowercase if it exists
  if (fetchPriority) {
    imgProps.fetchpriority = fetchPriority.toLowerCase();
  }

  return <Image ref={ref} {...imgProps} />;
});

SafeImage.displayName = 'SafeImage';

export default SafeImage;