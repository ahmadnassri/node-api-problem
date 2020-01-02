type DetailsType = Record<string, any>;

type ServerResponse = {
  writeHead: (
    status: number,
    headers?: Record<string, number | string | string[] | undefined>
  ) => void;
  end: (chunk: any) => void;
};

declare class Problem extends Error {
  /**
   * Construct a new problem object. Supply every value
   * one by one or pass in an object to configure extra
   * data to be passed in the details field.
   */
  constructor(status: number, details?: DetailsType);

  constructor(
    status: number,
    title?: string,
    type?: string,
    details?: DetailsType
  );

  /**
   * Add problem+json information to the server response.
   */
  send(response: ServerResponse, space?: number): void;

  toString(): string;
}

export default Problem;
