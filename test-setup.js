const { ethers } = require('ethers');
require('dotenv').config();

console.log('🧪 Testing Project Setup\n');

// Test 1: Check if ethers.js is working
console.log('=== Test 1: Ethers.js Import ===');
try {
    console.log('✅ Ethers.js version:', ethers.version);
    console.log('✅ Ethers.js imported successfully');
} catch (error) {
    console.error('❌ Ethers.js import failed:', error.message);
}

// Test 2: Check environment variables
console.log('\n=== Test 2: Environment Variables ===');
const requiredVars = ['RPC_URL', 'PRIVATE_KEY', 'TOKEN_CONTRACT_ADDRESS', 'RECIPIENT_ADDRESS'];
let envTestPassed = true;

requiredVars.forEach(varName => {
    if (process.env[varName]) {
        if (process.env[varName].includes('YOUR_') || process.env[varName].includes('your_')) {
            console.log(`⚠️  ${varName}: Set but contains placeholder value`);
            envTestPassed = false;
        } else {
            console.log(`✅ ${varName}: Set`);
        }
    } else {
        console.log(`❌ ${varName}: Not set`);
        envTestPassed = false;
    }
});

// Test 3: Validate Ethereum addresses
console.log('\n=== Test 3: Address Validation ===');
try {
    if (process.env.TOKEN_CONTRACT_ADDRESS && !process.env.TOKEN_CONTRACT_ADDRESS.includes('YOUR_')) {
        const isValidContract = ethers.isAddress(process.env.TOKEN_CONTRACT_ADDRESS);
        console.log(`✅ Token contract address validation: ${isValidContract ? 'Valid' : 'Invalid'}`);
    }
    
    if (process.env.RECIPIENT_ADDRESS && !process.env.RECIPIENT_ADDRESS.includes('YOUR_')) {
        const isValidRecipient = ethers.isAddress(process.env.RECIPIENT_ADDRESS);
        console.log(`✅ Recipient address validation: ${isValidRecipient ? 'Valid' : 'Invalid'}`);
    }
} catch (error) {
    console.error('❌ Address validation error:', error.message);
}

// Test 4: Test private key format
console.log('\n=== Test 4: Private Key Format ===');
try {
    if (process.env.PRIVATE_KEY && !process.env.PRIVATE_KEY.includes('your_')) {
        // Check if private key is valid hex
        const isValidHex = /^0x[a-fA-F0-9]{64}$/.test(process.env.PRIVATE_KEY);
        console.log(`✅ Private key format: ${isValidHex ? 'Valid' : 'Invalid'}`);
        
        if (isValidHex) {
            const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
            console.log(`✅ Wallet address: ${wallet.address}`);
        }
    } else {
        console.log('⚠️  Private key: Using placeholder value');
    }
} catch (error) {
    console.error('❌ Private key validation error:', error.message);
}

// Test 5: Test RPC URL format
console.log('\n=== Test 5: RPC URL Format ===');
try {
    if (process.env.RPC_URL && !process.env.RPC_URL.includes('YOUR_')) {
        const url = new URL(process.env.RPC_URL);
        console.log(`✅ RPC URL format: Valid (${url.protocol}//${url.hostname})`);
    } else {
        console.log('⚠️  RPC URL: Using placeholder value');
    }
} catch (error) {
    console.error('❌ RPC URL validation error:', error.message);
}

// Summary
console.log('\n=== Setup Test Summary ===');
if (envTestPassed) {
    console.log('✅ All basic tests passed!');
    console.log('📝 Next steps:');
    console.log('   1. Update your .env file with real values');
    console.log('   2. Run: npm start');
    console.log('   3. Or run: node example.js for examples');
} else {
    console.log('⚠️  Some tests failed. Please update your .env file with valid values.');
    console.log('📝 Required updates:');
    console.log('   - Set a valid RPC_URL (Infura, Alchemy, etc.)');
    console.log('   - Set your private key (without 0x prefix)');
    console.log('   - Set a valid token contract address');
    console.log('   - Set a valid recipient address');
}

console.log('\n🔧 Project setup test completed!'); 