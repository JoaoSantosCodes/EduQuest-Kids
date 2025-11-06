import React, { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente Card reutilizável com variantes
 */
const Card = memo(function Card({ 
  children, 
  variant = 'default',
  padding = 'default',
  hover = false,
  className = '',
  onClick,
  ...props 
}) {
  const variants = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white shadow-lg',
    gradient: 'bg-gradient-to-br from-white to-gray-50 shadow-md',
    colored: 'bg-gradient-to-br shadow-lg text-white',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    default: 'p-6',
    lg: 'p-8',
  };

  const hoverClass = hover 
    ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer' 
    : 'transition-shadow duration-200';

  return (
    <div
      className={`
        rounded-xl
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverClass}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'elevated', 'gradient', 'colored']),
  padding: PropTypes.oneOf(['none', 'sm', 'default', 'lg']),
  hover: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Card;

