import yahooFinance from 'yahoo-finance2';
async function test() {
  try {
    const quote = await yahooFinance.quote('^VKOSPI');
    console.log('Success:', quote.regularMarketPrice);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
