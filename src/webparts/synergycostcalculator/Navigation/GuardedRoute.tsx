import * as React from 'react';
import { Route, Redirect } from "react-router-dom";
import UnAuthorized from '../components/Unauthorized/Unauthorized.component';

const GuardedRoute = ({ component: Component, auth, ...rest }) => (
    <Route {...rest} render={(props) => (
        auth === true
            ? <Component {...rest} {...props} />
            : <UnAuthorized />
    )} />
);
export default GuardedRoute;