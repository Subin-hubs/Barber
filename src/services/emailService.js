import emailjs from '@emailjs/browser';
import { formatNPR, formatDate } from '../utils/slots';

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const PRIMARY_SERVICE = import.meta.env.VITE_EMAILJS_SERVICE_ID_PRIMARY;
const FALLBACK_SERVICE = import.meta.env.VITE_EMAILJS_SERVICE_ID_FALLBACK;
const TEMPLATE_CUSTOMER = import.meta.env.VITE_EMAILJS_TEMPLATE_CUSTOMER;
const TEMPLATE_ADMIN = import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN;
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const APP_URL = import.meta.env.VITE_APP_URL;

async function sendWithFallback(templateId, params) {
  try {
    await emailjs.send(PRIMARY_SERVICE, templateId, params, PUBLIC_KEY);
    return { success: true, provider: 'primary' };
  } catch (error) {
    console.error('Primary EmailJS service failed:', error);
    try {
      await emailjs.send(FALLBACK_SERVICE, templateId, params, PUBLIC_KEY);
      return { success: true, provider: 'fallback' };
    } catch (fallbackError) {
      console.error('Fallback EmailJS service also failed:', fallbackError);
      return { success: false };
    }
  }
}

export async function sendBookingConfirmation(booking) {
  if (!booking.customerEmail) return { success: false, reason: 'No email provided' };

  const params = {
    to_email: booking.customerEmail,
    customer_name: booking.customerName,
    booking_id: booking.bookingId,
    service_name: booking.serviceName,
    barber_name: booking.barberName === 'any' ? 'Next Available Barber' : booking.barberName,
    date: formatDate(booking.date),
    slot: booking.slot,
    price: formatNPR(booking.servicePrice),
    tracking_url: `${APP_URL}/track`
  };

  return sendWithFallback(TEMPLATE_CUSTOMER, params);
}

export async function sendAdminAlert(booking) {
  const params = {
    to_email: ADMIN_EMAIL,
    customer_name: booking.customerName,
    customer_phone: booking.customerPhone,
    service_name: booking.serviceName,
    barber_name: booking.barberName === 'any' ? 'Next Available Barber' : booking.barberName,
    date: formatDate(booking.date),
    slot: booking.slot,
    booking_id: booking.bookingId,
    notes: booking.notes || 'None'
  };

  return sendWithFallback(TEMPLATE_ADMIN, params);
}
