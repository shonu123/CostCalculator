import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const ModalPopUp = ({ modalText, isVisible, onClose, title, isSuccess }) => {

  return isVisible ? (
    <div className="modal" tabIndex={-1} style={{display:'block',background:'rgb(165 165 165 / 25%)'}} >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className={`modal-header txt-white ${isSuccess ? 'bc-dblue' : 'bc-burgundy'}`}>
          <FontAwesomeIcon color={"#33b733"} icon={faCheckCircle}></FontAwesomeIcon><h6 className="modal-title txt-white modalclosesuccess">{title}</h6>
          <button id="modalclose" type="button" onClick={onClose} className="txt-white close modalclosesuccess" data-dismiss="modal">&times;</button>
          </div>
          {/* <div className="modal-body">
            <p>{modalText}</p>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className={`btn bc-dblue txt-white modalclosesuccess ${isSuccess ? 'bc-dblue':'bc-burgundy'}`} data-dismiss="modal">Ok</button>
          </div> */}
        </div>
      </div>
    </div>
  ) : null;

};

export default ModalPopUp;