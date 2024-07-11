import * as React from 'react';
import { Component } from 'react';
import { NavLink } from 'react-router-dom';
import appPermissions from './Routing.module';
export interface NavBarProps {
    currentUserGroups: any;
}

export interface NavBarState {
    currentUserLinks: Array<string>;
    isActive:boolean;
}

class NavBar extends React.Component<NavBarProps, NavBarState> {
    public state = { currentUserLinks: [] ,isActive:false};
    public currentUserLinksArr = [];
    public componentDidMount() {
        console.log('props in navbar', this.props);
        console.log('permissions', appPermissions);

        for (let permission of appPermissions) {
            let accessTo = permission.accessTo;
            if (accessTo == 'everyone' || this.props.currentUserGroups.includes(accessTo)) {
                this.currentUserLinksArr.push(permission.link);
            }
        }
        const loc =location.href.split('#')[1];
        if(['/','/costcalculator'].includes(loc)){
            this.setState({ isActive: true});
        }
        else{
            this.setState({ isActive: false});
        }
        this.setState({ currentUserLinks: this.currentUserLinksArr });
    }
    public render() {
        return (
            <div>
            <div className='nav-main container-fluid'>
                <div>
                    <img src='/sites/Synergy/CostCalculator/SiteAssets/SynergyLogo-SM.jpg' className='synergyLogo'/>
                </div>
                <div className="main-title">Cost Calculator</div>
            </div>
            <div className='container-fluid'>
                {/* <ul className="nav nav-tabs">
                <li className="nav-item" onClick={()=>this.setState({isActive:false})}>
                {this.state.currentUserLinks.includes('/clientmaster') ? <NavLink className={!this.state.isActive?"nav-link active":"nav-link"} to="/clientmaster"><span className="">Client Master</span></NavLink> : null}
                </li>
                <li className="nav-item" onClick={()=>this.setState({isActive:true})}>
                {this.state.currentUserLinks.includes('/costcalculator') ? <NavLink className={this.state.isActive?"nav-link active":"nav-link"} to="/costcalculator"><span className="">Cost Calculator</span></NavLink> : null}
                </li>
                </ul> */}
                
                <ul className="nav nav-tabs nav-pills mt-4 mb-1" id="pills-tab" role="tablist">
                    <li className="nav-item" onClick={()=>this.setState({isActive:false})} role="presentation">
                    {this.state.currentUserLinks.includes('/clientmaster') ? <NavLink className={!this.state.isActive?"nav-link active":"nav-link"} to="/clientmaster"><span className="">Client Master</span></NavLink> : null}
                </li>
                <li className="nav-item" onClick={()=>this.setState({isActive:true})} role="presentation">
                {this.state.currentUserLinks.includes('/costcalculator') ? <NavLink className={this.state.isActive?"nav-link active":"nav-link"} to="/costcalculator"><span className="">Cost Calculator</span></NavLink> : null}
                </li>
                </ul>

            </div>
            </div>
        );
    }
}

export default NavBar;