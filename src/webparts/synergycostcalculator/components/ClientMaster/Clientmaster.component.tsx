import * as React from 'react';
import { Component } from 'react';
import Loader from '../Shared/Loader';
import ModalPopUp from '../Shared/ModalPopUp';
import TableGenerator from '../Shared/TableGenerator';
// import { ControlType } from './../../Constants/Constants';
// import Formvalidator from './../../Utilities/FormValidator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { NavLink, Redirect } from 'react-router-dom';
import { SPHttpClient, SPHttpClientResponse, SPHttpClientConfiguration } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { sp } from '@pnp/sp';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { Web } from '@pnp/sp/webs';
import '../../CSS/style.css';
// import { ToastProvider,useToasts } from 'react-toast-notifications';


export interface ClientMasterProps {
    match: any;
    spContext: any;
    spHttpClient: SPHttpClient;
    context: WebPartContext;
    history: any;
    // addToast:any;
}
class ClientMaster extends React.Component<ClientMasterProps, {}> {
    public siteURL: string;
    public clientName;
    public processingCharges;
    public rebatesPercentage;
    public itemId;
    constructor(props) {
        super(props);
        this.itemId = this.props.match.params.id;
        sp.setup({
            spfxContext: this.props.context
        });
    }
    public state = {
        formData: {
            Title: '',
            ProcessingCharges: '',
            IsRebatesApplicable: false,
            RebatesPercentage: '',
            IsIndepSub: true,
            IsW2Hourly: true,
            IsW2HourlyPlus: true,
            IsSalary: true,
            AdditionalCost_IndepSub: '',
            AdditionalCost_W2Hourly: '',
            AdditionalCost_W2HourlyPlus: '',
            AdditionalCost_Salary: '',
            // 11 july 2024
            AdditionalCostDolr_IndepSub: '',
            AdditionalCostDolr_W2Hourly: '',
            AdditionalCostDolr_W2HourlyPlus: '',
            AdditionalCostDolr_Salary: '',
            // ----
            MiscellaneousCost_IndepSub: '',
            MiscellaneousCost_W2Hourly: '',
            MiscellaneousCost_W2HourlyPlus: '',
            MiscellaneousCost_Salary: '',
            ImmigrationCost_IndepSub: '',
            ImmigrationCost_W2Hourly: '',
            ImmigrationCost_W2HourlyPlus: '',
            ImmigrationCost_Salary: '',
            MinMarkup_IndepSub: '',
            MinMarkup_W2Hourly: '',
            MinMarkup_W2HourlyPlus: '',
            MinMarkup_Salary: '',
            PreferredMarkup_IndepSub: '',
            PreferredMarkup_W2Hourly: '',
            PreferredMarkup_W2HourlyPlus: '',
            PreferredMarkup_Salary: '',
            Comments:'',
            IsActive: true,
        },
        AllCustomers:[],
        AuditHistory:[],
        SaveUpdateText: 'Submit',
        customersData: [],
        showLabel: false,
        errorMessage: '',
        loading: false,
        showHideModal: false,
        modalText: '',
        modalTitle: '',
        isSuccess: true,
        isListTable: true,
        isRedirect: false
    };
    public componentDidMount() {
        this.setState({ loading: true });
        if (this.itemId != undefined) {
            this.onEditClickHandler(this.itemId);
        }
        else {
            this.loadListData();
        }
    }
    public handleChange = (event) => {
        const formData = { ...this.state.formData };
        const { name } = event.target;
        const value = event.target.type == 'checkbox' ? event.target.checked : event.target.value;

        formData[name] = value;
        this.setState({ formData });
    }
    public handleNumberChange = (event) => {
        const formData = { ...this.state.formData };
        const { name } = event.target;
        const value = event.target.value;
        //  const re = /^[0-9]{10}\.[0-9]{2}$/;
        const re = /^[0-9]*(\.[0-9]{0,2})?$/;
        if (value === '' || (re.test(value) && parseFloat(value) <= 100)) {
            formData[name] = value;
            this.setState({ formData });
        }
    }
    public handleChkChange = (event) => {
        const formData = { ...this.state.formData };
        const { name } = event.target;
        const value = event.target.type == 'checkbox' ? event.target.checked : event.target.value;
        formData[name] = value;
        this.setState({ formData });
        if (!value) {
            let fields = Object.entries(document.getElementsByClassName(name));
            for (const [key] of fields) {
                let field = fields[key][1].name;
                formData[field] = '';
                this.setState({ formData });
            }
        }
    }
    public IsFormValid = () => {
        for (const [key, value] of Object.entries(this.state.formData)) {
            let field = document.getElementsByName(key)[0];
            if (field != undefined && field.attributes.hasOwnProperty('required') && (value == '' || value == null)) {
                this.setState({ showLabel: true, errorMessage: field.attributes.getNamedItem('aria-errormessage').value });
                field.focus();
                return false;
            }
            else if (!this.state.formData.IsIndepSub && !this.state.formData.IsW2Hourly && !this.state.formData.IsW2HourlyPlus && !this.state.formData.IsSalary) {
                this.setState({ showLabel: true, errorMessage: "select atleast one 'Pay Type'" });
                return false;
            }
        }
        return true;
    }
    public handleSubmit = event => {
        event.preventDefault();
        const formData = { ...this.state.formData };
        const id = this.props.match.params.id;
        //const {addToast} = useToasts();
        if (this.IsFormValid()) {
            this.setState({ loading: true });
            // console.log("Client",this.state.formData.Title);
            // console.log("allcustomers",this.state.AllCustomers);
            let ActiveClients = this.state.AllCustomers.filter(item=>{
                return (item.IsActive);
            });
            // console.log("Active Clients",ActiveClients);
            let duplicate = ActiveClients.find(item=>{
               return( item.Title.toLowerCase() ==  this.state.formData.Title);
            });
            // console.log("duplicate",duplicate);
            var query = "(Title eq '" + this.state.formData.Title + "' and IsActive eq 1)" + ((this.props.match.params.id !== undefined && this.props.match.params.id !== '') ? " and ID  ne " + this.props.match.params.id : "");
            sp.web.lists.getByTitle("Customers").items.select("Title", "IsActive", "ID").filter(query).getAll().then((dupres) => {
                if (dupres.length > 0) {
                    this.setState({ showLabel: true, errorMessage: "Client already exists",loading: false });
                    // console.log("duplicate client");
                    return false;
                }
                else {
                    formData.Comments =   !["",null,undefined].includes(formData.Comments)?this.state.formData.Comments.trim():'';
                 let History = this.state.AuditHistory;

                        History.push({
                            User: this.props.spContext.userDisplayName,
                            Comments: formData.Comments,
                            Date: new Date().toISOString()
                        });
                        formData['AuditHistory'] = JSON.stringify(History);
 
                    if (id > 0) {                       //update existing record
                        // console.log(this.props);
                        sp.web.lists.getByTitle('Customers').items.getById(id).update(formData).then((res) => {
                            this.setState({
                                isSuccess: true,
                                modalTitle: 'Updated successfully',
                                modalText: 'Updated successfully',
                                showHideModal: true,
                                isRedirect: true,
                                isListTable: true
                            });
                            setTimeout(() => {
                                document.getElementById("modalclose").click();
                            }, 1000);
                            console.log(res);
                        });
                    }
                    else {                             //Add New record
                        try {
                            this.setState({ loading: true });
                            // console.log(this.state);
                            sp.web.lists.getByTitle('Customers').items.add(formData)
                                .then((res) => {
                                    this.loadListData();
                                    this.resetClientForm();
                                    this.setState({
                                        isSuccess: true,
                                        modalTitle: 'Submitted successfully',
                                        modalText: 'Saved successfully',
                                        showHideModal: true,
                                        isRedirect: true,
                                        isListTable: true
                                    });
                                    setTimeout(() => {
                                        document.getElementById("modalclose").click();
                                    }, 1000);
                                    console.log(res);
                                })
                                .catch((err) => {
                                    console.log('Failed to add');
                                });
                        }
                        catch (e) {
                            console.log(e);
                            this.setState({
                                isSuccess: false,
                                loading: false,
                                modalTitle: 'Error occured',
                                modalText: 'Error occured',
                                showHideModal: true,

                                isListTable: true
                            });
                        }
                    }
                }
            });
        } else {
            this.setState({ showLabel: true });
        }
    }

