import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane'; 
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'SynergycostcalculatorWebPartStrings';
import Synergycostcalculator from './components/Synergycostcalculator';
import { ISynergycostcalculatorProps } from './components/ISynergycostcalculatorProps';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CSS/input-style.css';
// import './CSS/style.css';
/////
export interface ISynergycostcalculatorWebPartProps {
  description: string;
}

export default class SynergycostcalculatorWebPart extends BaseClientSideWebPart<ISynergycostcalculatorWebPartProps> {

  public render(): void {
    const element: React.ReactElement<ISynergycostcalculatorProps> = React.createElement(
      Synergycostcalculator,
      {
        description: this.properties.description,
        spHttpClient:this.context.spHttpClient,
        spContext:this.context.pageContext.legacyPageContext,
        context:this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
