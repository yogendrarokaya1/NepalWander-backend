import { Response } from "express";

interface ApiResponseData {
  success: boolean;
  message: string;
  data?: unknown;
  errors?: unknown;
}

export class ApiResponse {
  static success(
    res: Response,
    message: string,
    data?: unknown,
    statusCode = 200
  ): Response<ApiResponseData> {
    return res.status(statusCode).json({
      success: true,
      message,
      data: data ?? null,
    });
  }

  static created(
    res: Response,
    message: string,
    data?: unknown
  ): Response<ApiResponseData> {
    return res.status(201).json({
      success: true,
      message,
      data: data ?? null,
    });
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    errors?: unknown
  ): Response<ApiResponseData> {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors ?? null,
    });
  }
}