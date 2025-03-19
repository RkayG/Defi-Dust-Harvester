// Ethereum provider event types
interface EthereumProviderEvents {
    // Common Ethereum provider events
    'chainChanged': (chainId: string) => void;
    'accountsChanged': (accounts: string[]) => void;
    'connect': (connectInfo: { chainId: string }) => void;
    'disconnect': (error: { code: number; message: string }) => void;
  }
  
  // Binance Chain Wallet provider event types
  interface BinanceChainProviderEvents {
    // Binance Chain specific events
    'chainChanged': (chainId: string) => void;
    'accountsChanged': (accounts: string[]) => void;
    'connect': (connectInfo: { chainId: string }) => void;
    'disconnect': (error: { code: number; message: string }) => void;
  }
  
  // Extended Window interface with Ethereum and Binance Chain providers
  interface Window {
    // Ethereum provider
    ethereum?: {
      // Method to make requests to the Ethereum provider
      request: (request: { 
        method: string; 
        params?: any[] 
      }) => Promise<any>;
  
      // Event listener methods
      on<K extends keyof EthereumProviderEvents>(
        eventName: K, 
        listener: EthereumProviderEvents[K]
      ): void;
  
      removeListener<K extends keyof EthereumProviderEvents>(
        eventName: K, 
        listener: EthereumProviderEvents[K]
      ): void;
    }
  
    // Binance Chain Wallet provider
    BinanceChain?: {
      // Method to make requests to the Binance Chain provider
      request: (request: { 
        method: string; 
        params?: any[] 
      }) => Promise<any>;
  
      // Event listener methods
      on<K extends keyof BinanceChainProviderEvents>(
        eventName: K, 
        listener: BinanceChainProviderEvents[K]
      ): void;
  
      removeListener<K extends keyof BinanceChainProviderEvents>(
        eventName: K, 
        listener: BinanceChainProviderEvents[K]
      ): void;
    }
  }