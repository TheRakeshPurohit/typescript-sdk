import { Protocol } from "../shared/protocol.js";
import {
  ClientCapabilities,
  ClientNotification,
  ClientRequest,
  ClientResult,
  Implementation,
  InitializeRequest,
  InitializeResult,
  PROTOCOL_VERSION,
  ServerNotification,
  ServerRequest,
  ServerResult,
} from "../types/index.js";

/**
 * An MCP server on top of a pluggable transport.
 *
 * This server will automatically respond to the initialization flow as initiated from the client.
 */
export class Server extends Protocol<
  ClientRequest,
  ClientNotification,
  ClientResult,
  ServerRequest,
  ServerNotification,
  ServerResult
> {
  private _clientCapabilities?: ClientCapabilities;
  private _clientVersion?: Implementation;

  /**
   * Callback for when initialization has fully completed (i.e., the client has sent an `initialized` notification).
   */
  oninitialized?: () => void;

  /**
   * Initializes this server with the given name and version information.
   */
  constructor(private _serverInfo: Implementation) {
    super();

    this.setRequestHandler("initialize", (request) =>
      this._oninitialize(request as InitializeRequest),
    );
    this.setNotificationHandler("notification/initialized", () =>
      this.oninitialized?.(),
    );
  }

  private async _oninitialize(
    request: InitializeRequest,
  ): Promise<InitializeResult> {
    if (request.params.protocolVersion !== PROTOCOL_VERSION) {
      throw new Error(
        `Client's protocol version is not supported: ${request.params.protocolVersion}`,
      );
    }

    this._clientCapabilities = request.params.capabilities;
    this._clientVersion = request.params.clientInfo;

    return {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {},
      serverInfo: this._serverInfo,
    };
  }

  /**
   * After initialization has completed, this will be populated with the client's reported capabilities.
   */
  getClientCapabilities(): ClientCapabilities | undefined {
    return this._clientCapabilities;
  }

  /**
   * After initialization has completed, this will be populated with information about the client's name and version.
   */
  getClientVersion(): Implementation | undefined {
    return this._clientVersion;
  }
}