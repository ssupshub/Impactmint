import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

export class ApiResponseUtil {
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    error: string,
    statusCode: number = 500,
    errors?: Record<string, string>
  ): Response {
    const response: ApiResponse = {
      success: false,
      error,
      errors,
    };
    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    currentPage: number,
    totalItems: number,
    itemsPerPage: number,
    statusCode: number = 200
  ): Response {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const response: ApiResponse<PaginatedResponse<T>> = {
      success: true,
      data: {
        data,
        pagination: {
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        },
      },
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data?: T, message?: string): Response {
    return ApiResponseUtil.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}

export default ApiResponseUtil;
