const { TokenTransfer } = require('./index.js');

// Example usage scenarios
async function examples() {
    console.log('🔧 Token Transfer Examples\n');
    
    try {
        const tokenTransfer = new TokenTransfer();
        
        // Example 1: Get network information
        console.log('=== Example 1: Network Information ===');
        await tokenTransfer.getNetworkInfo();
        
        // Example 2: Get token information
        console.log('\n=== Example 2: Token Information ===');
        await tokenTransfer.getTokenInfo();
        
        // Example 3: Check balances
        console.log('\n=== Example 3: Balance Check ===');
        await tokenTransfer.getBalance();
        
        // Example 4: Transfer tokens (commented out for safety)
        console.log('\n=== Example 4: Token Transfer (Commented for Safety) ===');
        console.log('// Uncomment the following lines to perform actual transfers:');
        console.log('// await tokenTransfer.transferTokens(process.env.LATAMEX_ADDRESS, 0.1);');
        
        // Example 5: Batch operations
        console.log('\n=== Example 5: Batch Operations ===');
        await Promise.all([
            tokenTransfer.getNetworkInfo(),
            tokenTransfer.getTokenInfo(),
            tokenTransfer.getBalance()
        ]);
        
    } catch (error) {
        console.error('❌ Example error:', error.message);
    }
}

// Example with custom configuration
async function customExample() {
    console.log('\n🔧 Custom Configuration Example\n');
    
    try {
        // You can create multiple instances with different configurations
        const tokenTransfer = new TokenTransfer();
        
        // Custom transfer amount
        const customAmount = 0.5;
        const customRecipient = process.env.LATAMEX_ADDRESS;
        
        console.log(`Preparing to transfer ${customAmount} tokens to ${customRecipient}`);
        
        // Check if we have enough balance
        const balanceInfo = await tokenTransfer.getBalance();
        const tokenInfo = await tokenTransfer.getTokenInfo();
        
        const amountInWei = ethers.parseUnits(customAmount.toString(), tokenInfo.decimals);
        
        if (balanceInfo.balance >= amountInWei) {
            console.log('✅ Sufficient balance for transfer');
            // Uncomment to perform actual transfer:
            // await tokenTransfer.transferTokens(customRecipient, customAmount);
        } else {
            console.log('❌ Insufficient balance for transfer');
        }
        
    } catch (error) {
        console.error('❌ Custom example error:', error.message);
    }
}

// Error handling example
async function errorHandlingExample() {
    console.log('\n🔧 Error Handling Example\n');
    
    try {
        // This will fail if environment variables are not set correctly
        const tokenTransfer = new TokenTransfer();
        
        // Try to get balance of an invalid address
        try {
            await tokenTransfer.getBalance('0xInvalidAddress');
        } catch (error) {
            console.log('✅ Caught expected error for invalid address:', error.message);
        }
        
    } catch (error) {
        console.log('✅ Caught configuration error:', error.message);
    }
}

// Run examples if this file is executed directly
if (require.main === module) {
    (async () => {
        await examples();
        await customExample();
        await errorHandlingExample();
        console.log('\n✅ Examples completed!');
    })();
}

module.exports = { examples, customExample, errorHandlingExample }; 