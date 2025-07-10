const { ethers } = require('ethers');
require('dotenv').config();

// ERC-20 Token ABI (minimal for transfer function)
const ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

class TokenTransfer {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.tokenContract = null;
        this.tokenContractReadOnly = null;
        this.setupProvider();
    }

    setupProvider() {
        try {
            // Initialize provider
            this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
            console.log('Provider initialized successfully');
            
            // Initialize wallet
            this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
            console.log('Wallet initialized successfully');
            console.log(`Wallet address: ${this.wallet.address}`);
            
            // Initialize token contract
            this.tokenContract = new ethers.Contract(
                process.env.TOKEN_CONTRACT_ADDRESS,
                ERC20_ABI,
                this.wallet
            );

            // Initialize token contract without signer (for read-only operations)
            this.tokenContractReadOnly = new ethers.Contract(
                process.env.TOKEN_CONTRACT_ADDRESS,
                ERC20_ABI,
                this.provider
            );
            console.log('Token contract initialized successfully');
            
        } catch (error) {
            console.error('Error setting up provider:', error.message);
            process.exit(1);
        }
    }

    async getTokenInfo() {
        try {
            const [name, symbol, decimals] = await Promise.all([
                this.tokenContract.name(),
                this.tokenContract.symbol(),
                this.tokenContract.decimals()
            ]);
            
            return { name, symbol, decimals };
        } catch (error) {
            console.error('Error getting token info:', error.message);
            throw error;
        }
    }

    async getBalance(address = null) {
        try {
            const targetAddress = address || this.wallet.address;
            const balance = await this.tokenContract.balanceOf(targetAddress);
            const tokenInfo = await this.getTokenInfo();
            
            const formattedBalance = ethers.formatUnits(balance, tokenInfo.decimals);
            console.log(`\nBalance for ${targetAddress}:`);
            console.log(`${formattedBalance} ${tokenInfo.symbol}`);
            
            return { balance, formattedBalance, tokenInfo };
        } catch (error) {
            console.error('Error getting balance:', error.message);
            throw error;
        }
    }

    async transferTokens(toAddress, amount) {
        try {
            console.log('\nInitiating token transfer...');
            console.log(`From: ${this.wallet.address}`);
            console.log(`To: ${toAddress}`);
            console.log(`Amount: ${amount}`);
            
            // Get token info for proper formatting
            const tokenInfo = await this.getTokenInfo();
            
            // Convert amount to wei (considering token decimals)
            const amountInWei = ethers.parseUnits(amount.toString(), tokenInfo.decimals);

            console.log(`Amount in Wei: ${amountInWei}`);
            
            // Check balance before transfer
            const balance = await this.tokenContract.balanceOf(this.wallet.address);
            if (balance < amountInWei) {
                throw new Error('Insufficient token balance');
            }
            
            // Estimate gas for the transfer
            console.log('Estimating gas for transfer...');
            let estimatedGas;
            try {
                estimatedGas = await this.tokenContract.transfer.estimateGas(toAddress, amountInWei);
                console.log(`Estimated gas: ${estimatedGas.toString()}`);
            } catch (gasError) {
                console.log('Gas estimation failed, using fallback values...');
                estimatedGas = BigInt(150000); // Fallback gas limit for ERC-20 transfers
            }
            
            // Add buffer to estimated gas (20% buffer)
            const gasLimit = (estimatedGas * BigInt(120)) / BigInt(100);
            console.log(`Gas limit with buffer: ${gasLimit.toString()}`);
            
            // Get current gas price from network
            const feeData = await this.provider.getFeeData();
            const gasPrice = feeData.gasPrice || ethers.parseUnits(process.env.GAS_PRICE_GWEI || '20', 'gwei');
            console.log(`Gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
            
            // Prepare transaction with proper gas estimation
            const tx = await this.tokenContract.transfer(toAddress, amountInWei, {
                gasLimit: gasLimit,
                gasPrice: gasPrice
            });
            
            console.log(`\nTransaction hash: ${tx.hash}`);
            console.log('Waiting for transaction confirmation...');
            
            // Wait for transaction confirmation
            const receipt = await tx.wait(2);
            
            console.log('Transaction confirmed!');
            console.log(`Block number: ${receipt.blockNumber}`);
            console.log(`Gas used: ${receipt.gasUsed.toString()}`);
            if (receipt.gasLimit) {
                console.log(`Gas limit: ${receipt.gasLimit.toString()}`);
            }
            
            return receipt;
            
        } catch (error) {
            console.error('Error transferring tokens:', error.message);
            
            // Provide more specific error information
            if (error.message.includes('intrinsic gas too low')) {
                console.error('\nGas Issue Detected!');
                console.error('This usually means the token contract requires more gas than estimated.');
                console.error('Try increasing the GAS_LIMIT in your .env file or use a higher value.');
            } else if (error.message.includes('insufficient funds')) {
                console.error('\nInsufficient Funds!');
                console.error('Make sure you have enough ETH for gas fees.');
            }
            
            throw error;
        }
    }

    async getNetworkInfo() {
        try {
            const network = await this.provider.getNetwork();
            const blockNumber = await this.provider.getBlockNumber();
            const gasPrice = await this.provider.getFeeData();
            
            console.log('\nNetwork Information:');
            console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
            console.log(`Current block: ${blockNumber}`);
            console.log(`Gas price: ${ethers.formatUnits(gasPrice.gasPrice, 'gwei')} gwei`);
            
            return { network, blockNumber, gasPrice };
        } catch (error) {
            console.error('Error getting network info:', error.message);
            throw error;
        }
    }

    async getTransferEvents(_blockNumber) {
        try {
            console.log(`\nQuerying Transfer events from block ${_blockNumber} to latest...`);
            
            // Create filter for Transfer events using read-only contract
            const filter = this.tokenContractReadOnly.filters.Transfer(null, process.env.LATAMEX_ADDRESS, null);
            
            // Query events from the specified block to latest
            const events = await this.tokenContractReadOnly.queryFilter(filter, _blockNumber, "latest");
            
            console.log(`Found ${events.length} Transfer events:`);
            
            if (events.length > 0) {
                // Get token info once for all events
                const tokenInfo = await this.getTokenInfo();
                
                for (let i = 0; i < events.length; i++) {
                    const event = events[i];
                    const { from, to, value } = event.args;
                    const formattedValue = ethers.formatUnits(value, tokenInfo.decimals);
                    
                    console.log(`\nEvent ${i + 1}:`);
                    console.log(`  From: ${from}`);
                    console.log(`  To: ${to}`);
                    console.log(`  Value: ${formattedValue} ${tokenInfo.symbol}`);
                    console.log(`  Block: ${event.blockNumber}`);
                    console.log(`  Transaction: ${event.transactionHash}`);
                }
            } else {
                console.log('No Transfer events found in the specified block range.');
            }
            
            return events;
            
        } catch (error) {
            console.error('Error querying transfer events:', error.message);
            throw error;
        }
    }
}

// Main execution function
async function main() {
    try {
        console.log('Starting Token Transfer Application\n');
        
        // Validate environment variables
        const requiredEnvVars = ['RPC_URL', 'PRIVATE_KEY', 'TOKEN_CONTRACT_ADDRESS', 'LATAMEX_ADDRESS'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName] || process.env[varName].includes('YOUR_') || process.env[varName].includes('your_'));
        
        if (missingVars.length > 0) {
            console.error('Missing or invalid environment variables:');
            missingVars.forEach(varName => console.error(`   - ${varName}`));
            console.error('\nPlease update your .env file with valid values.');
            process.exit(1);
        }
        
        // Initialize token transfer instance
        const tokenTransfer = new TokenTransfer();
        
        // Get network information
        const info = await tokenTransfer.getNetworkInfo();
               
        // Get sender's balance
        await tokenTransfer.getBalance();
        
        // Get recipient's balance (if different from sender)
        if (process.env.LATAMEX_ADDRESS !== tokenTransfer.wallet.address) {
            await tokenTransfer.getBalance(process.env.LATAMEX_ADDRESS);
        }
        
        // Example transfer (you can modify the amount as needed)
        const transferAmount = 1; // Transfer 1 token
        await tokenTransfer.transferTokens(process.env.LATAMEX_ADDRESS, transferAmount);

        await tokenTransfer.transferTokens("0x2B384EB79D60A07E6bDf39893378DbE59236bcEE", 2 * transferAmount);

        await tokenTransfer.transferTokens(process.env.LATAMEX_ADDRESS, 3 * transferAmount);
        
        // Show updated balances
        console.log('\nUpdated Balances:');
        await tokenTransfer.getBalance();
        await tokenTransfer.getBalance(process.env.LATAMEX_ADDRESS);

        await tokenTransfer.getTransferEvents(info.blockNumber);
        
    } catch (error) {
        console.error('Application error:', error.message);
        process.exit(1);
    }
}

// Export for use in other modules
module.exports = { TokenTransfer, ERC20_ABI };

// Run the application if this file is executed directly
if (require.main === module) {
    main();
} 