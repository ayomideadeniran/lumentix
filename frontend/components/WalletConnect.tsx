'use client';

import { useWallet } from '@/contexts/WalletContext';
import { WalletType } from '@/types/wallet';

export function WalletConnect() {
  const { 
    isConnected, 
    publicKey, 
    balance, 
    isLoading, 
    error, 
    connect, 
    disconnect,
    switchNetwork,
    network,
    walletType
  } = useWallet();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Connecting...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={() => connect(WalletType.FREIGHTER)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Connect Freighter
          </button>
          <button
            onClick={() => connect(WalletType.LOBSTR)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            Connect LOBSTR
          </button>
        </div>
        <span className="text-sm text-red-600">{error}</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Connect Wallet</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => connect(WalletType.FREIGHTER)}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">F</span>
            </div>
            <span className="font-medium">Freighter</span>
          </button>
          <button
            onClick={() => connect(WalletType.LOBSTR)}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
          >
            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
              <span className="text-xs font-bold text-purple-600">L</span>
            </div>
            <span className="font-medium">LOBSTR</span>
          </button>
        </div>
        <div className="text-xs text-gray-500">
          <p>Connect your Stellar wallet to interact with LumenTix.</p>
          <p className="mt-1">Supported wallets: Freighter, LOBSTR (coming soon)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">Connected</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-green-600 font-mono truncate max-w-[150px]">
                {publicKey}
              </span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                {walletType === WalletType.FREIGHTER ? 'Freighter' : 'LOBSTR'}
              </span>
            </div>
          </div>
          <button
            onClick={disconnect}
            className="text-xs text-red-600 hover:text-red-800 transition-colors font-medium"
          >
            Disconnect
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Balance</p>
            <p className="text-lg font-bold text-gray-900">
              {balance ? `${parseFloat(balance).toFixed(7)} XLM` : 'Loading...'}
            </p>
          </div>
          <button
            onClick={() => {
              if (publicKey) {
                // In a real implementation, this would fetch the balance
                // For now, we'll just show a loading state
              }
            }}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-800">Network</p>
            <p className="text-sm text-blue-600 capitalize">
              {network === 'testnet' ? 'Testnet' : 'Mainnet'}
            </p>
          </div>
          <button
            onClick={() => switchNetwork(network === 'testnet' ? 'mainnet' : 'testnet')}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            Switch
          </button>
        </div>
      </div>
    </div>
  );
}
