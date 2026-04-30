import * as http from "node:http";
import * as https from "node:https";
import EventEmitter from "node:events";
import { Stream } from "node:stream";

/**
 * The forms of data that `Nexis` handles.
 */
export type NexisBody =
  | string
  | object
  | Stream
  | ArrayBuffer
  | Buffer<ArrayBufferLike>
  | ArrayBufferView<ArrayBufferLike>
  | URLSearchParams;

/**
 * The code of a `NexisError`.
 */
export type NexisErrorCode =
  | "ERR_INVALID_AUTH_SCHEME"
  | "ERR_INVALID_HTTP_TOKEN"
  | "ERR_HTTP_INVALID_HEADER_VALUE"
  | "ERR_HTTP_REQUEST_TIMEOUT";

/**
 * A `Nexis` error with `request` and `response` objects attached.
 */
export class NexisError extends Error {
  constructor(
    message: string | Error,
    options?: ErrorOptions & {
      code?: NexisErrorCode;
      req?: http.ClientRequest;
      res?: http.IncomingMessage;
    },
  );
  code: string;
  req: http.ClientRequest;
  res: http.IncomingMessage;
}

/**
 * A `Nexis` callback function to handle response and error.
 */
export type NexisCallback = (
  res: http.IncomingMessage,
  err?: NexisError,
) => void;

/**
 * A `Nexis` method request function.
 */
export type NexisMethodRequest = (
  path?: string | URL,
  configOrCb?: http.RequestOptions | NexisCallback,
  cb?: NexisCallback,
) => Promise<http.IncomingMessage>;

/**
 * Configuration options for a `Nexis` instance.
 */
export type NexisConfig = http.RequestOptions & {
  baseURL: string | URL;
  maxRedirects?: number;
};

/**
 * A class that extends off the `http.IncomingMessage` class and implements custom `header` methods.
 * @class
 * @extends {http.IncomingMessage}
 */
export class NexisIncomingMessage extends http.IncomingMessage {
  constructor(socket: net.Socket);

  getHeader(name: string): string | string[];
  getHeaders(names: string[]): http.IncomingHttpHeaders;
  getHeaderNames(): string[];
  hasHeader(name: string): boolean;
}

/**
 * Defines the default values.
 */
export type defaults = {
  baseURL: "http://localhost:80/";
  path: "/";
  method: { read: "get"; write: "post" };
  config: () => {
    port: 80;
    timeout: 10000;
    maxRedirects: 0;
  };
  res: () => { data: null };
  req: () => {};
};
export const defaults: defaults;

/**
 * Maps protocol option string to module.
 */
export type Protocols = { "http:": typeof http; "https:": typeof https };
export const protocols: Protocols;

/**
 * Used to merge two objects together overriding `object1` properties with `object2`.
 */
export type deepMerge = (object1: object, object2: object) => object;
export const deepMerge: deepMerge;

/**
 * Used to automatically encode data and configure content type and length.
 */
export type encodeConfigBody = (
  body: NexisBody,
) => [
  string | Buffer<ArrayBuffer | ArrayBufferLike> | Stream | null,
  { "content-type": string | null; "content-length": number | null },
];
export const encodeConfigBody: encodeConfigBody;

/**
 * Used to decode response data based off the content type.
 */
export type decodeData = (
  data: string,
  contentType: string,
) => string | object | URLSearchParams;
export const decodeData: decodeData;

/**
 * Used to format json auth credentials to string, following the scheme format.
 * The scheme is defined in the `scheme` property of the `auth` param. Supported scheme formates include `basic`, `bearer` & `digest`.
 * - `Basic` scheme requires `username` & `password` params.
 * - `Bearer` scheme requires `token` param.
 * - `Digest` scheme loops through every provided param.
 */
export type authFormatter = (
  auth: {
    scheme: "basic" | "bearer" | "digest";
    token?: string;
    username?: string;
    password?: string;
    [key: string]: string;
  },
  onReject: (err: TypeError) => void,
) => string;
export const authFormatter: authFormatter;

