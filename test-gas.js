const { ethers } = require('ethers');
const { TokenTransfer } = require('./index.js');

async function testGasEstimation() {
    console.log('🧪 Testing Gas Estimation\n');
    
    try {
        const tokenTransfer = new TokenTransfer();
        
        // Get token info
        const tokenInfo = await tokenTransfer.getTokenInfo();
        console.log(`\nTesting with token: ${tokenInfo.name} (${tokenInfo.symbol})`);
        
        // Test gas estimation for different amounts
        const testAmounts = [0.1, 1, 10];
        
        for (const amount of testAmounts) {
            console.log(`\n--- Testing amount: ${amount} ${tokenInfo.symbol} ---`);
            
            try {
                const amountInWei = ethers.parseUnits(amount.toString(), tokenInfo.decimals);
                
                // Estimate gas
                const estimatedGas = await tokenTransfer.tokenContract.transfer.estimateGas(
                    process.env.RECIPIENT_ADDRESS, 
                    amountInWei
                );
                
                console.log(`Estimated gas: ${estimatedGas.toString()}`);
                console.log(`With 20% buffer: ${(estimatedGas * BigInt(120)) / BigInt(100)}`);
                
                // Get current gas price
                const feeData = await tokenTransfer.provider.getFeeData();
                const gasPrice = feeData.gasPrice;
                console.log(`Current gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
                
                // Calculate estimated cost
                const estimatedCost = estimatedGas * gasPrice;
                console.log(`Estimated cost: ${ethers.formatEther(estimatedCost)} ETH`);
                
            } catch (error) {
                console.error(`❌ Error estimating gas for ${amount}:`, error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

async function testSmallTransfer() {
    console.log('\n🚀 Testing Small Transfer\n');
    
    try {
        const tokenTransfer = new TokenTransfer();
        
        // Test with a very small amount first
        const testAmount = 0.001; // Very small amount
        
        console.log(`Testing transfer of ${testAmount} tokens...`);
        
        await tokenTransfer.transferTokens(process.env.RECIPIENT_ADDRESS, testAmount);
        
        console.log('✅ Small transfer test completed successfully!');
        
    } catch (error) {
        console.error('❌ Small transfer test failed:', error.message);
        
        if (error.message.includes('intrinsic gas too low')) {
            console.log('\n💡 Suggestions to fix gas issues:');
            console.log('1. Increase GAS_LIMIT in .env file to 300000 or higher');
            console.log('2. Try using a different RPC provider');
            console.log('3. Check if the token contract has any special requirements');
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    (async () => {
        await testGasEstimation();
        await testSmallTransfer();
        console.log('\n🔧 Gas testing completed!');
    })();
}

module.exports = { testGasEstimation, testSmallTransfer }; 