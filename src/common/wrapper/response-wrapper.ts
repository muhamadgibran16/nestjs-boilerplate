interface IResponseWrapper {
  /**
   * Flag untuk menandakan apakah request berhasil atau tidak
   */
  status: string;
  /**
   * Pesan yang akan dikirimkan ke client
   */
  message: string;
  /**
   * Data yang akan dikirimkan ke client
   */
  data?: any;
}

/**
 * Class ini dibuat agar success response yang dikirimkan ke client memiliki struktur data yang konsisten
 */
export class SuccessfulResponse implements IResponseWrapper {
  status = 'success';
  constructor(
    public message: string,
    public data?: any,
  ) {}
}

/**
 * Class ini dibuat agar failed response yang dikirimkan ke client memiliki struktur data yang konsisten
 */
export class FailedResponse implements IResponseWrapper {
  status = 'failed';
  constructor(
    public message: string,
    public data?: any,
  ) {}
}
