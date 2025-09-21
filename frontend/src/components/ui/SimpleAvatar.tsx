import React from 'react';

interface SimpleAvatarProps {
  size?: number;
  className?: string;
}

const SimpleAvatar: React.FC<SimpleAvatarProps> = ({ 
  size = 120, 
  className = '' 
}) => (
  <div 
    className={`rounded-full ${className} bg-cover bg-center overflow-hidden`}
    style={{ 
      width: size, 
      height: size,
      border: '2px solid #6366f1',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}
  >
    <img 
      src="/images/ai-professor-avatar.png" 
      alt="AI Professor Avatar"
      className="w-full h-full object-cover"
    />
  </div>
);

export default SimpleAvatar;
