import { FiCheck, FiClock, FiCheckSquare, FiClipboard, FiThumbsUp, FiTrash2, FiHelpCircle } from 'react-icons/fi';

 const ORDERICONS = {
  Draft: FiClipboard,
  Submitted: FiClock,
  Approved: FiCheckSquare,
  Delivered: FiThumbsUp,
  Cancelled: FiTrash2,
};
 const COLORS = {
  primary: '#007BFF',
  secondary: '#6C757D',
  success: '#28A745',
  danger: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',
  white: '#FFFFFF',
  black: '#000000',
};
export const OrderStatusIcon = ({ status, size='20', color='' }) => {
  const IconComponent = ORDERICONS[status] || FiHelpCircle;

  return <IconComponent size={size} color={COLORS[color]} />;
};