// Quick test script to diagnose the menu import issue
// Run with: node test-api.js

const API_URL = 'http://localhost:3000/api/admin/menu';

async function testAPI() {
    console.log('🔍 Testing Menu API at:', API_URL);
    console.log('');

    try {
        // Test GET request
        console.log('📥 Testing GET /api/admin/menu...');
        const getResponse = await fetch(API_URL);
        console.log('Status:', getResponse.status, getResponse.statusText);

        if (getResponse.ok) {
            const data = await getResponse.json();
            console.log('✅ GET Success! Menu items count:', data.length);
            console.log('');
        } else {
            const errorText = await getResponse.text();
            console.log('❌ GET Failed!');
            console.log('Error:', errorText);
            console.log('');
        }

        // Test POST request (create a test item)
        console.log('📤 Testing POST /api/admin/menu...');
        const testItem = {
            name: 'Test Item',
            description: 'This is a test',
            price: 100,
            category: 'fish',
            image_url: '/test.png',
            is_available: true
        };

        const postResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testItem)
        });

        console.log('Status:', postResponse.status, postResponse.statusText);

        if (postResponse.ok) {
            const data = await postResponse.json();
            console.log('✅ POST Success! Created item:', data.name);
            console.log('Item ID:', data.id);
            console.log('');

            // Clean up - delete the test item
            console.log('🗑️  Cleaning up test item...');
            const deleteResponse = await fetch(`${API_URL}/${data.id}`, {
                method: 'DELETE'
            });
            if (deleteResponse.ok) {
                console.log('✅ Cleanup successful');
            }
        } else {
            const errorData = await postResponse.json();
            console.log('❌ POST Failed!');
            console.log('Error:', errorData);
            console.log('');
        }

    } catch (error) {
        console.log('');
        console.log('💥 CRITICAL ERROR:');
        console.log('Error Type:', error.constructor.name);
        console.log('Error Message:', error.message);
        console.log('');
        console.log('This usually means:');
        console.log('1. The server is not running (run: npm run dev)');
        console.log('2. Network/firewall issue');
        console.log('3. CORS issue (less likely for localhost)');
    }
}

testAPI();
