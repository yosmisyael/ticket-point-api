export class Paging {
  size: number;
  totalPage: number;
  currentPage: number;
}

export class WebResponse<T> {
  data?: T;
  error?: string;
  paging?: Paging;
}