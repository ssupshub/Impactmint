import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

export const useWebSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const newSocket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000', {
            auth: { token },
        });

        newSocket.on('connect', () => {
            console.log('WebSocket connected');
        });

        newSocket.on('analytics:update', (data) => {
            // Invalidate queries to refetch data
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        });

        newSocket.on('credit:minted', (data) => {
            queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] });
        });

        newSocket.on('credit:retired', (data) => {
            queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] });
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [queryClient]);

    return socket;
};