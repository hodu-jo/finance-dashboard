import { YahooFinance } from 'yahoo-finance2';

(async () => {
    try {
        const yf = new YahooFinance();
        const res = await yf.quote('TSLA');
        console.log(res);
    } catch (e) {
        console.error(e);
    }
})();
