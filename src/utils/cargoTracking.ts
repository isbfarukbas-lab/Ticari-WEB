import { LeadRequest } from '../types';

export const CARGO_CARRIERS = [
  'Yurtiçi Kargo',
  'Aras Kargo',
  'MNG / DHL eCommerce',
  'Sürat Kargo',
  'PTT Kargo',
  'HepsiJET',
  'Kolay Gelsin',
  'Horoz Lojistik / Ambar',
  'Özel Sevkiyat Aracı',
] as const;

export function getCargoTrackingUrl(carrier?: string, code?: string): string | null {
  const cleanCode = (code || '').trim();
  if (!cleanCode) return null;
  const c = (carrier || '').toLowerCase();

  if (c.includes('yurtiçi') || c.includes('yurtici')) {
    return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${encodeURIComponent(cleanCode)}`;
  }
  if (c.includes('aras')) {
    return `https://kargotakip.araskargo.com.tr/mainpage.aspx?code=${encodeURIComponent(cleanCode)}`;
  }
  if (c.includes('mng') || c.includes('dhl')) {
    return `https://kargotakip.dhlecommerce.com.tr/?takipNo=${encodeURIComponent(cleanCode)}`;
  }
  if (c.includes('sürat') || c.includes('surat')) {
    return `https://www.suratkargo.com.tr/KargoTakip/?kargotakipno=${encodeURIComponent(cleanCode)}`;
  }
  if (c.includes('ptt')) {
    return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${encodeURIComponent(cleanCode)}`;
  }
  if (c.includes('horoz')) {
    return `https://app3.horoz.com.tr/wsKurumsal/_genel/frmGonderiTakip.aspx?lng=tr`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`${carrier || 'Kargo'} kargo takip ${cleanCode}`)}`;
}

export function buildWhatsAppOrderStatusUrl(lead: LeadRequest): string | null {
  const digits = (lead.phone || '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  const normalizedPhone = digits.startsWith('90')
    ? digits
    : digits.startsWith('0')
    ? `9${digits}`
    : `90${digits}`;

  const isStore = lead.leadType === 'web_order' || lead.leadType === 'store_order';
  const orderRef = lead.orderNumber ? `#${lead.orderNumber}` : `#${lead.id}`;

  let statusLine = 'Siparişiniz alındı ve inceleniyor.';
  if (lead.status === 'arandi') {
    statusLine = isStore
      ? 'Siparişiniz onaylandı ve paketlenmek üzere hazırlanıyor.'
      : 'Talebiniz incelendi ve ekibimiz tarafından planlamaya alındı.';
  } else if (lead.status === 'kesif_verildi') {
    statusLine = isStore
      ? 'Siparişiniz kargoya / sevkiyata teslim edildi!'
      : 'Mimari keşif ve teklif planlamanız oluşturuldu.';
  } else if (lead.status === 'sozlesme_imzalandi') {
    statusLine = isStore
      ? 'Siparişiniz başarıyla teslim edildi. İyi günlerde kullanmanızı dileriz!'
      : 'Sözleşme ve uygulama süreciniz onaylandı. Hayırlı olsun!';
  }

  const trackingUrl = getCargoTrackingUrl(lead.trackingCarrier, lead.trackingCode);
  const trackingBlock = lead.trackingCode
    ? `\n\n📦 *Kargo Firması:* ${lead.trackingCarrier || 'Anlaşmalı Kargo'}\n🔢 *Takip Kodu:* ${lead.trackingCode}${
        trackingUrl ? `\n🔗 *Canlı Kargo Takip:* ${trackingUrl}` : ''
      }`
    : '';

  const noteBlock = lead.adminNotes ? `\n\n📝 *Not:* ${lead.adminNotes}` : '';

  const text =
    `Merhaba Sayın *${lead.fullName}*,\n\n` +
    `*RVOBA®* (${orderRef}) sipariş/talep durumunuz güncellendi:\n` +
    `✅ ${statusLine}` +
    trackingBlock +
    noteBlock +
    `\n\nDetayları her zaman https://rvoba.com adresinden görüntüleyebilirsiniz.`;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
}
