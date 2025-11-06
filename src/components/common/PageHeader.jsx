import React from 'react';
import PropTypes from 'prop-types';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

/**
 * Componente PageHeader unificado para todos os portais
 */
function PageHeader({ 
  title,
  subtitle,
  icon: Icon,
  gradient = 'from-blue-600 to-blue-700',
  onProfileClick,
  actions,
  children,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`bg-gradient-to-r ${gradient} p-3 rounded-xl shadow-lg`}>
                <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{title}</h1>
              <p className="text-sm text-gray-600">{subtitle || user?.name}</p>
              {children}
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {actions}
            <Button
              variant="secondary"
              size="md"
              icon={User}
              onClick={onProfileClick}
              className="flex-shrink-0"
            >
              <span className="hidden sm:inline">Perfil</span>
            </Button>
            <Button
              variant="danger"
              size="md"
              icon={LogOut}
              onClick={handleLogout}
              className="flex-shrink-0"
            >
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType,
  gradient: PropTypes.string,
  onProfileClick: PropTypes.func,
  actions: PropTypes.node,
  children: PropTypes.node,
};

export default PageHeader;

