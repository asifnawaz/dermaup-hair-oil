/**
 * RECONSTRUCTED SOURCE
 *
 * Public behavior, subjects, bilingual copy, Resend settings, and exported
 * signatures were recovered from deployed module 81929. The deployed bundle is
 * the authority for this reconstruction.
 */

import { Resend } from 'resend';

import type { Order } from './db/schema';
import { getOptionalEnv, getRequiredEnv } from './env';
import { getCurrentStorefrontSettings } from './store-settings.server';
import {
  getDefaultStorefrontSettings,
  type StoreContactSettings,
} from './store-settings';

let resend: Resend | null = null;

const FROM_EMAIL =
  getOptionalEnv('FROM_EMAIL') || 'UpDerma <orders@upderma.com>';
const REPLY_TO_EMAIL =
  getOptionalEnv('REPLY_TO_EMAIL') || 'support@upderma.com';

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(getRequiredEnv('RESEND_API_KEY'));
  }
  return resend;
}

export type EmailType =
  | 'order_confirmation'
  | 'payment_verified'
  | 'order_shipped'
  | 'delivery_reminder'
  | 'post_delivery';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface OrderEmailData {
  order: Order;
  contact: StoreContactSettings;
  trackingUrl?: string;
  expectedDeliveryDate?: string;
}

type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

function getPackageName(
  packageType: string,
  lang: 'en' | 'ur',
): string {
  const names = {
    en: {
      single: '1 Bottle (50ml)',
      double: '2 Bottles (100ml)',
      triple: '3 Bottles (150ml)',
    },
    ur: {
      single: '1 بوتل (50ml)',
      double: '2 بوتلیں (100ml)',
      triple: '3 بوتلیں (150ml)',
    },
  };
  return names[lang][packageType as keyof (typeof names)[typeof lang]] ||
    packageType;
}

function getPaymentMethodName(
  method: string,
  lang: 'en' | 'ur',
): string {
  const names = {
    en: {
      cod: 'Cash on Delivery',
      easypaisa: 'EasyPaisa',
      bank: 'Bank Transfer',
    },
    ur: {
      cod: 'کیش آن ڈیلیوری',
      easypaisa: 'ایزی پیسہ',
      bank: 'بینک ٹرانسفر',
    },
  };
  return names[lang][method as keyof (typeof names)[typeof lang]] || method;
}

function emailFrame(
  language: 'en' | 'ur',
  accent: string,
  heading: string,
  body: string,
): string {
  return `
<!DOCTYPE html>
<html dir="${language === 'ur' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: ${language === 'ur' ? "'Noto Nastaliq Urdu', Arial" : 'Arial'}, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${accent}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    .button { display: inline-block; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="header"><h1 style="margin:0;font-size:24px">${heading}</h1></div>
  <div class="content">${body}</div>
  <div class="footer"><p>${language === 'ur' ? 'جزاک اللہ،' : 'JazakAllah,'}<br>UpDerma Team</p></div>
</body>
</html>
  `.trim();
}

function orderConfirmationTemplate(data: OrderEmailData): EmailContent {
  const { order, contact } = data;
  const language = order.language === 'ur' ? 'ur' : 'en';
  const urdu = language === 'ur';
  const subject = urdu
    ? `✅ آرڈر کنفرم - UpDerma #${order.orderNumber}`
    : `✅ Order Confirmed - UpDerma #${order.orderNumber}`;
  const greeting = urdu
    ? `السلام علیکم ${order.customerName}،`
    : `Assalam-o-Alaikum ${order.customerName},`;
  const body = `
    <p style="font-size:18px">${greeting}</p>
    <p>${urdu ? 'شکریہ! آپ کا آرڈر مل گیا ہے۔' : 'Shukriya! Your order has been received.'}</p>
    <div class="box">
      <h3 style="margin-top:0;color:#16a34a">${urdu ? 'آرڈر کی تفصیلات' : 'Order Details'}</h3>
      <p>${urdu ? 'آرڈر نمبر' : 'Order #'}: <strong>${order.orderNumber}</strong></p>
      <p>${urdu ? 'پیکج' : 'Package'}: ${getPackageName(order.packageType, language)}</p>
      <p>${urdu ? 'پیمنٹ' : 'Payment'}: ${getPaymentMethodName(order.paymentMethod, language)}</p>
      <p>${urdu ? 'کل رقم' : 'Total'}: <strong>PKR ${order.total.toLocaleString()}</strong></p>
    </div>
    <div class="box">
      <h3 style="margin-top:0;color:#16a34a">${urdu ? 'ڈیلیوری ایڈریس' : 'Delivery Address'}</h3>
      <p>${order.address}<br>${order.city}</p>
    </div>
    <p><strong>${urdu ? 'متوقع ڈیلیوری' : 'Expected Delivery'}:</strong> ${urdu ? '3-5 کاروباری دن' : '3-5 business days'}</p>
    <p style="text-align:center">
      ${urdu ? 'سوالات؟ واٹس ایپ پر رابطہ کریں:' : 'Questions? Contact us on WhatsApp:'}<br>
      <a class="button" style="background:#25D366" href="https://wa.me/${contact.whatsappNumber}">WhatsApp: ${contact.whatsappDisplay}</a>
    </p>`;
  const text = urdu
    ? `${greeting}

شکریہ! آپ کا آرڈر مل گیا ہے۔

آرڈر نمبر: ${order.orderNumber}
پیکج: ${getPackageName(order.packageType, 'ur')}
کل رقم: PKR ${order.total.toLocaleString()}

متوقع ڈیلیوری: 3-5 کاروباری دن

سوالات؟ واٹس ایپ: ${contact.whatsappDisplay}

جزاک اللہ،
UpDerma Team`
    : `${greeting}

Shukriya! Your order has been received.

Order #: ${order.orderNumber}
Package: ${getPackageName(order.packageType, 'en')}
Total: PKR ${order.total.toLocaleString()}

Expected Delivery: 3-5 business days

Questions? WhatsApp: ${contact.whatsappDisplay}

JazakAllah,
UpDerma Team`;

  return {
    subject,
    html: emailFrame(
      language,
      'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
      urdu ? '🎉 آرڈر کنفرم ہو گیا!' : '🎉 Order Confirmed!',
      body,
    ),
    text,
  };
}

