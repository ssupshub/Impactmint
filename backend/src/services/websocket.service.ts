import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import config from '../config/env';
import { JWTPayload } from '../types';

export class WebSocketService {
  private static io: SocketIOServer;
  private static userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  /**
   * Initialize WebSocket server
   * @param httpServer HTTP server instance
   */
  static initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.corsOrigin,
        credentials: true,
      },
      path: '/socket.io',
    });

    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
        (socket as any).userId = decoded.userId;
        (socket as any).role = decoded.role;
        next();
      } catch (error) {
        return next(new Error('Invalid token'));
      }
    });

    // Connection handler
    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      logger.info('WebSocket client connected', { userId, socketId: socket.id });

      // Track user's socket connections
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      // Join user's personal room
      socket.join(`user:${userId}`);

      // Join role-based rooms
      const role = (socket as any).role;
      socket.join(`role:${role}`);

      // Handle project subscription
      socket.on('subscribe:project', (projectId: string) => {
        socket.join(`project:${projectId}`);
        logger.info('Client subscribed to project', { userId, projectId });
      });

      // Handle marketplace subscription
      socket.on('subscribe:marketplace', () => {
        socket.join('marketplace');
        logger.info('Client subscribed to marketplace', { userId });
      });

      // Handle transaction subscription
      socket.on('subscribe:transactions', () => {
        socket.join(`transactions:${userId}`);
        logger.info('Client subscribed to transactions', { userId });
      });

      // Handle unsubscribe
      socket.on('unsubscribe:project', (projectId: string) => {
        socket.leave(`project:${projectId}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info('WebSocket client disconnected', { userId, socketId: socket.id });

        const userSocketSet = this.userSockets.get(userId);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (userSocketSet.size === 0) {
            this.userSockets.delete(userId);
          }
        }
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error('WebSocket error', { userId, error });
      });
    });

    logger.info('WebSocket service initialized');
  }

  /**
   * Emit event to specific user
   * @param userId User ID
   * @param event Event name
   * @param data Event data
   */
  static emitToUser(userId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
      logger.debug('Emitted event to user', { userId, event });
    }
  }

  /**
   * Emit event to specific role
   * @param role User role
   * @param event Event name
   * @param data Event data
   */
  static emitToRole(role: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`role:${role}`).emit(event, data);
      logger.debug('Emitted event to role', { role, event });
    }
  }

  /**
   * Emit event to project subscribers
   * @param projectId Project ID
   * @param event Event name
   * @param data Event data
   */
  static emitToProject(projectId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`project:${projectId}`).emit(event, data);
      logger.debug('Emitted event to project', { projectId, event });
    }
  }

  /**
   * Emit event to marketplace subscribers
   * @param event Event name
   * @param data Event data
   */
  static emitToMarketplace(event: string, data: any): void {
    if (this.io) {
      this.io.to('marketplace').emit(event, data);
      logger.debug('Emitted event to marketplace', { event });
    }
  }

  /**
   * Emit transaction update to user
   * @param userId User ID
   * @param transaction Transaction data
   */
  static emitTransactionUpdate(userId: string, transaction: any): void {
    this.emitToUser(userId, 'transaction:update', transaction);
  }

  /**
   * Emit project status change
   * @param projectId Project ID
   * @param status New status
   * @param data Additional data
   */
  static emitProjectStatusChange(projectId: string, status: string, data: any = {}): void {
    this.emitToProject(projectId, 'project:status_change', { projectId, status, ...data });
  }

  /**
   * Emit new marketplace listing
   * @param listing Listing data
   */
  static emitNewListing(listing: any): void {
    this.emitToMarketplace('marketplace:new_listing', listing);
  }

  /**
   * Emit listing sold
   * @param listingId Listing ID
   * @param buyer Buyer info
   */
  static emitListingSold(listingId: string, buyer: any): void {
    this.emitToMarketplace('marketplace:listing_sold', { listingId, buyer });
  }

  /**
   * Emit credit minted notification
   * @param userId User ID
   * @param credits Credits data
   */
  static emitCreditMinted(userId: string, credits: any): void {
    this.emitToUser(userId, 'credit:minted', credits);
  }

  /**
   * Emit audit status change
   * @param projectId Project ID
   * @param auditStatus Audit status
   * @param data Additional data
   */
  static emitAuditStatusChange(projectId: string, auditStatus: string, data: any = {}): void {
    this.emitToProject(projectId, 'audit:status_change', { projectId, auditStatus, ...data });
  }

  /**
   * Broadcast to all connected clients
   * @param event Event name
   * @param data Event data
   */
  static broadcast(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
      logger.debug('Broadcasted event', { event });
    }
  }

  /**
   * Check if user is online
   * @param userId User ID
   * @returns Boolean indicating if user is online
   */
  static isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  /**
   * Get number of connected clients
   * @returns Number of connected clients
   */
  static getConnectedClientsCount(): number {
    return this.io ? this.io.sockets.sockets.size : 0;
  }

  /**
   * Emit Guardian workflow status change
   * @param projectId Project ID
   * @param status New Guardian status
   * @param data Additional data
   */
  static emitGuardianStatusChange(projectId: string, status: string, data: any = {}): void {
    this.emitToProject(projectId, 'guardian:status_change', { projectId, status, ...data });
  }

  /**
   * Emit MRV data update
   * @param projectId Project ID
   * @param mrvData MRV data
   */
  static emitMRVDataUpdate(projectId: string, mrvData: any): void {
    this.emitToProject(projectId, 'mrv:data_update', { projectId, mrvData });
  }

  /**
   * Emit auditor notification
   * @param auditorId Auditor user ID
   * @param notification Notification data
   */
  static emitAuditorNotification(auditorId: string, notification: any): void {
    this.emitToUser(auditorId, 'auditor:notification', notification);
  }

  /**
   * Emit minting progress
   * @param projectId Project ID
   * @param progress Minting progress data
   */
  static emitMintingProgress(projectId: string, progress: any): void {
    this.emitToProject(projectId, 'guardian:minting_progress', { projectId, ...progress });
  }
}

export default WebSocketService;
