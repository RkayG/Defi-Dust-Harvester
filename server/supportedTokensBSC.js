const supportedTokens = [
    // ========= test tokens ====================
    '0x7a85f7Baa8E96aCfD2c2F1d91994a6E3454731b0',  
    '0x27e5572b88Ad646F03b73c22a493FbE6E1ac6C9f', 
    '0x372C154c85bC1eb86fb7b9A2867FA2E5C0231234',
    '0x3d3AA16B118a9e805432C0C76Fa8b7FA77CA342e',
    '0x7a734F8dA179715Deda4845c604c1D3790aF98F7',
    '0x957659ae6D5c171558a3d70f265C200759a41268',
    '0x79790B2020bd13712d78Eb9091eaB1AFF681F5A5',
    // ==========================================
    "0x55d398326f99059ff775485246999027b3197955",  // Binance-Peg BSC-USD (BSC-USD)
    "0xe9e7cea3dedca5984780bafc599bd69add087d56",  // Binance-Peg BUSD Token (BUSD)
    "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",  // Wrapped BNB (WBNB)
    "0x2170ed0880ac9a755fd29b2688956bd959f933f8",  // Binance-Peg Ethereum Token (ETH)
    "0xc748673057861a797275cd8a068abb95a902e8de",  // Baby Doge Coin (BabyDoge)
    "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",  // PancakeSwap Token (CAKE)
    "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",  // Binance-Peg USD Coin (USDC)
    "0xa58950f05fea2277d2608748412bf9f802ea4901",  // Wall Street Games (WSG)
    "0x285b2e8e8d7e1e4e7b7e4e7b7e4e7b7e4e7b7e4e",  // Binance-Peg SHIBA INU Token (SHIB)
    "0x7130d2a12b9bcfaae4f2634d864a1ee1ce3ead9c",  // Binance-Peg BTCB Token (BTCB)
    "0xba2ae424d960c26247dd6c32edc70b295c744c43",  // Binance-Peg Dogecoin Token (DOGE)
    "0x5ca42204cdaa70d5c773946e69de942b85ca6706",  // Position Token (POSI)
    "0x31471e0791f3c2d5f75c3a0d5a4f3b6e5b5e6f5e",  // Plant vs Undead Token (PVU)
    "0x42981d0bfbaf196529376ee702f2a9eb9092fcb5",  // SafeMoon (SFM)
    "0x3ee2200efb3400fabb9aacf31297cbdd1d435d47",  // Binance-Peg Cardano Token (ADA)
    "0x1f3af095cd0a1ddc2e6e6c5b7e6e6c5b7e6e6c5b",  // Pitbull (PIT)
    "0x2f141ce366a2462f02cea3d12cf93e4dca49e4fd",  // FREE coin BSC (FREE)
    "0x3ad9594151886ce8538c1ff615efa2385a8c3a88",  // SafeMars (SAFEMARS)
    "0xf7844cb890f4c339c497aeab599abdc3c874b67a",  // NFTArt.Finance (NFTART)
    "0x12bb890508c125661e03b09ec06e404bc9289040",  // Radio Caca V2 (RACA)
];

const giveTokens = function() {
    return supportedTokens;
}

exports.supportedTokens = supportedTokens;