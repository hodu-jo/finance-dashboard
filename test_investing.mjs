async function test() {
  const res = await fetch('https://kr.investing.com/indices/kospi-volatility', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' }
  });
  console.log('Status:', res.status);
  const text = await res.text();
  const match = text.match(/data-test="instrument-price-last">([\d.]+)</);
  console.log('Price Match:', match ? match[1] : 'Not Found');
}
test();
