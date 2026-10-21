// Display helpers. Data holds plain numbers; formatting happens only at render time.
const number = new Intl.NumberFormat('en-US');

export const formatKm = (km) => `${number.format(km)} km`;
export const formatKsh = (amount) => `KSh ${number.format(amount)}`;
export const carName = (car) => `${car.make} ${car.model}`;
