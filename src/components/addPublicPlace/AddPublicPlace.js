import React, { Fragment, useEffect, useState } from "react";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { createMuiTheme } from "@material-ui/core";
import { TimePicker } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { ThemeProvider } from "@material-ui/styles";
import { FormSearchBoxGenerator } from "../maps/search_box_generator";

const materialTheme = createMuiTheme({
    overrides: {
        MuiPickersToolbar: {
            toolbar: {
                backgroundColor: "#16697a",
                direction: "ltr"
            },
        },
        MuiPickersTimePickerToolbar: {
            toolbarAmpmLeftPadding: {
                direction: "ltr"
            }
        },
    },
    palette: {
        primary: { main: "#16697a" }
    }
});

//public place form

const AddPublicPlace = (props) => {
    const [chosenTime, setChosenTime] = useState(null);
    const [address, setAddress] = useState('');
    const [comments, setComments] = useState('');

    useEffect(() => {
        if (props.info && Object.keys(props.info).length !== 0) {
            props.info.start_time && setChosenTime(props.info.start_time)
            props.info.address && setAddress(props.info.address)
            props.info.comments && setComments(props.info.comments)
        }
        props.updatePublicPlace(props.index, 'time', chosenTime);
    }, [props.info]);

    //update chosenTime state and the publicPlaces array according to user choise
    const changeChosenTime = (time) => {
        setChosenTime(time._d);
    }

    useEffect(() => {
        props.updatePublicPlace(props.index, 'time', chosenTime);
    }, [chosenTime]);

    useEffect(() => {
        props.updatePublicPlace(props.index, 'address', address);
    }, [address]);

    // update chosenAddress state and the publicPlaces array according to user choice
    const updateAddress = (address) => {
        props.updatePublicPlace(props.index, 'address', address);
        setAddress(address);
    }
    const handleCommentsChange = (e) => {
        if (e.target.value && e.target.value.length && !/^[A-Zא-תa-z0-9 '"-]{0,}$/.test(e.target.value)) {
            return;
        }
        setComments(e.target.value)
        props.updatePublicPlace(props.index, "comments", e.target.value)
    }

    return (
        <div id="public-place-container">
            {props.removePubPlace && !props.inSettings && <img alt="" className="close-icon clickAble" src="/icons/close.svg" onClick={() => !props.disabled && props.removePubPlace(props.index)} />}
            {/* address inputs  */}
            <FormSearchBoxGenerator disabled={props.disabled} uId={'publicPlaces-form-search-input-' + props.index} second onAddressChange={updateAddress} defaultValue={Array.isArray(address) && address[0] ? address[0] : address} className="address" />
            <input
                disabled={props.disabled ? props.disabled : false}
                maxLength={254}
                autoComplete={'off'}
                id="place-description"
                type="text"
                placeholder="תיאור המקום"
                value={comments}
                style={props.info && props.info.errMsg ? { marginBottom: 0 } : {}}
                onChange={handleCommentsChange} />
            {props.info && props.info.errMsg && <div style={{ marginBottom: "5%" }} className="err-msg">{props.info.errMsg}</div>}

            {/* time input */}
            <ThemeProvider theme={materialTheme}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Fragment>
                        <TimePicker
                            disabled={props.disabled ? props.disabled : false}
                            placeholder="שעה"
                            ampm={false}
                            value={chosenTime}
                            onChange={changeChosenTime}
                            format={props.format}
                        />
                    </Fragment>
                </MuiPickersUtilsProvider>
            </ThemeProvider>
            {(props.removePubPlace && props.inSettings && !props.disabled) ?
                <div className="clickAble"
                    style={{ textDecoration: "underline" }}
                    onClick={() => !props.disabled && props.removePubPlace(props.index)} >
                    הסר תקיעה זו מהמסלול שלי ומהמאגר
                </div> : null}
        </div>
    );

}
export default AddPublicPlace;