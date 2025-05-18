import React from 'react';

const SkeletonLoader = ({ width = '100%', height = 20, circle = false, style = {}, className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}
      style={{
        width,
        height,
        borderRadius: circle ? '50%' : '8px',
        ...style,
      }}
    />
  );
};

export default SkeletonLoader; 