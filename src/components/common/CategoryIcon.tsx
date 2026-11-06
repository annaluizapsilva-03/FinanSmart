import React from 'react';
import * as LucideIcons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  color = '#3b82f6',
  size = 18,
  className = '',
}) => {
  // Normalize icon name or fallback
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Tag;

  return (
    <div
      className={`flex items-center justify-center rounded-xl shrink-0 ${className}`}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        width: size * 2,
        height: size * 2,
      }}
    >
      <IconComponent size={size} strokeWidth={2.2} />
    </div>
  );
};
