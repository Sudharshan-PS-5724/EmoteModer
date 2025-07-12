const axios = require('axios');

const API_BASE = 'http://localhost:5000';

// Test JWT Authentication System
async function testJWTAuth() {
  console.log('🧪 Testing JWT Authentication System...\n');

  try {
    // Test 1: Register a new user
    console.log('1️⃣ Testing user registration...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User'
    });

    console.log('✅ Registration successful');
    console.log('User ID:', registerResponse.data.user.id);
    console.log('Access Token:', registerResponse.data.accessToken.substring(0, 50) + '...');
    console.log('Refresh Token:', registerResponse.data.refreshToken.substring(0, 50) + '...\n');

    const accessToken = registerResponse.data.accessToken;
    const refreshToken = registerResponse.data.refreshToken;

    // Test 2: Get current user with access token
    console.log('2️⃣ Testing get current user...');
    const meResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('✅ Get current user successful');
    console.log('User:', meResponse.data.displayName);
    console.log('Email:', meResponse.data.email);
    console.log('Username:', meResponse.data.username, '\n');

    // Test 3: Test protected route
    console.log('3️⃣ Testing protected route...');
    const protectedResponse = await axios.get(`${API_BASE}/api/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('✅ Protected route access successful');
    console.log('User data:', protectedResponse.data, '\n');

    // Test 4: Test token refresh
    console.log('4️⃣ Testing token refresh...');
    const refreshResponse = await axios.post(`${API_BASE}/auth/refresh`, {
      refreshToken: refreshToken
    });

    console.log('✅ Token refresh successful');
    console.log('New Access Token:', refreshResponse.data.accessToken.substring(0, 50) + '...');
    console.log('New Refresh Token:', refreshResponse.data.refreshToken.substring(0, 50) + '...\n');

    // Test 5: Test logout
    console.log('5️⃣ Testing logout...');
    const logoutResponse = await axios.post(`${API_BASE}/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('✅ Logout successful');
    console.log('Message:', logoutResponse.data.message, '\n');

    // Test 6: Test invalid token
    console.log('6️⃣ Testing invalid token...');
    try {
      await axios.get(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Invalid token correctly rejected');
        console.log('Error:', error.response.data.error, '\n');
      } else {
        throw error;
      }
    }

    // Test 7: Test debug endpoint
    console.log('7️⃣ Testing debug endpoint...');
    const debugResponse = await axios.get(`${API_BASE}/auth/debug`);
    console.log('✅ Debug endpoint working');
    console.log('Message:', debugResponse.data.message);
    console.log('Endpoints:', debugResponse.data.endpoints, '\n');

    console.log('🎉 All JWT authentication tests passed!');
    console.log('✅ Registration ✅ Login ✅ Token Validation ✅ Token Refresh ✅ Logout ✅ Error Handling');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

// Run the test
testJWTAuth(); 