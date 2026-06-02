async function testLiveApi() {
  try {
    const res = await fetch('https://bill-payment-app-lovat.vercel.app/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from_currency: 'NGN',
        amount: 2000,
        exchange_rate: 1215,
        fees: 500
      })
    });
    
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

testLiveApi();
