import { RoomCurrency } from '../backend';

export function formatCurrency(amount: bigint | number, currency: RoomCurrency): string {
  const numAmount = typeof amount === 'bigint' ? Number(amount) : amount;
  
  // Guard against invalid conversions
  if (!Number.isFinite(numAmount)) {
    return `${currency} ${amount.toString()}`;
  }
  
  switch (currency) {
    case RoomCurrency.IDR:
      return `Rp ${numAmount.toLocaleString('id-ID')}`;
    case RoomCurrency.USD:
      return `$${numAmount.toLocaleString('en-US')}`;
    case RoomCurrency.EUR:
      return `€${numAmount.toLocaleString('de-DE')}`;
    case RoomCurrency.SGD:
      return `S$${numAmount.toLocaleString('en-SG')}`;
    default:
      return `${numAmount.toLocaleString()}`;
  }
}
