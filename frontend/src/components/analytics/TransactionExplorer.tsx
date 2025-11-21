import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { format } from 'date-fns';

interface Transaction {
    id: string;
    type: 'mint' | 'transfer' | 'burn' | 'purchase';
    tokenId: string;
    serialNumber?: number;
    from?: string;
    to?: string;
    amount?: number;
    timestamp: Date;
    transactionId: string;
    status: 'pending' | 'confirmed' | 'failed';
}

const TransactionExplorer: React.FC = () => {
    const socket = useWebSocket();
    const [transactions, setTransactions] = useState<Transaction[]>([
        {
            id: '1',
            type: 'mint',
            tokenId: '0.0.12345',
            serialNumber: 1,
            timestamp: new Date(),
            transactionId: '0.0.12345@1234567890.123456789',
            status: 'confirmed',
        },
    ]);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        if (!socket) return;

        socket.on('transaction:new', (transaction: Transaction) => {
            setTransactions((prev) => [transaction, ...prev].slice(0, 50));
        });

        return () => {
            socket.off('transaction:new');
        };
    }, [socket]);

    const filteredTransactions =
        filter === 'all'
            ? transactions
            : transactions.filter((t) => t.type === filter);

    const getTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            mint: '🪙',
            transfer: '↔️',
            burn: '🔥',
            purchase: '💰',
        };
        return icons[type] || '📝';
    };

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            mint: 'bg-green-100 text-green-800',
            transfer: 'bg-blue-100 text-blue-800',
            burn: 'bg-red-100 text-red-800',
            purchase: 'bg-purple-100 text-purple-800',
        };

        return (
            <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[type] || 'bg-gray-100 text-gray-800'
                    }`}
            >
                {type.toUpperCase()}
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            confirmed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800',
        };

        return (
            <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'
                    }`}
            >
                {status}
            </span>
        );
    };

    const getHashScanUrl = (transactionId: string) => {
        return `https://hashscan.io/testnet/transaction/${transactionId}`;
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Transactions</h2>
                <div className="flex space-x-2">
                    {['all', 'mint', 'transfer', 'burn', 'purchase'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-3 py-1 text-sm rounded-md ${filter === type
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No transactions found
                    </div>
                ) : (
                    filteredTransactions.map((tx) => (
                        <div
                            key={tx.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <div className="text-3xl">{getTypeIcon(tx.type)}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            {getTypeBadge(tx.type)}
                                            {getStatusBadge(tx.status)}
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div>
                                                <span className="font-medium">Token:</span> {tx.tokenId}
                                                {tx.serialNumber && ` #${tx.serialNumber}`}
                                            </div>
                                            {tx.from && (
                                                <div>
                                                    <span className="font-medium">From:</span>{' '}
                                                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                                        {tx.from}
                                                    </code>
                                                </div>
                                            )}
                                            {tx.to && (
                                                <div>
                                                    <span className="font-medium">To:</span>{' '}
                                                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                                        {tx.to}
                                                    </code>
                                                </div>
                                            )}
                                            {tx.amount && (
                                                <div>
                                                    <span className="font-medium">Amount:</span> $
                                                    {tx.amount}
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium">Time:</span>{' '}
                                                {format(new Date(tx.timestamp), 'PPpp')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                    <a
                                        href={getHashScanUrl(tx.transactionId)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                    >
                                        View on HashScan
                                        <svg
                                            className="w-4 h-4 ml-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                            />
                                        </svg>
                                    </a>
                                    <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                        {tx.transactionId.slice(0, 20)}...
                                    </code>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {filteredTransactions.length > 0 && (
                <div className="mt-6 text-center">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Load More Transactions
                    </button>
                </div>
            )}
        </div>
    );
};

export default TransactionExplorer;
