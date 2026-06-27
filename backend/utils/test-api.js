const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const makeRequest = (method, path, data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const payload = data ? JSON.stringify(data) : '';
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, rawBody: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(payload);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Starting Backend API Automated Verification tests...');
  let token = '';
  let customerId = '';
  let orderId = '';

  try {
    // 1. Health check
    console.log('\n🏥 Testing Health Check...');
    const health = await makeRequest('GET', '/health');
    if (health.status === 200 && health.body.status === 'online') {
      console.log('✅ Health Check passed!');
    } else {
      throw new Error(`Health Check failed: status=${health.status}`);
    }

    // 2. Auth: Register
    console.log('\n📝 Testing Auth: User Registration...');
    const randEmail = `tester-${Date.now()}@gmail.com`;
    const regRes = await makeRequest('POST', '/auth/register', {
      name: 'Test Customer',
      email: randEmail,
      password: 'testpassword123'
    });

    if (regRes.status === 201 && regRes.body.token) {
      console.log('✅ Registration passed!');
      token = regRes.body.token;
      customerId = regRes.body.id;
    } else {
      throw new Error(`Registration failed: status=${regRes.status} body=${JSON.stringify(regRes.body)}`);
    }

    // 3. Auth: Profile
    console.log('\n🧑 Testing Auth: Profile Retrieval...');
    const profRes = await makeRequest('GET', '/auth/profile', null, {
      Authorization: `Bearer ${token}`
    });

    if (profRes.status === 200 && profRes.body.email === randEmail) {
      console.log(`✅ Profile retrieved successfully for ${profRes.body.name}!`);
    } else {
      throw new Error(`Profile retrieval failed: status=${profRes.status}`);
    }

    // 4. Products: Browse menu
    console.log('\n🍰 Testing Products: Catalog Menu List...');
    const prodRes = await makeRequest('GET', '/products');
    if (prodRes.status === 200 && Array.isArray(prodRes.body)) {
      console.log(`✅ Catalog fetch passed! Found ${prodRes.body.length} products.`);
      // Pick first available product to place order
      const availableProduct = prodRes.body.find(p => p.available);
      
      if (!availableProduct) {
        throw new Error('No available products to perform checkout test.');
      }
      
      console.log(`👉 Selecting "${availableProduct.name}" (Price: ₹${availableProduct.price}) for checkout test.`);

      // 5. Orders: Place COD Order
      console.log('\n🛒 Testing Checkout: Placing COD Order...');
      const orderPayload = {
        customerName: 'Test Customer',
        customerPhone: '9876543210',
        customerAddress: '456 Test Lane, Test City',
        deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
        deliveryTime: '12:00 PM',
        specialNote: 'Leave at front desk',
        paymentMethod: 'COD',
        items: [
          {
            productId: availableProduct.id,
            quantity: 2
          }
        ]
      };

      const orderRes = await makeRequest('POST', '/orders', orderPayload, {
        Authorization: `Bearer ${token}`
      });

      if (orderRes.status === 201 && orderRes.body.id) {
        console.log(`✅ Order checkout passed! Created Order #${orderRes.body.id}`);
        orderId = orderRes.body.id;
      } else {
        throw new Error(`Order checkout failed: status=${orderRes.status} body=${JSON.stringify(orderRes.body)}`);
      }

      // 6. Orders: View tracking
      console.log('\n📋 Testing Order Tracking...');
      const trackRes = await makeRequest('GET', `/orders/${orderId}`);
      if (trackRes.status === 200 && trackRes.body.customerName === 'Test Customer') {
        console.log(`✅ Tracking details fetched successfully! Order Status: ${trackRes.body.orderStatus}`);
      } else {
        throw new Error(`Order tracking failed: status=${trackRes.status}`);
      }
    } else {
      throw new Error(`Catalog fetch failed: status=${prodRes.status}`);
    }

    console.log('\n🎉 ALL AUTOMATED BACKEND INTEGRATION TESTS PASSED!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ VERIFICATION TEST FAILED:', error.message);
    process.exit(1);
  }
};

runTests();
