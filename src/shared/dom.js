export function escapeHTML(value){
  return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
}
export function won(amount){return new Intl.NumberFormat('ko-KR').format(amount)+'원';}
