import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
yahooFinance.quote('^VKOSPI')
  .then(res => console.log('Success:', res.regularMarketPrice))
  .catch(err => console.error('Error:', err.message));
