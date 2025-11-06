import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Componente StatCard para exibir estatísticas
 */
function StatCard({ 
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  trendValue,
  color = 'blue',
  onClick,
  className = '',
}) {
  const colors = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-600',
    },
    green: {
      bg: 'from-green-500 to-green-600',
      icon: 'bg-green-100 text-green-600',
      text: 'text-green-600',
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      icon: 'bg-purple-100 text-purple-600',
      text: 'text-purple-600',
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      icon: 'bg-orange-100 text-orange-600',
      text: 'text-orange-600',
    },
    red: {
      bg: 'from-red-500 to-red-600',
      icon: 'bg-red-100 text-red-600',
      text: 'text-red-600',
    },
    cyan: {
      bg: 'from-cyan-500 to-cyan-600',
      icon: 'bg-cyan-100 text-cyan-600',
      text: 'text-cyan-600',
    },
  };

  const colorScheme = colors[color] || colors.blue;

  return (
    <Card 
      variant="elevated" 
      hover={!!onClick}
      onClick={onClick}
      className={className}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && trendValue && (
              <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        
        {Icon && (
          <div className={`${colorScheme.icon} p-3 rounded-xl`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
}

StatCard.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  trend: PropTypes.oneOf(['up', 'down']),
  trendValue: PropTypes.string,
  color: PropTypes.oneOf(['blue', 'green', 'purple', 'orange', 'red', 'cyan']),
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default StatCard;

