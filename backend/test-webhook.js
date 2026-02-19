
const axios = require('axios');

async function testWebhook() {
    try {
        const payload = {
            type: 'INSERT',
            record: {
                id: 'test-user-id-123',
                email: 'test@example.com',
                raw_user_meta_data: {
                    name: 'Test Agent User',
                    avatar_url: 'https://example.com/avatar.png'
                }
            }
        };

        console.log('Sending webhook...');
        const res = await axios.post('http://localhost:3000/auth/sync', payload, {
            headers: {
                'x-supabase-signature': 'fake-sig'
            }
        });
        console.log('Response:', res.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

// Wait for server to start
setTimeout(testWebhook, 5000);
