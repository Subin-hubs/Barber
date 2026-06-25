/**
 * Generate all time slots for a day
 * @param {string} openTime  - "09:00"
 * @param {string} closeTime - "19:00"
 * @param {number} duration  - 30 (minutes)
 * @returns {string[]}       - ["09:00", "09:30", "10:00", ...]
 */
export function generateSlots(openTime, closeTime, duration = 30) {
  const slots = [];
  let [h, m] = openTime.split(':').map(Number);
  const [endH, endM] = closeTime.split(':').map(Number);
  const endMinutes = endH * 60 + endM;

  while (h * 60 + m < endMinutes) {
    slots.push(
      `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    );
    m += duration;
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
  }
  return slots;
}

/**
 * Format NPR currency
 * @param {number} amount
 * @returns {string} "NPR 1,500"
 */
export function formatNPR(amount) {
  return `NPR ${new Intl.NumberFormat('en-NP').format(amount)}`;
}

/**
 * Format date string to readable
 * @param {string} dateStr - "2025-07-15"
 * @returns {string} "Tuesday, July 15, 2025"
 */
export function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function todayString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get day key from date string
 * @param {string} dateStr - "2025-07-15"
 * @returns {string} "tue"
 */
export function getDayKey(dateStr) {
  return new Date(dateStr + 'T00:00:00')
    .toLocaleDateString('en-US', { weekday: 'short' })
    .toLowerCase(); // "mon", "tue", etc.
}