    public loadListData = () => {
        sp.web.lists.getByTitle('Customers').items.getAll()
            .then((response) => {
                // console.log("response",response);
                this.setState({
                    //customersData: response.sort((a, b) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime()).map(o => ({
                    customersData: response.sort((a, b) => {
                        return a.Title.localeCompare(b.Title);
                    }).map(o => ({
                        Id: o.Id,
                        Title: o.Title,
                        IsIndepSub: o.IsIndepSub,
                        IsW2Hourly: o.IsW2Hourly,
                        IsW2HourlyPlus: o.IsW2HourlyPlus,
                        IsSalary: o.IsSalary,
                        AdditionalCost_IndepSub: o.AdditionalCost_IndepSub,            
                        AdditionalCost_W2Hourly: o.AdditionalCost_W2Hourly,
                        AdditionalCost_W2HourlyPlus: o.AdditionalCost_W2HourlyPlus,
                        AdditionalCost_Salary: o.AdditionalCost_Salary,
                        // 11-july-2024
                        AdditionalCostDolr_IndepSub: o.AdditionalCostDolr_IndepSub,
                        AdditionalCostDolr_W2Hourly: o.AdditionalCostDolr_W2Hourly,
                        AdditionalCostDolr_W2HourlyPlus: o.AdditionalCostDolr_W2HourlyPlus,
                        AdditionalCostDolr_Salary: o.AdditionalCostDolr_Salary,
                        //----
                        MinMarkup_IndepSub: o.MinMarkup_IndepSub,
                        MinMarkup_W2Hourly: o.MinMarkup_W2Hourly,
                        MinMarkup_W2HourlyPlus: o.MinMarkup_W2HourlyPlus,
                        MinMarkup_Salary: o.MinMarkup_Salary,
                        PreferredMarkup_IndepSub: o.PreferredMarkup_IndepSub,
                        PreferredMarkup_W2Hourly: o.PreferredMarkup_W2Hourly,
                        PreferredMarkup_W2HourlyPlus: o.PreferredMarkup_W2HourlyPlus,
                        PreferredMarkup_Salary: o.PreferredMarkup_Salary,
                        MiscellaneousCost_IndepSub: o.MiscellaneousCost_IndepSub,
                        MiscellaneousCost_W2Hourly: o.MiscellaneousCost_W2Hourly,
                        MiscellaneousCost_W2HourlyPlus: o.MiscellaneousCost_W2HourlyPlus,
                        MiscellaneousCost_Salary: o.MiscellaneousCost_Salary,
                        ProcessingCharges: o.ProcessingCharges,
                        IsRebatesApplicable: true,
                        RebatesPercentage: o.RebatesPercentage,
                        Comments:o.Comments,
                        // AuditHistory: o.AuditHistory!=null?JSON.parse(o.AuditHistory):[],
                        IsActive: o.IsActive ? 'Yes' : 'No'
                    })),
                    AllCustomers:response,
                    SaveUpdateText: 'Submit',
                    showLabel: false,
                    loading: false,
                    isRedirect: false
                });
            }).catch(err => {
                console.log('Failed to fetch data.');
                this.setState({
                    loading: false,
                    modalTitle: 'Alert',
                    modalText: 'Error occured',
                    showHideModal: true,
                    isSuccess: false

                });
            });
    }
    public onEditClickHandler = (id) => {
        this.setState({ loading: true });
        // console.log('edit clicked', id);
        try {
            sp.web.lists.getByTitle('Customers').items.getById(id).get()
                .then((response) => {
                    this.setState({
                        formData: {
                            Title: response.Title,
                            ProcessingCharges: response.ProcessingCharges,
                            IsRebatesApplicable: response.IsRebatesApplicable,
                            RebatesPercentage: response.RebatesPercentage,
                            IsIndepSub: response.IsIndepSub,
                            IsW2Hourly: response.IsW2Hourly,
                            IsW2HourlyPlus: response.IsW2HourlyPlus,
                            IsSalary: response.IsSalary,
                            AdditionalCost_IndepSub: response.AdditionalCost_IndepSub,
                            AdditionalCost_W2Hourly: response.AdditionalCost_W2Hourly,
                            AdditionalCost_W2HourlyPlus: response.AdditionalCost_W2HourlyPlus,
                            AdditionalCost_Salary: response.AdditionalCost_Salary,
                            // 11 july 2024
                            AdditionalCostDolr_IndepSub: response.AdditionalCostDolr_IndepSub,
                            AdditionalCostDolr_W2Hourly: response.AdditionalCostDolr_W2Hourly,
                            AdditionalCostDolr_W2HourlyPlus: response.AdditionalCostDolr_W2HourlyPlus,
                            AdditionalCostDolr_Salary: response.AdditionalCostDolr_Salary,    
                            // 
                            MiscellaneousCost_IndepSub: response.MiscellaneousCost_IndepSub,
                            MiscellaneousCost_W2Hourly: response.MiscellaneousCost_W2Hourly,
                            MiscellaneousCost_W2HourlyPlus: response.MiscellaneousCost_W2HourlyPlus,
                            MiscellaneousCost_Salary: response.MiscellaneousCost_Salary,
                            ImmigrationCost_IndepSub: response.ImmigrationCost_IndepSub,
                            ImmigrationCost_W2Hourly: response.ImmigrationCost_W2Hourly,
                            ImmigrationCost_W2HourlyPlus: response.ImmigrationCost_W2HourlyPlus,
                            ImmigrationCost_Salary: response.ImmigrationCost_Salary,
                            MinMarkup_IndepSub: response.MinMarkup_IndepSub,
                            MinMarkup_W2Hourly: response.MinMarkup_W2Hourly,
                            MinMarkup_W2HourlyPlus: response.MinMarkup_W2HourlyPlus,
                            MinMarkup_Salary: response.MinMarkup_Salary,
                            PreferredMarkup_IndepSub: response.PreferredMarkup_IndepSub,
                            PreferredMarkup_W2Hourly: response.PreferredMarkup_W2Hourly,
                            PreferredMarkup_W2HourlyPlus: response.PreferredMarkup_W2HourlyPlus,
                            PreferredMarkup_Salary: response.PreferredMarkup_Salary,
                            // Comments: response.Comments,
                            IsActive: response.IsActive
                        },
                        AuditHistory: response.AuditHistory!=null?JSON.parse(response.AuditHistory):[],
                        SaveUpdateText: 'Update',
                        showLabel: false,
                        isListTable: false,
                        loading: false
                    });
                })
                .catch(e => {
                    console.log('Failed to fetch :' + e);
                });
        }
        catch (e) {
            console.log('failed to fetch data for record :' + id);
        }
    }
    public resetClientForm = () => {
        this.setState({
            formData: {
                Title: '',
                ProcessingCharges: '',
                IsRebatesApplicable: false,
                RebatesPercentage: '',
                IsIndepSub: true,
                IsW2Hourly: true,
                IsW2HourlyPlus: true,
                IsSalary: true,
                AdditionalCost_IndepSub: '',
                AdditionalCost_W2Hourly: '',
                AdditionalCost_W2HourlyPlus: '',
                AdditionalCost_Salary: '',
                // 11 july 2024
                AdditionalCostDolr_IndepSub: '',
                AdditionalCostDolr_W2Hourly: '',
                AdditionalCostDolr_W2HourlyPlus: '',
                AdditionalCostDolr_Salary: '',    
                //
                MiscellaneousCost_IndepSub: '',
                MiscellaneousCost_W2Hourly: '',
                MiscellaneousCost_W2HourlyPlus: '',
                MiscellaneousCost_Salary: '',
                MinMarkup_IndepSub: '',
                MinMarkup_W2Hourly: '',
                MinMarkup_W2HourlyPlus: '',
                MinMarkup_Salary: '',
                PreferredMarkup_IndepSub: '',
                PreferredMarkup_W2Hourly: '',
                PreferredMarkup_W2HourlyPlus: '',
                PreferredMarkup_Salary: '',
                Comments:'',
                IsActive: true
            },
            AuditHistory: [],
            SaveUpdateText: 'Submit'
        });

        // this.props.history.push('/clientmaster');
    }
    public cancelHandler = () => {
        this.setState({ isRedirect: true, SaveUpdateText: 'Submit', isListTable: true, loading: true });
        //this.resetClientForm();
    }
    public addNew = () => {
        this.resetClientForm();
        this.setState({ SaveUpdateText: 'Submit', isListTable: false });
    }
    public handleClose = () => {
        this.setState({ showHideModal: false });
        this.loadListData();
        this.resetClientForm();
    }
    public componentDidUpdate = () => {
        if (this.state.isRedirect) {
            this.loadListData();
        }
    }
    public handleDelete() {
        const id = this.props.match.params.id;
        sp.web.lists.getByTitle('Customers').items.getById(id).delete().then((res) => {
            this.setState({
                isSuccess: true,
                modalTitle: 'Success',
                modalText: 'Deleted successfully',
                showHideModal: true,
                isRedirect: true,
                isListTable: true
            });
            console.log(res);
        });
    }
    public resetRebate = (): void => {
        this.setState({ formData: { RebatesPercentage: '' } });
    }

