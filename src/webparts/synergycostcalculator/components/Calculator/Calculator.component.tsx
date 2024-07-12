import * as React from 'react';
import { Component } from 'react';
import Loader from '../Shared/Loader';
import { SPHttpClient, SPHttpClientResponse, SPHttpClientConfiguration } from '@microsoft/sp-http';
import CurrencyFormat from 'react-currency-format';
import NumberFormat from 'react-number-format';
import '../../CSS/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus,faPrint } from '@fortawesome/free-solid-svg-icons';

export interface CalculatorProps {
    match: any;
    spContext: any;
    spHttpClient: SPHttpClient;
}

export interface CalculatorState {

}

class Calculator extends React.Component<CalculatorProps, CalculatorState> {
    public siteURL: string;
    public selectedCustomer: any = {};
    public getInitialState = () => {
        return {
            selectedCust: {
                IsIndepSub: false,
                IsSalary: false,
                IsW2Hourly: false,
                IsW2HourlyPlus: false
            },
            'Indep/Sub': {
                whatSynergyGets: 0,
                whatSynergyGets_Round: 0,
                additionalCost: 0,
                additionalCost_Round: 0,
                // 11 july 2024
                additionalCostDollor: 0,
                additionalCostDollor_Round:0,
                // ---------
                t12month18montRebate: 0,
                t12month18montRebate_Round: 0,
                actualCost: 0,
                actualCost_Round: 0,
                minPerMarkup: 0,
                minsellPriceHr: 0,
                minsellPriceHr_Round: 0,
                minsellPriceHrPlusFee: 0,
                minsellPriceHrPlusFee_Round: 0,
                preferredMarkup: 0,
                preferredsellPriceHr: 0,
                preferredsellPriceHr_Round: 0,
                preferredsellPriceHrPlusFee: 0,
                preferredsellPriceHrPlusFee_Round: 0,
                profitMarginPay: 0,
                cPay: 0,
                submitedRate: 0,
                miscellaneousCost: 0,
                miscellaneousCost_Round: 0

            },
            'W2-Hourly': {
                whatSynergyGets: 0,
                whatSynergyGets_Round: 0,
                additionalCost: 0,
                additionalCost_Round: 0,
                // 11 july 2024
                additionalCostDollor: 0,
                additionalCostDollor_Round:0,
                // ---------
                t12month18montRebate: 0,
                t12month18montRebate_Round: 0,
                actualCost: 0,
                actualCost_Round: 0,
                minPerMarkup: 0,
                minsellPriceHr: 0,
                minsellPriceHr_Round: 0,
                minsellPriceHrPlusFee: 0,
                minsellPriceHrPlusFee_Round: 0,
                preferredMarkup: 0,
                preferredsellPriceHr: 0,
                preferredsellPriceHr_Round: 0,
                preferredsellPriceHrPlusFee: 0,
                preferredsellPriceHrPlusFee_Round: 0,
                profitMarginPay: 0,
                cPay: 0,
                submitedRate: 0,
                miscellaneousCost: 0,
                miscellaneousCost_Round: 0
            },
            'W2-Hourly-Plus': {
                whatSynergyGets: 0,
                whatSynergyGets_Round: 0,
                additionalCost: 0,
                additionalCost_Round: 0,
                // 11 july 2024
                additionalCostDollor: 0,
                additionalCostDollor_Round:0,
                // ---------
                t12month18montRebate: 0,
                t12month18montRebate_Round: 0,
                actualCost: 0,
                actualCost_Round: 0,
                minPerMarkup: 0,
                minsellPriceHr: 0,
                minsellPriceHr_Round: 0,
                minsellPriceHrPlusFee: 0,
                minsellPriceHrPlusFee_Round: 0,
                preferredMarkup: 0,
                preferredsellPriceHr: 0,
                preferredsellPriceHr_Round: 0,
                preferredsellPriceHrPlusFee: 0,
                preferredsellPriceHrPlusFee_Round: 0,
                profitMarginPay: 0,
                cPay: 0,
                submitedRate: 0,
                miscellaneousCost: 0,
                miscellaneousCost_Round: 0
            },
            'Salary': {
                whatSynergyGets: 0,
                whatSynergyGets_Round: 0,
                additionalCost: 0,
                additionalCost_Round: 0,
                // 11 july 2024
                additionalCostDollor: 0,
                additionalCostDollor_Round:0,
                // ---------
                t12month18montRebate: 0,
                t12month18montRebate_Round: 0,
                actualCost: 0,
                actualCost_Round: 0,
                minPerMarkup: 0,
                minsellPriceHr: 0,
                minsellPriceHr_Round: 0,
                minsellPriceHrPlusFee: 0,
                minsellPriceHrPlusFee_Round: 0,
                preferredMarkup: 0,
                preferredsellPriceHr: 0,
                preferredsellPriceHr_Round: 0,
                preferredsellPriceHrPlusFee: 0,
                preferredsellPriceHrPlusFee_Round: 0,
                profitMarginPay: 0,
                cPay: 0,
                submitedRate: 0,
                miscellaneousCost: 0,
                miscellaneousCost_Round: 0
            }
        };
    }
    public state = {
        customers: [],
        category: '',
        isImmigrantChecked: false,
        isCheckCategory:false,
        loading:false,
        data: this.getInitialState()
    };
    constructor(props: CalculatorProps) {
        super(props);
        this.siteURL = this.props.spContext.webAbsoluteUrl;
        //console.log('current siteurl', this.siteURL);
    }
    public componentDidMount() {
        this.setState({ loading: true });
        this.getClients();
    }
    public getClients = () => {
        let queryItems = this.siteURL + "/_api/web/lists/getbytitle('Customers')/items?$filter=IsActive eq 1&$orderby=Title asc";
        this.props.spHttpClient.get(queryItems, SPHttpClient.configurations.v1).then((res: SPHttpClientResponse) => {
            if (res.ok) {
                res.json().then((response: any) => {
                    this.setState({ customers: response.value,loading:false });
                    console.log(response);//12 july 2024
                    //return this.bindItemsToDropdown(response.value, 'Title', 'Title');
                });
            }
            else {
                console.log('something went wrong');
            }
        });
    }
    public customerDropdownChange = async (event) => {
        event.preventDefault();
        var index = event.nativeEvent.target.selectedIndex;
        let selectedValue = event.target.value;
        let selectedCustomer = this.state.customers.filter((customer) => {
            return customer.Id == selectedValue;
        });
        let emptydata = this.getInitialState();
        console.log("Selected customer",selectedCustomer);
        if (selectedCustomer && selectedCustomer.length > 0) {
            await this.setState({ data: emptydata }, () => {
                this.selectedCustomer = selectedCustomer[0];
                if (![null, undefined, ''].includes(this.selectedCustomer) && Object.keys(this.selectedCustomer).length > 0) {
                    const formState = { ...this.state.data };

                    formState['Indep/Sub'].minPerMarkup = !['', null, undefined].includes(selectedCustomer[0].MinMarkup_IndepSub) ? selectedCustomer[0].MinMarkup_IndepSub : 0;
                    formState['W2-Hourly'].minPerMarkup = !['', null, undefined].includes(selectedCustomer[0].MinMarkup_W2Hourly) ? selectedCustomer[0].MinMarkup_W2Hourly : 0;
                    formState['W2-Hourly-Plus'].minPerMarkup = !['', null, undefined].includes(selectedCustomer[0].MinMarkup_W2HourlyPlus) ? selectedCustomer[0].MinMarkup_W2HourlyPlus : 0;
                    formState['Salary'].minPerMarkup = !['', null, undefined].includes(selectedCustomer[0].MinMarkup_Salary) ? selectedCustomer[0].MinMarkup_Salary : 0;
                    //Preffered Percentage
                    formState['Indep/Sub'].preferredMarkup = !['', null, undefined].includes(selectedCustomer[0].PreferredMarkup_IndepSub) ? selectedCustomer[0].PreferredMarkup_IndepSub : 0;
                    formState['W2-Hourly'].preferredMarkup = !['', null, undefined].includes(selectedCustomer[0].PreferredMarkup_W2Hourly) ? selectedCustomer[0].PreferredMarkup_W2Hourly : 0;
                    formState['W2-Hourly-Plus'].preferredMarkup = !['', null, undefined].includes(selectedCustomer[0].PreferredMarkup_W2HourlyPlus) ? selectedCustomer[0].PreferredMarkup_W2HourlyPlus : 0;
                    formState['Salary'].preferredMarkup = !['', null, undefined].includes(selectedCustomer[0].PreferredMarkup_Salary) ? selectedCustomer[0].PreferredMarkup_Salary : 0;
                    this.setState(formState);
                }
            });
        }
        else {
            this.selectedCustomer = selectedCustomer[0];
            this.setState({ data: emptydata });
        }

    }
    public handleChange = (e) => {
        e.preventDefault();
        var value = e.target.value;
        if (!['', null, undefined].includes(value)) {
            value = value.replace('$', '');
            value = value.replace(/,/g, "");
        }
        const re = /^[0-9]*(\.[0-9]{0,2})?$/;
        if (!re.test(value)) {
            return false;
        }
        let inpuValue = value != '' ? value : 0;
        if (!value.includes('.')) {
            inpuValue = value != '' ? parseFloat(value) : 0;
        }
        //let inpuValue = value != '' ? parseFloat(value) : 0;
        //let inpuValue = value != '' ? value : 0;
        let currentControl = e.target.name;
        let ctrlName = currentControl.split('_')[1];
        let sectionName = currentControl.split('_')[0];
        let isCandidatePay = false;
        if (sectionName == 'candidatepay') {
            isCandidatePay = true;
        }
        let additionalCostCurrentSection = 0,additionalCostDollorCurrentSection = 0;
        let miscellaneousCostCurrentSection = 0;
        let immigrationCostCurrentSection = 0;
        enum costSections { 'Indep/Sub' = 'Indep/Sub', 'Salary' = 'Salary', 'W2-Hourly' = 'W2-Hourly', 'W2-Hourly-Plus' = 'W2-Hourly-Plus' }
        let additionalCostInternalColumn = "AdditionalCost_";
        // 11 july 2024
        let AdditionalCostDollorInternalColumn = "AdditionalCostDolr_";
        //------
        let miscellaneousInternalColumn = "MiscellaneousCost_";
        let immigrationInternalColumn = "ImmigrationCost_";
        if (ctrlName == costSections['Indep/Sub']) {
            additionalCostInternalColumn += "IndepSub";
            AdditionalCostDollorInternalColumn += "IndepSub";
            miscellaneousInternalColumn += "IndepSub";
            immigrationInternalColumn += "IndepSub";
        }
        else if (ctrlName == costSections.Salary) {
            additionalCostInternalColumn += "Salary";
            AdditionalCostDollorInternalColumn +="Salary";
            miscellaneousInternalColumn += "Salary";
            immigrationInternalColumn += "Salary";

        }
        else if (ctrlName == costSections['W2-Hourly']) {
            additionalCostInternalColumn += "W2Hourly";
            AdditionalCostDollorInternalColumn +="W2Hourly";
            miscellaneousInternalColumn += "W2Hourly";
            immigrationInternalColumn += "W2Hourly";
        }
        else if (ctrlName == costSections['W2-Hourly-Plus']) {
            additionalCostInternalColumn += "W2HourlyPlus";
            AdditionalCostDollorInternalColumn +="W2HourlyPlus";
            miscellaneousInternalColumn += "W2HourlyPlus";
            immigrationInternalColumn += "W2HourlyPlus";

        }
        const formState = { ...this.state.data };
        if (isCandidatePay) {
            formState[ctrlName].cPay = inpuValue;
        }
        else {
            formState[ctrlName].submitedRate = inpuValue;
        }
        let additionalCostListItemValue = this.selectedCustomer[additionalCostInternalColumn];
        additionalCostCurrentSection = !['0', '', null, undefined].includes(additionalCostListItemValue) ? (parseFloat(additionalCostListItemValue) * formState[ctrlName].cPay)/100 : 0;

        // 11 july 2024
        let additionalCostDollorListItemValue = this.selectedCustomer[AdditionalCostDollorInternalColumn];
        additionalCostDollorCurrentSection =!['0', '', null, undefined].includes(additionalCostDollorListItemValue) ? (parseFloat(additionalCostDollorListItemValue)): 0;
        console.log("additionalCostDollor",additionalCostDollorCurrentSection);
        // -------------

        let processingCharges = (this.selectedCustomer.ProcessingCharges != '' && this.selectedCustomer.ProcessingCharges != '0') ? parseFloat(this.selectedCustomer.ProcessingCharges) / 100 : 0;
        
        let mislaneousCostListItemValue = this.selectedCustomer[miscellaneousInternalColumn];
        miscellaneousCostCurrentSection = !['0', '', null, undefined].includes(mislaneousCostListItemValue) ? ((parseFloat(mislaneousCostListItemValue)) * formState[ctrlName].cPay)/100 : 0;

        let immigrationCostListItemValue = this.selectedCustomer[immigrationInternalColumn];
        immigrationCostCurrentSection = !['0', '', null, undefined].includes(immigrationCostListItemValue) ? parseFloat(immigrationCostListItemValue) : 0;

        let whatSynergyGetsValue = formState[ctrlName].submitedRate - (formState[ctrlName].submitedRate * processingCharges);
        // // 11 july 2024
        // let actualCostValue = additionalCostCurrentSection + parseFloat(formState[ctrlName].cPay) // adding additionalCostDollorCurrentSection to this to get total;
        //re commented
        // let actualCostValue = additionalCostCurrentSection + parseFloat(formState[ctrlName].cPay) +additionalCostDollorCurrentSection + parseFloat(formState[ctrlName].cPay);

console.log("cuurentCpay:",formState[ctrlName].cPay,"additionalCostCurrentSection:",additionalCostCurrentSection);

        let actualCostValue = additionalCostCurrentSection + parseFloat(formState[ctrlName].cPay) +additionalCostDollorCurrentSection;
        console.log("actual cost",actualCostValue);
        // // --------------
        let currentStateMinMarkup = parseFloat(formState[ctrlName].minPerMarkup);
        let currentStatePrefMinMarkup = parseFloat(formState[ctrlName].preferredMarkup);
        let minSellPrice = 0;
        let prefSellPrHr = 0;
        if (this.state.category == "Immigrant") {
            miscellaneousCostCurrentSection = miscellaneousCostCurrentSection + immigrationCostCurrentSection;
        }
        actualCostValue = actualCostValue + miscellaneousCostCurrentSection;
        // // 11 july 2024
        // actualCostDollorValue = actualCostDollorValue + miscellaneousCostCurrentSection
        // // ---------
        formState[ctrlName].miscellaneousCost = this.textToNumber(miscellaneousCostCurrentSection);
        formState[ctrlName].miscellaneousCost_Round = this.roundofNumber(miscellaneousCostCurrentSection, 2);
        if (this.selectedCustomer.IsRebatesApplicable) {
            let rebateCharges = this.selectedCustomer.RebatesPercentage; //RebatesPercentage
            let rebateValue = formState[ctrlName].submitedRate * (rebateCharges / 100);
            actualCostValue = actualCostValue + rebateValue;
            // // 11 july 2024
            // actualCostDollorValue = actualCostDollorValue + rebateValue;
            // // ----------------
            formState[ctrlName].t12month18montRebate = this.textToNumber(rebateValue);
            formState[ctrlName].t12month18montRebate_Round = this.roundofNumber(rebateValue, 2);
        }
        if (ctrlName == "Salary") {
            actualCostValue = actualCostValue / 1800;
            // // 11 july 2024
            // actualCostDollorValue = actualCostDollorValue/1800
            // // ----
            minSellPrice = this.roundofNumber(actualCostValue, 2) * (1 + currentStateMinMarkup / 100);
            prefSellPrHr = this.roundofNumber(actualCostValue, 2) * (1 + currentStatePrefMinMarkup / 100);
        }
        else {
            minSellPrice = actualCostValue * (1 + currentStateMinMarkup / 100);
            prefSellPrHr = actualCostValue * (1 + currentStatePrefMinMarkup / 100);
        }
        formState[ctrlName].additionalCost = this.textToNumber(additionalCostCurrentSection);
        formState[ctrlName].additionalCost_Round = this.roundofNumber(additionalCostCurrentSection, 2);
        
        // 11 july 2024
        formState[ctrlName].additionalCostDollor = this.textToNumber(additionalCostDollorCurrentSection);
        formState[ctrlName].additionalCostDollor_Round = this.roundofNumber(additionalCostDollorCurrentSection, 2);
        //--------------

        formState[ctrlName].actualCost = this.textToNumber(actualCostValue);
        formState[ctrlName].actualCost_Round = this.roundofNumber(actualCostValue, 2);


        formState[ctrlName].minsellPriceHr = this.textToNumber(minSellPrice);
        formState[ctrlName].minsellPriceHr_Round = this.roundofNumber(minSellPrice, 2);
        
        formState[ctrlName].minsellPriceHrPlusFee = this.textToNumber(minSellPrice + (minSellPrice * processingCharges));
        formState[ctrlName].minsellPriceHrPlusFee_Round = this.roundofNumber(minSellPrice + (minSellPrice * processingCharges), 2);
        
        formState[ctrlName].preferredsellPriceHr = this.textToNumber(prefSellPrHr);
        formState[ctrlName].preferredsellPriceHr_Round = this.roundofNumber(prefSellPrHr, 2);
        
        formState[ctrlName].preferredsellPriceHrPlusFee = this.textToNumber(prefSellPrHr + (prefSellPrHr * processingCharges));
        formState[ctrlName].preferredsellPriceHrPlusFee_Round = this.roundofNumber(prefSellPrHr + (prefSellPrHr * processingCharges), 2);
        
        formState[ctrlName].whatSynergyGets =this.textToNumber(whatSynergyGetsValue);
        formState[ctrlName].whatSynergyGets_Round = this.roundofNumber(whatSynergyGetsValue, 2);
        let finalPercentageValue = formState[ctrlName].actualCost != 0 ? (formState[ctrlName].whatSynergyGets - formState[ctrlName].actualCost) / formState[ctrlName].actualCost : 0;
        //finalPercentageValue = this.roundofNumber(finalPercentageValue, 2) * 100;
        finalPercentageValue = finalPercentageValue * 100;
        formState[ctrlName].profitMarginPay = finalPercentageValue.toFixed(2);
        formState[ctrlName].profitMarginPay_Round = finalPercentageValue.toFixed(2);
        this.setState(formState);
    }
    public textToNumber = (value) => {
        let num: any = value;
        return Number(num);
    }
    public roundofNumber = (value, decimals) => {
        let num: any = value + 'e' + decimals;
        var finalValue:any=Number(Math.fround(num) + 'e-' + decimals);
        return finalValue.toFixed(decimals);
    }
    public handleKeyDown = (e) => {
        var value = e.target.value;
        if (!['', null, undefined].includes(value)) {
            value = value.replace('$', '');
            value = value.replace(/,/g, "");
        }
        if (isNaN(value)) {
            e.preventDefault();
        }
    }
    public prepareCalculatorTable = () => {
        if (this.selectedCustomer == undefined || Object.keys(this.selectedCustomer).length < 1)
            return false;
        let isIndepSub = this.selectedCustomer.IsIndepSub;
        let isSalary = this.selectedCustomer.IsSalary;
        let isW2Hourly = this.selectedCustomer.IsW2Hourly;
        let isW2HourlyPlus = this.selectedCustomer.IsW2HourlyPlus;
        let tdOptions = {};
        if (isIndepSub) {
            tdOptions['Indep/Sub'] = 'Indep';
        }
        if (isW2Hourly) {
            tdOptions['W2-Hourly'] = 'W2Hourly';
        }
        if (isW2HourlyPlus) {
            tdOptions['W2-Hourly-Plus'] = 'W2HourlyPlus';
        }
        if (isSalary) {
            tdOptions['Salary'] = 'Salary';
        }
        let tBody = <div className="border mt-2 rounded table-responsive outer-div"><table className="custom-table mb-1 table">
            <thead>
                <tr>
                    <th></th>
                    {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => { return <th className={key=="Salary"?"w-20":"w-15"}>{key}</th>; }) : null}
                </tr>
            </thead>
            <tbody className="">
                <tr className="input-bg-color">
                    <td className="font-weight-bold">Input Candidate Pay</td>
                    {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => {
                        return <td><label className="pt-2 pr-1">$</label><CurrencyFormat onChange={this.handleChange} name={"candidatepay_" + key} onKeyDown={this.handleKeyDown} decimalScale={2} value={this.state[key].cPay} className="form-control w-td-align" thousandSeparator={true} />
                            {/* <input name={"candidatepay_" + key} className="form-control" onChange={this.handleChange} placeholder="" value={this.state[key].cPay} type="text" /> */}
                        </td>;
                    }) : null}
                </tr>
                <tr className="input-bg-color">
                    <td className="font-weight-bold">Input Submitted Rate</td>
                    {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => { return <td><label className="pt-2 pr-1">$</label><CurrencyFormat name={"submittedrate_" + key} decimalScale={2} className="form-control w-td-align" onKeyDown={this.handleKeyDown} value={this.state[key].submitedRate} onChange={this.handleChange} thousandSeparator={true} /></td>; }) : null}
                </tr>
                <tr className="font-weight-bold tr-color-sp">
                    <td>What Synergy Gets</td>
                    {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => { return <td><span className="dollar font-color">&#x00024;</span><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state[key] ? this.state[key].whatSynergyGets_Round : null} className="font-color"/></td>; }) : null}
                </tr>
                <tr>
                    <td className="">Additional Cost</td>
                    {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => { return <td><span className="dollar">&#x00024;</span><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state[key] ? this.state[key].additionalCost_Round : null} /></td>; }) : null}
                </tr>
                {/* 11 july 2024 */}
                <tr>
                    <td className="">Additional Cost in Dollars ($)</td>
                    {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => { return <td><span className="dollar">&#x00024;</span><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state[key] ? this.state[key].additionalCostDollor_Round : null} /></td>; }) : null}
                </tr>
                {/* ---------  */}
                {this.selectedCustomer.IsRebatesApplicable ?
                    <tr>
                        <td className="font-weight-bold">12 Month &amp; 18 Month Rebates</td>
                        {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => { return <td><span className="dollar">&#x00024;</span><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state[key] ? this.state[key].t12month18montRebate_Round : null} /></td>; }) : null}
                    </tr> : null
                }
                <tr>
                    <td className="">Miscellaneous Cost</td>
                    {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => { return <td><span className="dollar">&#x00024;</span><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state[key] ? this.state[key].miscellaneousCost_Round : null} /></td>; }) : null}
                </tr>
                {/* {this.state.category == "Immigrant" ?
                    <tr>
                        <td className="font-weight-bold">Miscellaneous Cost</td>
                        {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => { return <td><span className="dollar">&#x00024;</span><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state[key] ? this.state[key].miscellaneousCost : null} /></td>; }) : null}
                    </tr> : null
                } */}
                <tr>
                    <td className="">Actual Cost</td>
                    {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => { return <td><span className="dollar">&#x00024;</span><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state[key] ? this.state[key].actualCost_Round : null} /></td>; }) : null}
                </tr>
                <tr>
                    <td className="">Min. % Markup</td>
                    {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => { return <td><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state[key] ? this.state[key].minPerMarkup : null} />%</td>; }) : null}
                </tr>
                <tr className="label-bg-color">
                    <td className="">Min. Sell Price/hr</td>
                    {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => { return <td><span className="dollar">&#x00024;</span><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state[key] ? this.state[key].minsellPriceHr_Round : null} /></td>; }) : null}
                </tr>
                <tr className="label-bg-color">
                    <td className="">Min. Sell Price/hr + fee</td>
                    {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => { return <td><span className="dollar">&#x00024;</span><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state[key] ? this.state[key].minsellPriceHrPlusFee_Round : null} /></td>; }) : null}
                </tr>
                <tr>
                    <td className="">Preferred Markup</td>
                    {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => { return <td><span id="">{this.state[key] ? this.state[key].preferredMarkup : null}</span>%</td>; }) : null}
                </tr>
                <tr className="">
                    <td className="">Preferred Sell Price/hr</td>
                    {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => { return <td><span className="dollar">&#x00024;</span><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state[key] ? this.state[key].preferredsellPriceHr_Round : null} /></td>; }) : null}
                </tr>
                <tr className="">
                    <td className="">Preferred Sell Price/hr + fee</td>
                    {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => { return <td><span className="dollar">&#x00024;</span><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state[key] ? this.state[key].preferredsellPriceHrPlusFee_Round : null} /></td>; }) : null}
                </tr>
                <tr className="font-weight-bold tr-color-sp">
                    <td>Profit Margin Pay vs. Rate:</td>
                    {Object.keys(tdOptions).length > 0 ? Object.keys(tdOptions).map((key) => { return <td className={this.state[key].profitMarginPay>=0?"font-color":"fred"}><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state[key] ? this.state[key].profitMarginPay : null} />%</td>; }) : null}
                </tr>
                {console.log("Object Printing",Object.keys(tdOptions))}
            </tbody>
        </table></div>;

        return tBody;
    }
    public bindItemsToDropdown = (ctrlName, items, optionText, optionValue) => {
        let list = items.map((item) => {
            return (
                <option value={item[optionValue]}>{item[optionText]}</option>
            );
        });
        return (<select className="form-control select" onChange={this.customerDropdownChange} name={ctrlName}><option value="None">None</option>{list}</select>);
    }
    public immcalculations=(ctrlName,processingCharges,immigrationCostCurrentSection,miscellaneousCostCurrentSection,formState) =>{
        formState[ctrlName].miscellaneousCost = this.roundofNumber(miscellaneousCostCurrentSection, 2);
        if(this.state.isImmigrantChecked)
        formState[ctrlName].actualCost = this.roundofNumber(formState[ctrlName].actualCost + immigrationCostCurrentSection, 2);
        else
        formState[ctrlName].actualCost = this.roundofNumber(formState[ctrlName].actualCost - immigrationCostCurrentSection, 2);
        let finalPercentageValue = formState[ctrlName].actualCost != 0 ? (formState[ctrlName].whatSynergyGets - formState[ctrlName].actualCost) / formState[ctrlName].actualCost : 0;
        finalPercentageValue = finalPercentageValue * 100;
        formState[ctrlName].profitMarginPay = this.roundofNumber(finalPercentageValue, 2);
        let currentStateMinMarkup = formState[ctrlName].minPerMarkup;
        let currentStatePrefMinMarkup = formState[ctrlName].preferredMarkup;
        let minSellPrice = formState[ctrlName].actualCost * (1 + currentStateMinMarkup / 100);
        let prefSellPrHr = formState[ctrlName].actualCost * (1 + currentStatePrefMinMarkup / 100);
        formState[ctrlName].minsellPriceHr = this.roundofNumber(minSellPrice,2);
        formState[ctrlName].minsellPriceHrPlusFee = this.roundofNumber(minSellPrice + (minSellPrice * processingCharges), 2);
        formState[ctrlName].preferredsellPriceHr = this.roundofNumber(prefSellPrHr, 2);
        formState[ctrlName].preferredsellPriceHrPlusFee = this.roundofNumber(prefSellPrHr + (prefSellPrHr * processingCharges), 2);
        return formState;
    }
    public updateCalTable = () =>{
        const formState = { ...this.state.data };
            let isIndepSub = this.selectedCustomer.IsIndepSub;
            let isSalary = this.selectedCustomer.IsSalary;
            let isW2Hourly = this.selectedCustomer.IsW2Hourly;
            let isW2HourlyPlus = this.selectedCustomer.IsW2HourlyPlus;
            let processingCharges = (this.selectedCustomer.ProcessingCharges != '' && this.selectedCustomer.ProcessingCharges != '0') ? parseFloat(this.selectedCustomer.ProcessingCharges) / 100 : 0;
        //Miscellaneous Cost
        if(this.state.isImmigrantChecked){
            if(isIndepSub && (formState["Indep/Sub"].cPay !=0 || formState["Indep/Sub"].submitedRate !=0)){
                let immigrationCostListItemValue = this.selectedCustomer.ImmigrationCost_IndepSub;
                let immigrationCostCurrentSection = !['0', '', null, undefined].includes(immigrationCostListItemValue) ? parseFloat(immigrationCostListItemValue) : 0;
                let mislaneousCostListItemValue = this.selectedCustomer.MiscellaneousCost_IndepSub;
                let miscellaneousCostCurrentSection = !['0', '', null, undefined].includes(mislaneousCostListItemValue) ? ((parseFloat(mislaneousCostListItemValue)) * formState["Indep/Sub"].cPay)/100 : 0;
                miscellaneousCostCurrentSection = miscellaneousCostCurrentSection+immigrationCostCurrentSection;
                this.immcalculations("Indep/Sub",processingCharges,immigrationCostCurrentSection,miscellaneousCostCurrentSection,formState);
               
            }
            if(isW2Hourly && (formState["W2-Hourly"].cPay !=0 || formState["W2-Hourly"].submitedRate !=0)){
                let immigrationCostListItemValue = this.selectedCustomer.ImmigrationCost_W2Hourly;
                let immigrationCostCurrentSection = !['0', '', null, undefined].includes(immigrationCostListItemValue) ? parseFloat(immigrationCostListItemValue) : 0;
                let mislaneousCostListItemValue = this.selectedCustomer.MiscellaneousCost_W2Hourly;
                let miscellaneousCostCurrentSection = !['0', '', null, undefined].includes(mislaneousCostListItemValue) ? ((parseFloat(mislaneousCostListItemValue)) * formState["W2-Hourly"].cPay)/100 : 0;
                miscellaneousCostCurrentSection = miscellaneousCostCurrentSection+immigrationCostCurrentSection;
                this.immcalculations("W2-Hourly",processingCharges,immigrationCostCurrentSection,miscellaneousCostCurrentSection,formState);
                
            }
            if(isW2HourlyPlus && (formState["W2-Hourly-Plus"].cPay !=0 || formState["W2-Hourly-Plus"].submitedRate !=0)){
                let immigrationCostListItemValue = this.selectedCustomer.ImmigrationCost_W2HourlyPlus;
                let immigrationCostCurrentSection = !['0', '', null, undefined].includes(immigrationCostListItemValue) ? parseFloat(immigrationCostListItemValue) : 0;
                let mislaneousCostListItemValue = this.selectedCustomer.MiscellaneousCost_W2HourlyPlus;
                let miscellaneousCostCurrentSection = !['0', '', null, undefined].includes(mislaneousCostListItemValue) ? ((parseFloat(mislaneousCostListItemValue)) * formState["W2-Hourly-Plus"].cPay)/100 : 0;
                miscellaneousCostCurrentSection = miscellaneousCostCurrentSection+immigrationCostCurrentSection;
                this.immcalculations("W2-Hourly-Plus",processingCharges,immigrationCostCurrentSection,miscellaneousCostCurrentSection,formState);
                
            }
            if(isSalary && (formState["Salary"].cPay !=0 || formState["Salary"].submitedRate !=0)){
                let immigrationCostListItemValue = this.selectedCustomer.ImmigrationCost_Salary;
                let immigrationCostCurrentSection = !['0', '', null, undefined].includes(immigrationCostListItemValue) ? parseFloat(immigrationCostListItemValue) : 0;
                let mislaneousCostListItemValue = this.selectedCustomer.MiscellaneousCost_Salary;
                let miscellaneousCostCurrentSection = !['0', '', null, undefined].includes(mislaneousCostListItemValue) ? ((parseFloat(mislaneousCostListItemValue)) * formState["Salary"].cPay)/100 : 0;
                miscellaneousCostCurrentSection = miscellaneousCostCurrentSection+immigrationCostCurrentSection;
                
                formState["Salary"].miscellaneousCost = this.roundofNumber(miscellaneousCostCurrentSection, 2);
                formState["Salary"].actualCost = this.roundofNumber(formState["Salary"].actualCost + (immigrationCostCurrentSection/1800), 2);
                let finalPercentageValue = formState["Salary"].actualCost != 0 ? (formState["Salary"].whatSynergyGets - formState["Salary"].actualCost) / formState["Salary"].actualCost : 0;
                finalPercentageValue = finalPercentageValue * 100;
                formState["Salary"].profitMarginPay = this.roundofNumber(finalPercentageValue, 2);
                let currentStateMinMarkup = formState["Salary"].minPerMarkup;
                let currentStatePrefMinMarkup = formState["Salary"].preferredMarkup;
                let actualCostValue = formState["Salary"].actualCost;
                let minSellPrice = actualCostValue * (1 + currentStateMinMarkup / 100);
                let prefSellPrHr = actualCostValue * (1 + currentStatePrefMinMarkup / 100);
                formState["Salary"].minsellPriceHr = this.roundofNumber(minSellPrice,2);
                formState["Salary"].minsellPriceHrPlusFee = this.roundofNumber(minSellPrice + (minSellPrice * processingCharges), 2);
                formState["Salary"].preferredsellPriceHr = this.roundofNumber(prefSellPrHr, 2);
                formState["Salary"].preferredsellPriceHrPlusFee = this.roundofNumber(prefSellPrHr + (prefSellPrHr * processingCharges), 2);
            }
            console.log(formState);
            this.setState(formState);
        }
        else{
            if(isIndepSub && (formState["Indep/Sub"].cPay !=0 || formState["Indep/Sub"].submitedRate !=0)){
                let immigrationCostListItemValue = this.selectedCustomer.ImmigrationCost_IndepSub;
                let immigrationCostCurrentSection = !['0', '', null, undefined].includes(immigrationCostListItemValue) ? parseFloat(immigrationCostListItemValue) : 0;
                let mislaneousCostListItemValue = this.selectedCustomer.MiscellaneousCost_IndepSub;
                let miscellaneousCostCurrentSection = !['0', '', null, undefined].includes(mislaneousCostListItemValue) ? ((parseFloat(mislaneousCostListItemValue)) * formState["Indep/Sub"].cPay)/100 : 0;
                this.immcalculations("Indep/Sub",processingCharges,immigrationCostCurrentSection,miscellaneousCostCurrentSection,formState);
                
            }
            if(isW2Hourly && (formState["W2-Hourly"].cPay !=0 || formState["W2-Hourly"].submitedRate !=0)){
                let immigrationCostListItemValue = this.selectedCustomer.ImmigrationCost_W2Hourly;
                let immigrationCostCurrentSection = !['0', '', null, undefined].includes(immigrationCostListItemValue) ? parseFloat(immigrationCostListItemValue) : 0;
                let mislaneousCostListItemValue = this.selectedCustomer.MiscellaneousCost_W2Hourly;
                let miscellaneousCostCurrentSection = !['0', '', null, undefined].includes(mislaneousCostListItemValue) ? ((parseFloat(mislaneousCostListItemValue)) * formState["W2-Hourly"].cPay)/100 : 0;
                this.immcalculations("W2-Hourly",processingCharges,immigrationCostCurrentSection,miscellaneousCostCurrentSection,formState);
                
            }
            if(isW2HourlyPlus && (formState["W2-Hourly-Plus"].cPay !=0 || formState["W2-Hourly-Plus"].submitedRate !=0)){
                let immigrationCostListItemValue = this.selectedCustomer.ImmigrationCost_W2HourlyPlus;
                let immigrationCostCurrentSection = !['0', '', null, undefined].includes(immigrationCostListItemValue) ? parseFloat(immigrationCostListItemValue) : 0;
                let mislaneousCostListItemValue = this.selectedCustomer.MiscellaneousCost_W2HourlyPlus;
                let miscellaneousCostCurrentSection = !['0', '', null, undefined].includes(mislaneousCostListItemValue) ? ((parseFloat(mislaneousCostListItemValue)) * formState["W2-Hourly-Plus"].cPay)/100 : 0;
                this.immcalculations("W2-Hourly-Plus",processingCharges,immigrationCostCurrentSection,miscellaneousCostCurrentSection,formState);
                
            }
            if(isSalary && (formState["Salary"].cPay !=0 || formState["Salary"].submitedRate !=0)){
                let immigrationCostListItemValue = this.selectedCustomer.ImmigrationCost_Salary;
                let immigrationCostCurrentSection = !['0', '', null, undefined].includes(immigrationCostListItemValue) ? parseFloat(immigrationCostListItemValue) : 0;
                let mislaneousCostListItemValue = this.selectedCustomer.MiscellaneousCost_Salary;
                let miscellaneousCostCurrentSection = !['0', '', null, undefined].includes(mislaneousCostListItemValue) ? ((parseFloat(mislaneousCostListItemValue)) * formState["Salary"].cPay)/100 : 0;
                // miscellaneousCostCurrentSection = miscellaneousCostCurrentSection-immigrationCostCurrentSection;
                formState["Salary"].miscellaneousCost = this.roundofNumber(miscellaneousCostCurrentSection, 2);
                formState["Salary"].actualCost = this.roundofNumber(formState["Salary"].actualCost - (immigrationCostCurrentSection/1800), 2);
                let finalPercentageValue = formState["Salary"].actualCost != 0 ? (formState["Salary"].whatSynergyGets - formState["Salary"].actualCost) / formState["Salary"].actualCost : 0;
                finalPercentageValue = finalPercentageValue * 100;
                formState["Salary"].profitMarginPay = this.roundofNumber(finalPercentageValue, 2);
                let currentStateMinMarkup = formState["Salary"].minPerMarkup;
                let currentStatePrefMinMarkup = formState["Salary"].preferredMarkup;
                let actualCostValue = formState["Salary"].actualCost;
                let minSellPrice = actualCostValue * (1 + currentStateMinMarkup / 100);
                let prefSellPrHr = actualCostValue * (1 + currentStatePrefMinMarkup / 100);
                formState["Salary"].minsellPriceHr = this.roundofNumber(minSellPrice,2);
                formState["Salary"].minsellPriceHrPlusFee = this.roundofNumber(minSellPrice + (minSellPrice * processingCharges), 2);
                formState["Salary"].preferredsellPriceHr = this.roundofNumber(prefSellPrHr, 2);
                formState["Salary"].preferredsellPriceHrPlusFee = this.roundofNumber(prefSellPrHr + (prefSellPrHr * processingCharges), 2);
            }
            console.log(formState);
            this.setState(formState);
        }
    }
    public render() {
        return (
            <div>
                <div className="container-fluid">
                    <div className="FormContent" id="divContents">
                        {/* <div className="title">Cost Calculator</div>
                        <div className="after-title"></div> */}
                        {this.state.loading && <Loader />}
                        <div className="p-3">
                        <div className="light-box rounded pb-2">
                            <div className="row pt-2 px-2">
                            <div className="col-xl-5">
                                        <div className="light-text">
                                        <label>Client</label>
                                        {this.bindItemsToDropdown('ddlCustomers', this.state.customers, 'Title', 'Id')}
                                        </div>
                            </div>
                            <div className="col-xl-5">
                                <div className="ps-rel-cust">
                                    <div className="">
                                        <label className="lbl-Category">Category</label>
                                    </div>
                                    <div className="box-rel">
                                        <div className="">
                                            <div className="">
                                            <div className="custom-control custom-radio pl-1 custom-control-inline">
                                                    <input id="immigrantradio" onClick={() => {this.setState({ category: 'Immigrant', isImmigrantChecked: true }, () => {this.updateCalTable();});}} checked={this.state.isImmigrantChecked} type="radio" value="Immigrant" name="categoryradio" />
                                                    <label htmlFor="immigrantradio" className="col-form-label ml-2 p-0">Visa-Required</label>
                                                </div>
                                                <div className="custom-control custom-radio custom-control-inline">
                                                    <input id="nonimmigrantradio" onClick={() => {
                                                    this.setState({ category: 'NonImmigrant', isImmigrantChecked: false }, () => {this.updateCalTable(); });  }} checked={!this.state.isImmigrantChecked} type="radio" value="NonImmigrant" name="categoryradio" />
                                                    <label htmlFor="nonimmigrantradio" className="col-form-label ml-2 p-0">No-Visa-Required</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {this.selectedCustomer !=undefined && Object.keys(this.selectedCustomer).length > 0 &&
                        <div className="col-md-2">
                            <button type="button" className="btn btn-submit mt-2" onClick={() => window.print()}><FontAwesomeIcon icon={faPrint}></FontAwesomeIcon> Print</button>
                            {/* <button type="button" className="btn btn-secondary">Clear</button> */}
                        </div>}
                            </div>
                        <div className="">
                            {this.prepareCalculatorTable()}
                        </div>
                        
                    </div>
                    </div>
                </div>
            </div>
            </div>
        );
    }
}

export default Calculator;