declare module 'easy-soap-request' {
  export interface SoapOptions {
    url: string;
    headers?: Record<string, string>;
    xml: string;
    timeout?: number;
    maxBodyLength?: number;
    maxContentLength?: number;
  }

  export interface SoapResponse {
    response: {
      headers: Record<string, string>;
      body: string;
      statusCode: number;
    };
  }

  export default function soapRequest(options: SoapOptions): Promise<SoapResponse>;
}
