import React, { Component, Suspense, lazy } from 'react';
import styles from './Synergycostcalculator.module.scss';
import { ISynergycostcalculatorProps } from './ISynergycostcalculatorProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { NavLink, HashRouter, Route, Switch } from 'react-router-dom';
import NavBar from '../Navigation/Navbar.component';
import Routes from '../Navigation/Routes';
import { SPHttpClient, SPHttpClientResponse, SPHttpClientConfiguration } from '@microsoft/sp-http';
import { SPComponentLoader } from '@microsoft/sp-loader';


export default class Synergycostcalculator extends React.Component<ISynergycostcalculatorProps, {}> {
  public state = {
    isPermissionChecked: false,
    currentUserGroups: []
  };
  public hideInterval;
  public componentDidMount() {
    //get current user permissions
    let siteUrl = this.props.spContext.webAbsoluteUrl;
    console.log('site url', siteUrl);
    this.renderNavContent(siteUrl);
    this.hideInterval = setInterval(this.hideSideNav, 1000);
  }
  public hideSideNav = () => {
    if (document.querySelector<HTMLInputElement>('sidenav')) {
      document.querySelector<HTMLInputElement>('sidenav').style.display = 'none';
      clearInterval(this.hideInterval);
    }

  }
  public renderNavContent = (siteURL) => {
    let spGroupsQuery = siteURL + "/_api/web/currentuser/groups";
    this.props.spHttpClient.get(spGroupsQuery, SPHttpClient.configurations.v1).then((res: SPHttpClientResponse) => {
      if (res.ok) {
        res.json().then((resp: any) => {
          let items = resp.value;
          let currentUserGroupsList = [];
          for (let group of items) {
            currentUserGroupsList.push(group.Title);
          }
          this.setState({ isPermissionChecked: true, currentUserGroups: currentUserGroupsList });
        });
      }
      else {
        console.log('something went wrong');
      }
    });
  }
  public render(): React.ReactElement<ISynergycostcalculatorProps> {
    return (
      <HashRouter>
        <div className="custom-tab">
          {this.state.isPermissionChecked ? <NavBar {...this.props} {...this.state} /> : null}
          <Suspense fallback={<div>Loading...</div>}>
            <Switch>
              {this.state.isPermissionChecked ? <Routes  {...this.state} {...this.props} /> : null}
            </Switch>
          </Suspense>
        </div>
      </HashRouter>
    );
  }
}