/**
 * Defines `Nexis` events and their arguments.
 */
export interface NexisEvents {
  request: [req: http.ClientRequest];
  data: [data: string];
  redirect: [res: http.IncomingMessage, config: NexisConfig];
  response: [res: http.IncomingMessage];
  error: [err: NexisError];
}

/**
 * Creates a `Nexis` instance that uses the `node:http` & `node:https` libraries to make http(s) request and receive responses.
 * Simplifys making requests by auto configurating, encoding and decoding data, and sets up default event handlers and values.
 * Additionally, provides many options to handle a response or error.
 *
 * @example
 *      const client = new Nexis({ baseURL: "http://localhost:3000/" });
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
 * @extends {EventEmitter}
 */
export class Nexis extends EventEmitter<NexisEvents> {
  /**
   * Creates a `Nexis` instance that uses the `node:http` & `node:https` libraries to make http(s) request and receive responses.
   * Simplifys making requests by auto configurating, encoding and decoding data, and sets up default event handlers and values.
   * Additionally, provides many options to handle a response or error.
   *
   * @example
   *      const client = new Nexis({ baseURL: "http://localhost:3000/" });
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
   * @extends {EventEmitter}
   */
  constructor(config?: NexisConfig);

  getBaseURL(): URL;
  getConfig(): http.RequestOptions;
  setBaseURL(newBaseURL?: string | URL): void;
  setConfig(newConfig?: http.RequestOptions): void;

  /**
   * Makes a read request which is either a `get` or `delete` method.
   */
  read(
    path?: string | URL,
    method?: "get" | "delete",
    configOrCb?: http.RequestOptions | NexisCallback,
    cb?: NexisCallback,
  ): Promise<http.IncomingMessage>;

  /**
   * Makes a write request which is either a `post`, `put` or `patch` method.
   */
  write(
    path?: string | URL,
    method?: "post" | "put" | "patch",
    configOrCb?: http.RequestOptions | NexisCallback,
    cb?: NexisCallback,
  ): Promise<http.IncomingMessage>;

  /**
   * Make a http(s) get request.
   */
  get: NexisMethodRequest;

  /**
   * Make a http(s) delete request.
   */
  delete: NexisMethodRequest;

  /**
   * Make a http(s) post request.
   */
  post: NexisMethodRequest;

  /**
   * Make a http(s) put request.
   */
  put: NexisMethodRequest;

  /**
   * Make a http(s) patch request.
   */
  patch: NexisMethodRequest;

  Agent: http.Agent;
  ClientRequest: http.ClientRequest;
  IncomingMessage: NexisIncomingMessage;
  OutgoingMessage: http.OutgoingMessage;
  METHODS: typeof http.METHODS;
  STATUS_CODES: typeof http.STATUS_CODES;
  globalAgent: typeof http.globalAgent;
  maxHeaderSize: typeof http.maxHeaderSize;
  request: typeof http.request;
  validateHeaderName: typeof http.validateHeaderName;
  validateHeaderValue: typeof http.validateHeaderValue;
}

/**
 * An instance of `Nexis` that has the added factory functionality of a `create` method to make more `Nexis` instances.
 */
export interface NexisFactory extends Nexis {
  /**
   * Creates another `NexisFactory` instance, `instanceConfig` is merged with the `defaultConfig` of this instance.
   */
  create(instanceConfig?: NexisConfig): NexisFactory;
}
/**
 * A `NexisFactory` instance with default configuration.
 */
const nexis: NexisFactory & {
  Nexis: Nexis;
  NexisError: NexisError;
  defaults: defaults;
  protocols: Protocols;
  deepMerge: deepMerge;
  encodeConfigBody: encodeConfigBody;
  decodeData: decodeData;
  authFormatter: authFormatter;
};
export default nexis;
