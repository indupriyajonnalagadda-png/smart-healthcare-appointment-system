import React from 'react';
import { Badge } from '../common/Badge';

export const StatusBadge = ({ status }) => {
  const getVariant = (s) => {
    switch (s) {
      case 'CONFIRMED':
        return 'success';
      case 'COMPLETED':
        return 'info';
      case 'CANCELLED':
        return 'danger';
      case 'NO_SHOW':
        return 'warning';
      case 'PENDING':
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getVariant(status)} size="sm">
      {status || 'UNKNOWN'}
    </Badge>
  );
};
