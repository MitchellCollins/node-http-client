import { IncomingMessage, RequestOptions } from "http";
import { Stream } from "stream";

export type HTTPBody = string | object | Stream | ArrayBuffer | Buffer<ArrayBufferLike> | ArrayBufferView<ArrayBufferLike> | URLSearchParams;

/**
 * A callback function to handle response and error.
 */
export type HTTPCallback = (res: IncomingMessage, err?: Error) => void;

/**
 * Creates a `HTTPClient` that uses the `node:http` library to make http request and recieve responses.
 * Simplifys making requests by auto configurating and encoding data, and sets up default event handlers.
 * Additionally, provides many options to handle a response or error.
 * 
 * @example
 *      const client = new HTTPClient("localhost", { port: 3000 });
 *      client.get("/greeting", (res, err) => {
 *          if (err) {
 *              console.error("Get Error:", err);
 *              return;
 *          }
 * 
 *          console.log("Get Response:", res?.data);
 *      });
 * 
 *      // or
 * 
 *      try {
 *          const res = await client.get("/greeting");
 *          console.log("Get Response:", res?.data);
 *      } catch (err) {
 *          console.error("Get Error:", err);
 *      }
 *      
 * @class
 */
export default class HTTPClient {
    /**
     * Creates a `HTTPClient` that uses the `node:http` library to make http request and recieve responses.
     * Simplifys making requests by auto configurating and encoding data, and sets up default event handlers.
     * Additionally, provides many options to handle a response or error.
     * 
     * @example
     *      const client = new HTTPClient("localhost", { port: 3000 });
     *      client.get("/greeting", (res, err) => {
     *          if (err) {
     *              console.error("Get Error:", err);
     *              return;
     *          }
     * 
     *          console.log("Get Response:", res?.data);
     *      });
     * 
     *      // or
     * 
     *      try {
     *          const res = await client.get("/greeting");
     *          console.log("Get Response:", res?.data);
     *      } catch (err) {
     *          console.error("Get Error:", err);
     *      }
     *      
     * @class
     */
    constructor(baseURL: string, config: RequestOptions);

    getBaseURL(): string;
    getConfig(): RequestOptions;
    setBaseURL(newBaseURL?: string): void;
    setConfig(newConfig?: RequestOptions): void;

    /**
     * Make a http get request.
     */
    get(path: string, configOrCb?: RequestOptions | HTTPCallback, cb?: HTTPCallback): Promise<IncomingMessage>;

    /**
     * Make a http delete request.
     */
    delete(path: string, configOrCb?: RequestOptions | HTTPCallback, cb?: HTTPCallback): Promise<IncomingMessage>;

    /**
     * Make a http post request.
     */
    post(path: string, body: HTTPBody, configOrCb?: RequestOptions | HTTPCallback, cb?: HTTPCallback): Promise<IncomingMessage>;

    /**
     * Make a http put request.
     */
    put(path: string, body: HTTPBody, configOrCb?: RequestOptions | HTTPCallback, cb?: HTTPCallback): Promise<IncomingMessage>;

    /**
     * Make a http patch request.
     */
    patch(path: string, body: HTTPBody, configOrCb?: RequestOptions | HTTPCallback, cb?: HTTPCallback): Promise<IncomingMessage>;
}