function paymentVerifiedTemplate(data: OrderEmailData): EmailContent {
  const { order } = data;
  const language = order.language === 'ur' ? 'ur' : 'en';
  const urdu = language === 'ur';
  const subject = urdu
    ? '✅ پیمنٹ تصدیق - آپ کا آرڈر تیار ہو رہا ہے!'
    : '✅ Payment Verified - Your Order is Being Prepared!';
  const greeting = urdu
    ? `السلام علیکم ${order.customerName}،`
    : `Assalam-o-Alaikum ${order.customerName},`;
  const body = `
    <p style="font-size:18px">${greeting}</p>
    <div class="box" style="background:#dcfce7;border-color:#16a34a;text-align:center">
      <h2 style="color:#16a34a;margin:0">${urdu ? '🎉 بہترین خبر!' : '🎉 Great news!'}</h2>
      <p>${urdu ? 'آپ کی پیمنٹ تصدیق ہو گئی ہے۔' : 'Your payment has been verified.'}</p>
    </div>
    <p>${urdu ? 'آپ کا آرڈر اب پیکنگ کے لیے تیار ہے اور 24 گھنٹوں میں ڈسپیچ ہو جائے گا۔' : 'Your order is now ready for packing and will be dispatched within 24 hours.'}</p>
    <p>${urdu ? 'ٹریکنگ کی معلومات جلد ہی آپ کو بھیج دی جائیں گی۔' : 'Tracking information will be sent to you soon.'}</p>`;
  const text = urdu
    ? `${greeting}

بہترین خبر! آپ کی پیمنٹ تصدیق ہو گئی ہے۔

آپ کا آرڈر اب پیکنگ کے لیے تیار ہے اور 24 گھنٹوں میں ڈسپیچ ہو جائے گا۔

جزاک اللہ،
UpDerma Team`
    : `${greeting}

Great news! Your payment has been verified.

Your order is now ready for packing and will be dispatched within 24 hours.

JazakAllah,
UpDerma Team`;

  return {
    subject,
    html: emailFrame(
      language,
      'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
      urdu ? '✅ پیمنٹ تصدیق شدہ!' : '✅ Payment Verified!',
      body,
    ),
    text,
  };
}

