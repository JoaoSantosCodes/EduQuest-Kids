import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';
import Button from './Button';

/**
 * Componente EmptyState para estados vazios
 */
function EmptyState({ 
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <Card variant="default" className={`text-center ${className}`}>
      <div className="py-12">
        {Icon && (
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Icon className="w-12 h-12 text-gray-400" />
            </div>
          </div>
        )}
        {title && (
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {description}
          </p>
        )}
        {actionLabel && onAction && (
          <Button
            variant="primary"
            size="md"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  className: PropTypes.string,
};

export default EmptyState;

