import { Response } from 'express';

class ApiResponse {
  static success(res: Response, data: any, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created(res: Response, data: any, message = 'Resource created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static paginated(
    res: Response,
    data: any[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message = 'Success'
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }
}

export default ApiResponse;