function orderShippedTemplate(data: OrderEmailData): EmailContent {
  const { order, trackingUrl, expectedDeliveryDate } = data;
  const language = order.language === 'ur' ? 'ur' : 'en';
  const urdu = language === 'ur';
  const subject = urdu
    ? '🚚 آپ کا UpDerma آرڈر شپ ہو گیا!'
    : '🚚 Your UpDerma Order Has Been Shipped!';
  const greeting = urdu
    ? `السلام علیکم ${order.customerName}،`
    : `Assalam-o-Alaikum ${order.customerName},`;
  const body = `
    <p style="font-size:18px">${greeting}</p>
    <div class="box" style="border:2px solid #3b82f6;text-align:center">
      <h3 style="margin:0;color:#3b82f6">${urdu ? 'ٹریکنگ کی تفصیلات' : 'Tracking Details'}</h3>
      <p><strong>${urdu ? 'کورئیر' : 'Courier'}:</strong> ${order.courierName || 'TCS'}<br>
      <strong>${urdu ? 'ٹریکنگ نمبر' : 'Tracking #'}:</strong> ${order.trackingNumber}</p>
      ${trackingUrl ? `<a class="button" style="background:#3b82f6" href="${trackingUrl}">${urdu ? 'آرڈر ٹریک کریں' : 'Track Your Order'}</a>` : ''}
    </div>
    ${expectedDeliveryDate ? `<p style="text-align:center"><strong>${urdu ? 'متوقع ڈیلیوری' : 'Expected Delivery'}:</strong> ${expectedDeliveryDate}</p>` : ''}
    <div class="box" style="background:#fef3c7;border-color:#f59e0b">
      <h3 style="color:#92400e">${urdu ? 'ڈیلیوری کے وقت' : 'At Delivery'}</h3>
      <ul>
        ${order.paymentMethod === 'cod' ? `<li>${urdu ? `PKR ${order.total.toLocaleString()} کیش تیار رکھیں` : `Keep PKR ${order.total.toLocaleString()} cash ready`}</li>` : ''}
        <li>${urdu ? 'فون آن رکھیں' : 'Keep your phone on'}</li>
        <li>${urdu ? 'ایڈریس پر کوئی موجود ہو' : 'Someone available at address'}</li>
      </ul>
    </div>`;
  const text = urdu
    ? `${greeting}

آپ کا آرڈر شپ ہو گیا ہے! 📦

کورئیر: ${order.courierName || 'TCS'}
ٹریکنگ نمبر: ${order.trackingNumber}
${trackingUrl ? `ٹریک کریں: ${trackingUrl}\n` : ''}${expectedDeliveryDate ? `متوقع ڈیلیوری: ${expectedDeliveryDate}\n` : ''}
جزاک اللہ،
UpDerma Team`
    : `${greeting}

Your order has been shipped! 📦

Courier: ${order.courierName || 'TCS'}
Tracking #: ${order.trackingNumber}
${trackingUrl ? `Track Here: ${trackingUrl}\n` : ''}${expectedDeliveryDate ? `Expected Delivery: ${expectedDeliveryDate}\n` : ''}
JazakAllah,
UpDerma Team`;

  return {
    subject,
    html: emailFrame(
      language,
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      urdu ? '📦 آپ کا آرڈر شپ ہو گیا!' : '📦 Your Order Has Shipped!',
      body,
    ),
    text,
  };
}

function deliveryReminderTemplate(data: OrderEmailData): EmailContent {
  const { order } = data;
  const language = order.language === 'ur' ? 'ur' : 'en';
  const urdu = language === 'ur';
  const subject = urdu
    ? '📦 آپ کا UpDerma آرڈر آج ڈیلیور ہو رہا ہے!'
    : '📦 Your UpDerma Order Arriving Today!';
  const greeting = urdu
    ? `السلام علیکم ${order.customerName}،`
    : `Assalam-o-Alaikum ${order.customerName},`;
  const cashReminder =
    order.paymentMethod === 'cod'
      ? urdu
        ? `- PKR ${order.total.toLocaleString()} کیش تیار رکھیں\n`
        : `- Keep PKR ${order.total.toLocaleString()} cash ready\n`
      : '';
  const body = `
    <p style="font-size:18px">${greeting}</p>
    <p>${urdu ? 'آپ کا آرڈر آج ڈیلیور ہونے والا ہے! 🎉' : 'Your order is arriving today! 🎉'}</p>
    <div class="box" style="background:#fef3c7;border:2px solid #f59e0b">
      <h3 style="color:#92400e">${urdu ? 'براہ کرم یقینی بنائیں' : 'Please ensure:'}</h3>
      <ul>
        <li>${urdu ? 'کوئی گھر پر موجود ہو' : 'Someone is home'}</li>
        <li>${urdu ? 'فون آن ہو' : 'Phone is on'}</li>
        ${order.paymentMethod === 'cod' ? `<li><strong>${urdu ? `PKR ${order.total.toLocaleString()} کیش تیار رکھیں` : `Keep PKR ${order.total.toLocaleString()} cash ready`}</strong></li>` : ''}
      </ul>
    </div>
    <p style="text-align:center">${urdu ? 'آرڈر نمبر' : 'Order #'}: <strong>${order.orderNumber}</strong></p>`;
  const text = urdu
    ? `${greeting}

آپ کا آرڈر آج ڈیلیور ہونے والا ہے! 🎉

براہ کرم یقینی بنائیں:
- کوئی گھر پر موجود ہو
- فون آن ہو
${cashReminder}
آرڈر نمبر: ${order.orderNumber}

جزاک اللہ،
UpDerma Team`
    : `${greeting}

Your order is arriving today! 🎉

Please ensure:
- Someone is home
- Phone is on
${cashReminder}
Order #: ${order.orderNumber}

JazakAllah,
UpDerma Team`;

  return {
    subject,
    html: emailFrame(
      language,
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      urdu ? '🎉 آج ڈیلیوری!' : '🎉 Arriving Today!',
      body,
    ),
    text,
  };
}

