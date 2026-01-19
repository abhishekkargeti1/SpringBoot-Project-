declare module '@stomp/stompjs' {
  export interface IFrame {
    command: string;
    headers: { [key: string]: string };
    body: string;
  }

  export interface IMessage {
    command: string;
    headers: { [key: string]: string };
    body: string;
    ack: () => void;
    nack: () => void;
  }

  export interface ClientOptions {
    webSocketFactory?: () => any;
    connectHeaders?: { [key: string]: string };
    debug?: (str: string) => void;
    reconnectDelay?: number;
    heartbeatIncoming?: number;
    heartbeatOutgoing?: number;
    onConnect?: (frame: IFrame) => void;
    onStompError?: (frame: IFrame) => void;
    onWebSocketError?: (event: Event) => void;
    onDisconnect?: () => void;
  }

  export class Client {
    constructor(options?: ClientOptions);
    activate(): void;
    deactivate(): void;
    publish(options: { destination: string; body: string; headers?: { [key: string]: string } }): void;
    subscribe(destination: string, callback: (message: IMessage) => void): any;
  }
}

