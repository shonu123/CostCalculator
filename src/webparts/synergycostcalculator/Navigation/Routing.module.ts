import { lazy } from 'react';
const CalculatorComponent = lazy(() => import('../components/Calculator/Calculator.component'));
const ClientmasterComponent = lazy(() => import('../components/ClientMaster/Clientmaster.component'));

const appPermissions = [
    {
        link: '/',
        accessTo: 'everyone',
        canActivate:false,
        component:CalculatorComponent
    },
    {
        link: '/clientmaster',
        accessTo: 'Cost Calculator Administrators',
        canActivate:true,
        component:ClientmasterComponent
    },
    {
        link: '/costcalculator',
        accessTo: 'everyone',
        canActivate:false,
        component:CalculatorComponent
    }
];
export default appPermissions;