export type IOptions = {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: string;
};

type IOptionsResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
};

/**
 * 📄 calculatePagination
 * -----------------------------------------------------
 * A utility function to standardize pagination and sorting options.
 *
 * ✅ Converts incoming pagination params (usually from query strings)
 *    into properly typed numeric values.
 * ✅ Calculates `skip` (the number of records to skip) for database queries.
 * ✅ Provides default values if none are supplied.
 *
 * @param options - Object containing pagination and sorting parameters
 * @returns An object containing page, limit, skip, sortBy, and sortOrder
 */
const calculatePagination = (options: IOptions): IOptionsResult => {
  // Current page number (default: 1)
  const page: number = Number(options.page) || 1;

  // Number of items per page (default: 10)
  const limit: number = Number(options.limit) || 10;

  // Number of records to skip based on current page
  const skip: number = (Number(page) - 1) * limit;

  // Sorting configuration (default: newest first)
  const sortBy: string = options.sortBy || "createdAt";
  const sortOrder: string = options.sortOrder || "desc";

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};

/**
 * 🧮 paginationHelper
 * -----------------------------------------------------
 * Centralized helper that provides pagination utilities
 * for consistent query handling across the app.
 */
export const paginationHelper = {
  calculatePagination,
};
