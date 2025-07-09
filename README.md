# Token Transfer with Ethers.js

A JavaScript project for transferring ERC-20 tokens on Ethereum blockchain using ethers.js library.

## Features

- 🔐 Secure wallet management with private key
- 💰 Token balance checking
- 🚀 Token transfers with gas optimization
- 📊 Network information display
- 🛡️ Error handling and validation
- 🔧 Configurable gas settings

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- An Ethereum wallet with some ETH for gas fees
- Access to an Ethereum RPC provider (Infura, Alchemy, etc.)

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Copy the `.env` file and update it with your values:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual values:

   ```env
   # Ethereum Network Configuration
   RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
   
   # Wallet Configuration
   PRIVATE_KEY=your_private_key_here
   
   # Token Configuration
   TOKEN_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
   
   # Gas Configuration (optional)
   GAS_LIMIT=100000
   GAS_PRICE_GWEI=20
   
   # Recipient Address
   RECIPIENT_ADDRESS=0x9876543210987654321098765432109876543210
   ```

### Getting Required Values

#### RPC URL
- **Infura**: Sign up at [infura.io](https://infura.io) and create a project
- **Alchemy**: Sign up at [alchemy.com](https://alchemy.com) and create an app
- **QuickNode**: Sign up at [quicknode.com](https://quicknode.com)

#### Private Key
⚠️ **SECURITY WARNING**: Never share your private key or commit it to version control!

- Export from MetaMask: Settings → Security & Privacy → Export Private Key
- Or use a hardware wallet with proper integration

#### Token Contract Address
- Find the token contract address on [Etherscan](https://etherscan.io)
- For testnet tokens, use the appropriate testnet explorer

## Usage

### Basic Token Transfer

Run the main application:
```bash
npm start
```

This will:
1. Connect to the Ethereum network
2. Display network information
3. Show token details
4. Display current balances
5. Execute a token transfer
6. Show updated balances

### Development Mode

Run with auto-restart on file changes:
```bash
npm run dev
```

### Programmatic Usage

You can also use the `TokenTransfer` class in your own code:

```javascript
const { TokenTransfer } = require('./index.js');

async function customTransfer() {
    const tokenTransfer = new TokenTransfer();
    
    // Get token information
    await tokenTransfer.getTokenInfo();
    
    // Check balance
    await tokenTransfer.getBalance();
    
    // Transfer tokens
    await tokenTransfer.transferTokens('0x...', 10);
}
```

## Supported Networks

- Ethereum Mainnet
- Ethereum Testnets (Goerli, Sepolia)
- Polygon
- BSC
- Any EVM-compatible blockchain

## Gas Optimization

The application includes gas optimization features:

- **Gas Limit**: Configurable via `GAS_LIMIT` in `.env`
- **Gas Price**: Configurable via `GAS_PRICE_GWEI` in `.env`
- **Dynamic Gas**: Can be modified to use dynamic gas pricing

## Error Handling

The application includes comprehensive error handling for:

- Invalid private keys
- Insufficient balances
- Network connectivity issues
- Contract interaction errors
- Gas estimation failures

## Security Best Practices

1. **Never commit private keys** to version control
2. **Use environment variables** for sensitive data
3. **Test on testnets** before mainnet
4. **Verify contract addresses** before transfers
5. **Double-check recipient addresses**
6. **Use hardware wallets** for large amounts

## Troubleshooting

### Common Issues

1. **"Invalid private key"**
   - Ensure your private key is correct and includes the `0x` prefix
   - Check for extra spaces or characters

2. **"Insufficient balance"**
   - Verify you have enough tokens to transfer
   - Ensure you have enough ETH for gas fees

3. **"Network error"**
   - Check your RPC URL is correct
   - Verify your internet connection
   - Try a different RPC provider

4. **"Contract not found"**
   - Verify the token contract address is correct
   - Ensure the contract exists on the specified network

### Getting Help

- Check the console output for detailed error messages
- Verify all environment variables are set correctly
- Test with small amounts first

## License

MIT License - feel free to use this project for your own purposes.

## Disclaimer

This software is provided "as is" without warranty. Use at your own risk. Always test thoroughly on testnets before using on mainnet. 