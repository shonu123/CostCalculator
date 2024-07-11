import { SPHttpClient, SPHttpClientResponse, SPHttpClientConfiguration } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface ISynergycostcalculatorProps {
  description: string;
  spHttpClient:SPHttpClient;
  spContext:any;
  context:WebPartContext;
}
 