const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

async function run() {
    await getAuth().setCustomUserClaims(
        'mdU6tnjlO9UAHgazo9M2JIaZg3W2',
        { role: 'admin' }
    );

    await getAuth().setCustomUserClaims(
        'byQKO1k3zMcFOrUw6puZy96VKff1',
        { role: 'barber' }
    );

    console.log('Roles assigned successfully');
}

run().catch(console.error);