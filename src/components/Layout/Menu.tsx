
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogIn, UserPlus, Gift, ShoppingCart, RotateCw, Timer, Shield, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AuthModal from '../Auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

const SideMenu = ({ isOpen, onClose, onLoginClick, onSignupClick }: SideMenuProps) => {
  const [authType, setAuthType] = useState<'login' | 'signup' | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const openAuth = (type: 'login' | 'signup') => {
    if (onLoginClick && type === 'login') {
      onLoginClick();
      onClose();
      return;
    }
    
    if (onSignupClick && type === 'signup') {
      onSignupClick();
      onClose();
      return;
    }
    
    setAuthType(type);
  };

  const closeAuth = () => {
    setAuthType(null);
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  // Animation variants
  const menuVariants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } }
  };
  
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };
  
  const buttonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: i * 0.1,
        duration: 0.3 
      }
    }),
    tap: { scale: 0.97 }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-menu z-50"
            onClick={onClose}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed top-0 right-0 w-full md:w-80 h-full bg-spdm-dark border-l border-spdm-green/30 z-50 p-6 flex flex-col"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-spdm-green glow-text">Menu</h2>
              <motion.button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-spdm-gray transition-colors"
                whileTap={{ scale: 0.9, rotate: -90 }}
                whileHover={{ rotate: -15 }}
              >
                <X className="text-spdm-green" size={24} />
              </motion.button>
            </div>

            <div className="flex flex-col space-y-5">
              {!user ? (
                <>
                  <motion.button 
                    onClick={() => openAuth('login')}
                    className="flex items-center p-3 rounded-md hover:bg-spdm-gray transition-all duration-200 border border-spdm-green/50 hover:border-spdm-green group"
                    variants={buttonVariants}
                    custom={0}
                    initial="initial"
                    animate="animate"
                    whileTap="tap"
                  >
                    <LogIn className="mr-3 text-spdm-green" size={20} />
                    <span className="text-spdm-green group-hover:glow-text transition-all duration-200">Login</span>
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => openAuth('signup')}
                    className="flex items-center p-3 rounded-md hover:bg-spdm-gray transition-all duration-200 border border-spdm-green/50 hover:border-spdm-green group"
                    variants={buttonVariants}
                    custom={1}
                    initial="initial"
                    animate="animate"
                    whileTap="tap"
                  >
                    <UserPlus className="mr-3 text-spdm-green" size={20} />
                    <span className="text-spdm-green group-hover:glow-text transition-all duration-200">Sign Up</span>
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button 
                    onClick={() => handleNavigate('/free-key')}
                    className="flex items-center p-3 rounded-md hover:bg-spdm-gray transition-all duration-200 border border-spdm-green/50 hover:border-spdm-green group"
                    variants={buttonVariants}
                    custom={0}
                    initial="initial"
                    animate="animate"
                    whileTap="tap"
                  >
                    <Gift className="mr-3 text-spdm-green" size={20} />
                    <span className="text-spdm-green group-hover:glow-text transition-all duration-200">Free Key</span>
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => handleNavigate('/shop')}
                    className="flex items-center p-3 rounded-md hover:bg-spdm-gray transition-all duration-200 border border-spdm-green/50 hover:border-spdm-green group"
                    variants={buttonVariants}
                    custom={1}
                    initial="initial"
                    animate="animate"
                    whileTap="tap"
                  >
                    <ShoppingCart className="mr-3 text-spdm-green" size={20} />
                    <span className="text-spdm-green group-hover:glow-text transition-all duration-200">Shop</span>
                  </motion.button>

                  <motion.button 
                    onClick={() => handleNavigate('/spin')}
                    className="flex items-center p-3 rounded-md hover:bg-spdm-gray transition-all duration-200 border border-spdm-green/50 hover:border-spdm-green group"
                    variants={buttonVariants}
                    custom={2}
                    initial="initial"
                    animate="animate"
                    whileTap="tap"
                  >
                    <RotateCw className="mr-3 text-spdm-green" size={20} />
                    <span className="text-spdm-green group-hover:glow-text transition-all duration-200">Spin Wheel</span>
                  </motion.button>

                  <motion.button 
                    onClick={() => handleNavigate('/afk-farm')}
                    className="flex items-center p-3 rounded-md hover:bg-spdm-gray transition-all duration-200 border border-spdm-green/50 hover:border-spdm-green group"
                    variants={buttonVariants}
                    custom={3}
                    initial="initial"
                    animate="animate"
                    whileTap="tap"
                  >
                    <Timer className="mr-3 text-spdm-green" size={20} />
                    <span className="text-spdm-green group-hover:glow-text transition-all duration-200">AFK Farm</span>
                  </motion.button>
                  
                  {user.isAdmin && (
                    <motion.button 
                      onClick={() => handleNavigate('/admin')}
                      className="flex items-center p-3 rounded-md hover:bg-spdm-gray transition-all duration-200 border border-spdm-green/50 hover:border-spdm-green group"
                      variants={buttonVariants}
                      custom={4}
                      initial="initial"
                      animate="animate"
                      whileTap="tap"
                    >
                      <Shield className="mr-3 text-spdm-green" size={20} />
                      <span className="text-spdm-green group-hover:glow-text transition-all duration-200">Admin Panel</span>
                    </motion.button>
                  )}
                </>
              )}
            </div>

            <div className="mt-auto space-y-4">
              {/* Social media links with improved styling */}
              <motion.button
                onClick={() => openExternalLink('https://chat.whatsapp.com/KteLnsPOMEKIJw3I1phViP')}
                className="w-full p-3 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium flex justify-center items-center gap-3 transition-all"
                variants={buttonVariants}
                custom={user ? 5 : 2}
                initial="initial"
                animate="animate"
                whileTap="tap"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  width="20" 
                  height="20" 
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </motion.button>
              
              <motion.button
                onClick={() => openExternalLink('https://discord.gg/aJaKPWr42x')}
                className="w-full p-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex justify-center items-center gap-3 transition-all"
                variants={buttonVariants}
                custom={user ? 6 : 3}
                initial="initial"
                animate="animate"
                whileTap="tap"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  width="20" 
                  height="20" 
                  fill="currentColor"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                </svg>
                Discord
              </motion.button>
              
              <motion.button
                onClick={() => openExternalLink('https://www.youtube.com/@yowxmods')}
                className="w-full p-3 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium flex justify-center items-center gap-3 transition-all"
                variants={buttonVariants}
                custom={user ? 7 : 4}
                initial="initial"
                animate="animate"
                whileTap="tap"
              >
                <Youtube size={20} />
                YouTube Channel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {authType !== null && !onLoginClick && !onSignupClick && (
        <AuthModal isOpen={authType !== null} onClose={closeAuth} type={authType || 'login'} />
      )}
    </>
  );
};

export default SideMenu;
