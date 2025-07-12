const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...\n');

  try {
    // Test 1: Register a user
    console.log('1️⃣ Testing user registration...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'password123',
      displayName: 'Test User 2'
    });

    console.log('✅ Registration successful');
    console.log('User:', registerResponse.data.user.displayName);
    console.log('User ID:', registerResponse.data.user.id);
    console.log('Access Token:', registerResponse.data.accessToken.substring(0, 50) + '...\n');

    const accessToken = registerResponse.data.accessToken;

    // Test 2: Test /auth/me endpoint
    console.log('2️⃣ Testing /auth/me endpoint...');
    const meResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('✅ /auth/me successful');
    console.log('User data:', meResponse.data);
    console.log('User ID from /me:', meResponse.data.id);
    console.log('Display Name:', meResponse.data.displayName, '\n');

    // Test 3: Test protected route
    console.log('3️⃣ Testing protected route...');
    const protectedResponse = await axios.get(`${API_BASE}/api/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('✅ Protected route successful');
    console.log('Protected route data:', protectedResponse.data, '\n');

    // Test 4: Test debug endpoint
    console.log('4️⃣ Testing debug endpoint...');
    const debugResponse = await axios.get(`${API_BASE}/auth/debug`);
    console.log('✅ Debug endpoint successful');
    console.log('Debug data:', debugResponse.data, '\n');

    console.log('🎉 Authentication flow is working correctly!');
    console.log('✅ Registration ✅ /auth/me ✅ Protected Routes ✅ Debug Endpoint');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

testAuthFlow(); 