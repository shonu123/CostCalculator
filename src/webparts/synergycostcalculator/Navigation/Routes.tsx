import * as React from 'react';
import { Component, Suspense, lazy } from 'react';
import { Route, Switch } from 'react-router-dom';
import GuardedRoute from './GuardedRoute';
const CalculatorComponent = lazy(() => import('../components/Calculator/Calculator.component'));
const ClientmasterComponent = lazy(() => import('../components/ClientMaster/Clientmaster.component'));
import { SPHttpClient, SPHttpClientResponse, SPHttpClientConfiguration } from '@microsoft/sp-http';
import sitePermissions from './Routing.module';

export interface RoutesProps {
    spContext: any;
    spHttpClient: SPHttpClient;
    currentUserGroups: any;
}
export interface RoutesState {

}
class Routes extends Component<RoutesProps, RoutesState> {
    public state = {};
    public renderProtectedRoutes = () => {
        let currentUserGroups = this.props.currentUserGroups;
        let protectedRoutes = sitePermissions.map((permission) => {
            if (permission.canActivate) {
                let authinticated = false;
                if (currentUserGroups.includes(permission.accessTo)) {
                    authinticated = true;
                }
                return (<GuardedRoute {...this.props} path={permission.link} component={permission.component} auth={authinticated} />);
            }
            return null;
        });
        return protectedRoutes;
    }
    public render() {
        return (
            <Suspense fallback={<div></div>}>
                <Switch>
                    <Route exact path='/' render={(matchprops) => <CalculatorComponent {...matchprops}{...this.props} />} />
                    <Route path='/costcalculator/:id?' render={(matchprops) => <CalculatorComponent {...matchprops}{...this.props} />} />
                    <Route path='/clientmaster/:id?' render={(matchprops) => <ClientmasterComponent {...matchprops}{...this.props} />} />
                    {this.renderProtectedRoutes()}
                </Switch>
            </Suspense>
        );
    }
}
export default Routes;