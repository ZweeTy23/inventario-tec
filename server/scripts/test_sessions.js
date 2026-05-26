(async () => {
  try {
    const base = 'http://localhost:3000';
    const registerResp = await fetch(base + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'E2E Tester', email: 'e2e.tester@example.local', password: 'Test1234' })
    });
    console.log('register status', registerResp.status);
    console.log(await registerResp.text());

    const loginResp = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'e2e.tester@example.local', password: 'Test1234' })
    });
    console.log('login status', loginResp.status);
    const loginJson = await loginResp.json().catch(() => null);
    console.log('login json', loginJson);
  } catch (err) {
    console.error('test failed', err);
    process.exit(1);
  }
})();