    private auditHistory = () => {
        let body = [];
        if (this.state.AuditHistory.length > 0) {
            var History = this.state.AuditHistory;
            for (let i = History.length - 1; i >= 0; i--) {
                body.push(<tr>
                    {/* <td className="" >{History[i]["Role"]}</td> */}
                    <td className="" >
                        {History[i]["User"]}
                    </td>
                    <td className="" >
                        {(new Date(History[i]["Date"]).getMonth().toString().length == 1 ? "0" + (new Date(History[i]["Date"]).getMonth() + 1) : new Date(History[i]["Date"]).getMonth() + 1) + "/" + (new Date(History[i]["Date"]).getDate().toString().length == 1 ? "0" + new Date(History[i]["Date"]).getDate() : new Date(History[i]["Date"]).getDate()) + "/" + new Date(History[i]["Date"]).getFullYear()}  {"  " + new Date(History[i]["Date"]).toLocaleString('en-US', { timeZone: 'America/New_York', hour12: false }).split(",")[1]}
                    </td>
                    <td className="" >
                        {History[i]["Comments"]}
                    </td>
                </tr>);
            }
        }
        return body;
    }

    // User: this.props.spContext.userDisplayName,
    //                         Comments: this.state.formData.Comments.trim(),
    //                         Date: new Date().toISOString()