function postDeliveryTemplate(data: OrderEmailData): EmailContent {
  const { order, contact } = data;
  const language = order.language === 'ur' ? 'ur' : 'en';
  const urdu = language === 'ur';
  const subject = urdu
    ? '💚 آپ کا UpDerma تجربہ کیسا رہا؟'
    : "💚 How's Your UpDerma Experience?";
  const greeting = urdu
    ? `السلام علیکم ${order.customerName}،`
    : `Assalam-o-Alaikum ${order.customerName},`;
  const body = `
    <p style="font-size:18px">${greeting}</p>
    <p>${urdu ? 'امید ہے آپ کو UpDerma Hair Oil مل گیا ہے!' : "Hope you've received your UpDerma Hair Oil!"}</p>
    <div class="box" style="background:#dcfce7;border-color:#16a34a">
      <h3 style="color:#16a34a">${urdu ? 'بہترین نتائج کے لیے' : 'Quick tips for best results:'}</h3>
      <ol>
        <li>${urdu ? 'رات کو لگائیں، صبح دھو لیں' : 'Apply at night, wash in morning'}</li>
        <li>${urdu ? '5 منٹ ہلکی مالش کریں' : 'Massage gently for 5 minutes'}</li>
        <li>${urdu ? '8 ہفتے مسلسل استعمال کریں' : 'Use consistently for 8 weeks'}</li>
      </ol>
      <p><em>${urdu ? 'نتائج عام طور پر 4-8 ہفتوں میں نظر آتے ہیں۔' : 'Results typically show in 4-8 weeks.'}</em></p>
    </div>
    <p style="text-align:center">${urdu ? 'سوالات؟ ہم مدد کے لیے حاضر ہیں:' : "Questions? We're here to help:"}<br>
      <a class="button" style="background:#25D366" href="https://wa.me/${contact.whatsappNumber}">WhatsApp: ${contact.whatsappDisplay}</a>
    </p>
    <div class="box" style="background:#fef3c7;text-align:center"><p>⭐⭐⭐⭐⭐</p></div>`;
  const text = urdu
    ? `${greeting}

امید ہے آپ کو UpDerma Hair Oil مل گیا ہے!

بہترین نتائج کے لیے:
1. رات کو لگائیں، صبح دھو لیں
2. 5 منٹ ہلکی مالش کریں
3. 8 ہفتے مسلسل استعمال کریں

نتائج عام طور پر 4-8 ہفتوں میں نظر آتے ہیں۔

سوالات؟ واٹس ایپ: ${contact.whatsappDisplay}

جزاک اللہ،
UpDerma Team`
    : `${greeting}

Hope you've received your UpDerma Hair Oil!

Quick tips for best results:
1. Apply at night, wash in morning
2. Massage gently for 5 minutes
3. Use consistently for 8 weeks

Results typically show in 4-8 weeks.

Questions? WhatsApp: ${contact.whatsappDisplay}

JazakAllah,
UpDerma Team`;

  return {
    subject,
    html: emailFrame(
      language,
      'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
      urdu ? '💚 آپ کا تجربہ کیسا رہا؟' : "💚 How's Your Experience?",
      body,
    ),
    text,
  };
}

const templateMap: Record<
  EmailType,
  (data: OrderEmailData) => EmailContent
> = {
  order_confirmation: orderConfirmationTemplate,
  payment_verified: paymentVerifiedTemplate,
  order_shipped: orderShippedTemplate,
  delivery_reminder: deliveryReminderTemplate,
  post_delivery: postDeliveryTemplate,
};

export async function sendOrderEmail(
  emailType: EmailType,
  order: Order,
  options?: {
    trackingUrl?: string;
    expectedDeliveryDate?: string;
  },
): Promise<EmailResult> {
  const template = templateMap[emailType];
  if (!template) {
    return { success: false, error: `Unknown email type: ${emailType}` };
  }

  const storeSettings = await getCurrentStorefrontSettings();
  const { subject, html, text } = template({
    order,
    contact: storeSettings.contact,
    trackingUrl: options?.trackingUrl,
    expectedDeliveryDate: options?.expectedDeliveryDate,
  });

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: order.customerEmail,
      replyTo: REPLY_TO_EMAIL,
      subject,
      html,
      text,
    });

    return error
      ? { success: false, error: error.message }
      : { success: true, messageId: data?.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function getEmailSubject(
  emailType: EmailType,
  order: Order,
): string {
  const template = templateMap[emailType];
  if (!template) return '';

  return template({
    order,
    contact: getDefaultStorefrontSettings().contact,
  }).subject;
}
