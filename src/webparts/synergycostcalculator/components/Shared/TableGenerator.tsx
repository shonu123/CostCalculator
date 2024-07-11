import * as React from 'react';
import DataTable from 'react-data-table-component';
import DataTableExtensions from 'react-data-table-component-extensions';
import 'react-data-table-component-extensions/dist/index.css';
// import ExportExcel from '../Shared/ExportExcel';

const customStyles = {
  
  rows: {
    style: {
      minHeight: '40px', // override the row height
    }
  },
  headCells: {
    style: {
      paddingLeft: '10px', // override the cell padding for head cells
      // paddingRight: '3px',
      color: '#444',
      fontSize: '.9rem',
      // background: 'linear-gradient(rgb(228 228 228),rgb(191 191 191))',
      borderTop: '0!important',
      borderBottom: '2px solid #444;',
      verticalAlign: 'bottom'
    },
  },
  cells: {
    style: {
      paddingLeft: '10px', // override the cell padding for data cells
      paddingRight: '3px',

    },
  },
};

const TableGenerator = ({ columns, data, fileName }) => {
  const tableData = { columns, data };
  return (
    <div className="border mt-4 rounded table-responsive outer-div">
      {/* <DataTableExtensions {...tableData} exportHeaders={true} print={true} export={false}> */}
        <DataTable
          // title="Clients"
          columns={columns}
          data={data}
          striped={true}
          pagination
          actions
          noHeader={true}
          customStyles={customStyles}
          persistTableHead={true}
        />
      {/* </DataTableExtensions> */}
    </div>
  );

};


export default TableGenerator;