    public render() {
        const columns = [
            {
                name: "Edit",
                selector: "Id",
                export: false,
                // center:true,
                width: "10%",
                cell: record => {
                    return (
                        <React.Fragment>
                            <NavLink title="Edit" className="csrLink ms-draggable" to={`/clientmaster/${record.Id}`}>
                                <div style={{ textAlign: "center" }}>
                                    <FontAwesomeIcon icon={faEdit} onClick={() => { this.onEditClickHandler(record.Id); }}></FontAwesomeIcon></div>
                            </NavLink>
                        </React.Fragment>
                    );
                }
            },
            {
                name: "Client",
                selector: "Title",
                sortable: true,
                width: "30%",
            },
            {
                name: "Processing Charges",
                selector: "ProcessingCharges",
                sortable: true
            },
            {
                name: "12 Month & 18 Month Rebates",
                selector: "RebatesPercentage",
                sortable: true
            },
            {
                name: "Comments",
                selector: "Comments",
                sortable: true
            },
            {
                name: "Active",
                selector: "IsActive",
                sortable: true
            }
        ];
        if (this.state.isRedirect) {
            return <Redirect to="/clientmaster" />;
        }
        return (
            <React.Fragment>
                <ModalPopUp title={this.state.modalTitle} modalText={this.state.modalText} isVisible={this.state.showHideModal} onClose={this.handleClose} isSuccess={this.state.isSuccess}></ModalPopUp>
                {!this.state.isListTable &&
                    <div className="container-fluid">
                        <div className="FormContent p-4">
                            <div className="title">Client</div>
                            <div className="after-title"></div>
                            {this.state.loading && <Loader />}
                            <div className="pt-1">
                                {/* <div className="light-box border-box-shadow m-2 p-2"> */}
                                <div className="row">
                                    <div className="col-md-8">
                                        <div className="lig-light-box p-2 mb-3">
                                        <div className="row">
                                            <div className="col-md-8">
                                                <div className="light-text hh-45">
                                                    <label>Client <span className="mandatoryhastrick">*</span></label>
                                                    <input className="form-control" onChange={this.handleChange} name='Title' value={this.state.formData.Title || ''} placeholder="" type="text" required aria-errormessage="'Client Name' cannot be blank." maxLength={255} />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="light-text hh-45">
                                                    <div className="custom-control custom-checkbox ml-1">
                                                        <input type="checkbox" className="custom-control-input" id="chkIsActive" name='IsActive' onChange={this.handleChange} checked={this.state.formData.IsActive} />
                                                        <label className="custom-control-label ml-2 mt-3" htmlFor="chkIsActive">Active</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="light-text mt-2">
                                            <label>Processing Percentage <span className="mandatoryhastrick">*</span></label>
                                            <input className="form-control" onChange={this.handleNumberChange} name='ProcessingCharges' value={this.state.formData.ProcessingCharges || ''} placeholder="" type="text" required aria-errormessage="'Processing Percentage' cannot be blank." maxLength={5} />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="light-text">
                                            <div className="custom-control custom-checkbox ml-3">
                                                <input type="checkbox" className="custom-control-input" id="chkRebates" name='IsRebatesApplicable' onChange={this.handleChkChange} checked={this.state.formData.IsRebatesApplicable} />
                                                <label className="custom-control-label ml-2 mt-3" htmlFor="chkRebates">Is 12 Month & 18 Month Rebates Applicable</label>
                                            </div>
                                        </div>        
                                    </div>
                                    {this.state.formData.IsRebatesApplicable &&
                                        <div className="col-md-4">
                                            <div className="light-text">
                                                <label className="col-form-label">Rebates percentage <span className='mandatoryhastrick'>*</span></label>
                                                <input className="form-control IsRebatesApplicable" onChange={this.handleNumberChange} name='RebatesPercentage' value={this.state.formData.RebatesPercentage || ''} placeholder="" type="text" required aria-errormessage="'Rebates percentage' cannot be blank." maxLength={5} />
                                            </div>
                                        </div>
                                    }
                                       <div className="col-sm-8">
                                                        <div className="light-text height-auto">
                                                            <label className="floatingTextarea2 top-11" id='txtClientComments'>Comments</label>
                                                            <textarea className="position-static form-control requiredinput mt-3" onChange={this.handleChange} value={this.state.formData.Comments} maxLength={500} id="txtComments" name="Comments" disabled={false} title='Comments'></textarea>
                                                        </div>
                                                    </div>
                                    <div className="col-sm-12">
                                        <div className="mt-1 px-3">
                                            <div className="row">
                                                <div className="col-2 px-1">
                                                    <div className="col-form-label font-weight-bold">Pay Type <span className='mandatoryhastrick'>*</span></div>
                                                </div>
                                                <div className="col-10 mt-2">
                                                    <div className="row">
                                                        <div className="col-12 col-sm-6 col-lg-3">
                                                            <div className="custom-control custom-checkbox">
                                                                <input type="checkbox" className="custom-control-input" id="chkIndep" name='IsIndepSub' onChange={this.handleChkChange} checked={this.state.formData.IsIndepSub} />
                                                                <label className="custom-control-label" htmlFor="chkIndep">Indep/sub</label>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-sm-6 col-lg-3">
                                                            <div className="custom-control custom-checkbox">
                                                                <input type="checkbox" className="custom-control-input" id="chkhourly" name='IsW2Hourly' onChange={this.handleChkChange} checked={this.state.formData.IsW2Hourly} />
                                                                <label className="custom-control-label" htmlFor="chkhourly">W2-Hourly</label>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-sm-6 col-lg-3">
                                                            <div className="custom-control custom-checkbox">
                                                                <input type="checkbox" className="custom-control-input" id="chkhourlyplus" name='IsW2HourlyPlus' onChange={this.handleChkChange} checked={this.state.formData.IsW2HourlyPlus} />
                                                                <label className="custom-control-label" htmlFor="chkhourlyplus">W2-Hourly Plus</label>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-sm-6 col-lg-3">
                                                            <div className="custom-control custom-checkbox">
                                                                <input type="checkbox" className="custom-control-input" id="chksalary" name='IsSalary' onChange={this.handleChkChange} checked={this.state.formData.IsSalary} />
                                                                <label className="custom-control-label" htmlFor="chksalary">Salary</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="table-responsive rounded mt-3">
                                    <table className="table c-table custom-table mb-0">
                                        <thead>
                                            <tr>
                                                <th className="w-35"></th>
                                                {this.state.formData.IsIndepSub && <th>Indep/sub <span className='mandatoryhastrick'>*</span></th>}
                                                {this.state.formData.IsW2Hourly && <th>W2-hourly <span className='mandatoryhastrick'>*</span></th>}
                                                {this.state.formData.IsW2HourlyPlus && <th>W2-Hourly Plus <span className='mandatoryhastrick'>*</span></th>}
                                                {this.state.formData.IsSalary && <th>Salary <span className='mandatoryhastrick'>*</span></th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="pl-3">Additional Cost (%)</td>
                                                {this.state.formData.IsIndepSub && <td><input className="form-control IsIndepSub" onChange={this.handleNumberChange} name='AdditionalCost_IndepSub' value={this.state.formData.AdditionalCost_IndepSub || ''} placeholder="" type="text" required aria-errormessage="'Indep/Sub - Additional Cost' cannot be blank." maxLength={5} /></td>}
                                                {this.state.formData.IsW2Hourly && <td><input className="form-control IsW2Hourly" onChange={this.handleNumberChange} name='AdditionalCost_W2Hourly' value={this.state.formData.AdditionalCost_W2Hourly || ''} placeholder="" type="text" required aria-errormessage="'W2-Hourly - Additional Cost' cannot be blank." maxLength={5} /></td>}
                                                {this.state.formData.IsW2HourlyPlus && <td><input className="form-control IsW2HourlyPlus" onChange={this.handleNumberChange} name='AdditionalCost_W2HourlyPlus' value={this.state.formData.AdditionalCost_W2HourlyPlus || ''} placeholder="" type="text" required aria-errormessage="'W2-Hourly Plus - Additional Cost' cannot be blank." maxLength={5} /></td>}
                                                {this.state.formData.IsSalary && <td><input className="form-control IsSalary" onChange={this.handleNumberChange} name='AdditionalCost_Salary' value={this.state.formData.AdditionalCost_Salary || ''} placeholder="" type="text" required aria-errormessage="'Salary - Additional Cost' cannot be blank." maxLength={5} /></td>}
                                            </tr>
                                            {/* 11 july 2024 */}
                                            <tr>
                                                <td className="pl-3">Additional Cost in Dollars ($)</td>
                                                {this.state.formData.IsIndepSub && <td><input className="form-control IsIndepSub" onChange={this.handleNumberChange} name='AdditionalCostDolr_IndepSub' value={this.state.formData.AdditionalCostDolr_IndepSub || ''} placeholder="" type="text" required aria-errormessage="'Indep/Sub - Additional Cost in Dollars ($)' cannot be blank." maxLength={5} /></td>}
                                                {this.state.formData.IsW2Hourly && <td><input className="form-control IsW2Hourly" onChange={this.handleNumberChange} name='AdditionalCostDolr_W2Hourly' value={this.state.formData.AdditionalCostDolr_W2Hourly || ''} placeholder="" type="text" required aria-errormessage="'W2-Hourly - Additional Cost in Dollars ($)' cannot be blank." maxLength={5} /></td>}
                                                {this.state.formData.IsW2HourlyPlus && <td><input className="form-control IsW2HourlyPlus" onChange={this.handleNumberChange} name='AdditionalCostDolr_W2HourlyPlus' value={this.state.formData.AdditionalCostDolr_W2HourlyPlus || ''} placeholder="" type="text" required aria-errormessage="'W2-Hourly Plus - Additional Cost in Dollars ($)' cannot be blank." maxLength={5} /></td>}
                                                {this.state.formData.IsSalary && <td><input className="form-control IsSalary" onChange={this.handleNumberChange} name='AdditionalCostDolr_Salary' value={this.state.formData.AdditionalCostDolr_Salary || ''} placeholder="" type="text" required aria-errormessage="'Salary - Additional Cost ($)' cannot be blank." maxLength={5} /></td>}
                                            </tr>
                                            {/* ---------------- */}
                                            <tr>
                                                <td className="pl-3">Miscellaneous Cost (%)</td>
                                                {this.state.formData.IsIndepSub && <td><input className="form-control IsIndepSub" onChange={this.handleNumberChange} name='MiscellaneousCost_IndepSub' value={this.state.formData.MiscellaneousCost_IndepSub || ''} placeholder="" type="text" required aria-errormessage="'Indep/Sub - Miscellaneous Cost' cannot be blank." maxLength={5} /></td>}
                                                {this.state.formData.IsW2Hourly && <td><input className="form-control IsW2Hourly" onChange={this.handleNumberChange} name='MiscellaneousCost_W2Hourly' value={this.state.formData.MiscellaneousCost_W2Hourly || ''} placeholder="" type="text" required aria-errormessage="'W2-Hourly - Miscellaneous Cost' cannot be blank." maxLength={5} /></td>}
                                                {this.state.formData.IsW2HourlyPlus &&
                                                    <td><input className="form-control IsW2HourlyPlus" onChange={this.handleNumberChange} name='MiscellaneousCost_W2HourlyPlus' value={this.state.formData.MiscellaneousCost_W2HourlyPlus || ''} placeholder="" type="text" required aria-errormessage="'W2-Hourly Plus - Miscellaneous Cost' cannot be blank." maxLength={5} /></td>}
                                                {this.state.formData.IsSalary && <td><input className="form-control IsSalary" onChange={this.handleNumberChange} name='MiscellaneousCost_Salary' value={this.state.formData.MiscellaneousCost_Salary || ''} placeholder="" type="text" required aria-errormessage="'Salary - Miscellaneous Cost' cannot be blank." maxLength={5} /></td>}
                                            </tr>
                                            <tr>
                                                <td className="pl-3">Immigration Cost ($)</td>
                                                {this.state.formData.IsIndepSub && <td><input className="form-control IsIndepSub" onChange={this.handleNumberChange} name='ImmigrationCost_IndepSub' value={this.state.formData.ImmigrationCost_IndepSub || ''} placeholder="" type="text" required aria-errormessage="'Indep/Sub - Immigration Cost' cannot be blank." maxLength={6} /></td>}
                                                {this.state.formData.IsW2Hourly && <td><input className="form-control IsW2Hourly" onChange={this.handleNumberChange} name='ImmigrationCost_W2Hourly' value={this.state.formData.ImmigrationCost_W2Hourly || ''} placeholder="" type="text" required aria-errormessage="'W2-Hourly - Immigration Cost' cannot be blank." maxLength={6} /></td>}
                                                {this.state.formData.IsW2HourlyPlus &&
                                                    <td><input className="form-control IsW2HourlyPlus" onChange={this.handleNumberChange} name='ImmigrationCost_W2HourlyPlus' value={this.state.formData.ImmigrationCost_W2HourlyPlus || ''} placeholder="" type="text" required aria-errormessage="'W2-Hourly Plus - Immigration Cost' cannot be blank." maxLength={6} /></td>}
                                                {this.state.formData.IsSalary && <td><input className="form-control IsSalary" onChange={this.handleNumberChange} name='ImmigrationCost_Salary' value={this.state.formData.ImmigrationCost_Salary || ''} placeholder="" type="text" required aria-errormessage="'Salary - Immigration Cost' cannot be blank." maxLength={6} /></td>}
                                            </tr>
                                            <tr>
                                                <td className="pl-3">Min. % Markup</td>
                                                {this.state.formData.IsIndepSub && <td><input className="form-control IsIndepSub" onChange={this.handleNumberChange} name='MinMarkup_IndepSub' value={this.state.formData.MinMarkup_IndepSub || ''} placeholder="" type="text" required aria-errormessage="'Indep/Sub - Min. % Markup' cannot be blank." maxLength={5} /></td>}
                                                {this.state.formData.IsW2Hourly && <td><input className="form-control IsW2Hourly" onChange={this.handleNumberChange} name='MinMarkup_W2Hourly' value={this.state.formData.MinMarkup_W2Hourly || ''} placeholder="" type="text" required aria-errormessage="'W2-Hourly - Min. % Markup' cannot be blank." maxLength={5} /></td>}
                                                {this.state.formData.IsW2HourlyPlus &&
                                                    <td><input className="form-control IsW2HourlyPlus" onChange={this.handleNumberChange} name='MinMarkup_W2HourlyPlus' value={this.state.formData.MinMarkup_W2HourlyPlus || ''} placeholder="" type="text" required aria-errormessage="'W2-Hourly Plus - Min. % Markup' cannot be blank." maxLength={5} /></td>}
                                                {this.state.formData.IsSalary && <td><input className="form-control IsSalary" onChange={this.handleNumberChange} name='MinMarkup_Salary' value={this.state.formData.MinMarkup_Salary || ''} placeholder="" type="text" required aria-errormessage="'Salary - Min. % Markup' cannot be blank." maxLength={5} /></td>}
                                            </tr>
                                            <tr>
                                                <td className="pl-3">Preferred % Markup</td>
                                                {this.state.formData.IsIndepSub && <td><input className="form-control IsIndepSub" onChange={this.handleNumberChange} name='PreferredMarkup_IndepSub' value={this.state.formData.PreferredMarkup_IndepSub || ''} placeholder="" type="text" required aria-errormessage="'Indep/Sub - Preferred % Markup' cannot be blank." maxLength={5} /></td>}
                                                {this.state.formData.IsW2Hourly && <td><input className="form-control IsW2Hourly" onChange={this.handleNumberChange} name='PreferredMarkup_W2Hourly' value={this.state.formData.PreferredMarkup_W2Hourly || ''} placeholder="" type="text" required aria-errormessage="'W2-Hourly - Preferred % Markup' cannot be blank." maxLength={5} /></td>}
                                                {this.state.formData.IsW2HourlyPlus &&
                                                    <td><input className="form-control IsW2HourlyPlus" onChange={this.handleNumberChange} name='PreferredMarkup_W2HourlyPlus' value={this.state.formData.PreferredMarkup_W2HourlyPlus || ''} placeholder="" type="text" required aria-errormessage="'W2-Hourly Plus - Preferred % Markup' cannot be blank." maxLength={5} /></td>}
                                                {this.state.formData.IsSalary && <td><input className="form-control IsSalary" onChange={this.handleNumberChange} name='PreferredMarkup_Salary' value={this.state.formData.PreferredMarkup_Salary || ''} placeholder="" type="text" required aria-errormessage="'Salary - Preferred % Markup' cannot be blank." maxLength={5} /></td>}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                {this.state.showLabel &&
                                    <div>
                                        <span className='text-validator'> {this.state.errorMessage}</span>
                                    </div>
                                }
                                <div className="col-sm-12 text-center button-area">
                                    <button type="button" onClick={this.handleSubmit} className="btn btn-submit">Submit</button>
                                    <button type="button" onClick={this.cancelHandler} className="btn btn-secondary">Cancel</button>
                                </div>
                                {this.state.AuditHistory.length > 0 ? <><div className="p-2">
                                    <h4>History</h4>
                                </div><div>
                                        <table className="table table-bordered m-0 timetable">
                                            <thead style={{ borderBottom: "4px solid #444444" }}>
                                                <tr>
                                                    {/* <th className="">Action By</th> */}
                                                    <th className="" style={{ width: '250px' }}>Action By</th>
                                                    {/* <th className="" style={{ width: '150px' }}>Status</th> */}
                                                    <th className="" style={{ width: '250px' }}>Date & Time (EST)</th>
                                                    <th className="">Comments</th>
 
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.auditHistory()}
 
                                            </tbody>
                                        </table>
                                    </div></> : ""
                                }
                            </div>
                        </div>
                        {/* </div> */}
                    </div>}
                {this.state.isListTable &&
                    <div className="container-fluid">
                        <div className="FormContent">
                            {this.state.loading && <Loader />}
                            <div className="m-2 p-2">
                                <div className="media-m-2 media-p-1">
                                    <div className="text-right mx-1" id="">
                                        <button type="button" className="btn btn-submit mt-2" onClick={this.addNew} ><FontAwesomeIcon icon={faPlus}></FontAwesomeIcon> Add</button>
                                    </div>
                                    <TableGenerator columns={columns} data={this.state.customersData} fileName={'Customer'}></TableGenerator>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </React.Fragment>);
    }
}
// function withToast(Component) {
//     return function WrappedComponent(props) {
//       const toastFuncs = useToasts()
//       return <Component {...props} {...toastFuncs} />;
//     }
//   }
export default ClientMaster;
