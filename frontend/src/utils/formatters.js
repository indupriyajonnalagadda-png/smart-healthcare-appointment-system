export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'COMPLETED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'NO_SHOW':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'PENDING':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const getUrgencyColor = (urgency) => {
  switch (urgency) {
    case 'EMERGENCY':
      return 'bg-red-500 text-white';
    case 'ELEVATED':
      return 'bg-amber-500 text-white';
    case 'ROUTINE':
    default:
      return 'bg-teal-600 text-white';
  }
};
