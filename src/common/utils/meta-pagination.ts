import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class PaginationQuery {
  @IsInt()
  @Type(() => Number)
  limit = 10;

  @IsInt()
  @Type(() => Number)
  page = 1;
}

export const metaPagination = (
  page: number,
  perPage: number,
  totalCurrentPage: number,
  total: number,
) => {
  return {
    currentPage: page,
    perPage,
    totalCurrentPage,
    totalPage: Math.ceil(total / perPage),
    totalData: total,
  };
};
