import * as React from 'react';
import { Component } from 'react';
class UnAuthorized extends React.Component<{}, {}> {
    public state = {  };
    public render() { 
        return ( <h5>You are not authorize to view this page, please contact administrator </h5> );
    }
}
export default UnAuthorized;