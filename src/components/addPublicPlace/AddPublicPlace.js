import React, { Fragment, Component, useEffect, useState } from "react";
import AutoComplete from '../autocomplete/AutoComplete';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { createMuiTheme } from "@material-ui/core";
import { TimePicker } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { ThemeProvider } from "@material-ui/styles";

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
    const [chosenTime, setChosenTime] = useState(props.chosenTime ? props.chosenTime : null);
    const [chosenCity, setChosenCity] = useState(props.chosenCity ? props.chosenCity : '');
    const [street, setStreet] = useState('');
    const [comments, setComments] = useState('');
    useEffect(() => {
        if (props.info && Object.keys(props.info).length !== 0) {
            setChosenTime(props.info.start_time)
            let city = props.cities.find(city => city.id === props.info.cityId)
            setChosenCity(city.name)
            setStreet(props.info.street)
            setComments(props.info.comments)
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
        props.updatePublicPlace(props.index, 'city', chosenCity);
    }, [chosenCity]);

    //update chosenCity state and the publicPlaces array according to user choise
    const updateCity = (city) => {
        props.updatePublicPlace(props.index, 'cityId', city.id);
        let selectedCity;
        if (city.name) selectedCity = city.name;
        else selectedCity = city;
        setChosenCity(selectedCity);
    }
    return (
        <div id="public-place-container">
            {props.removePubPlace && !props.inSettings && <img className="close-icon clickAble" src="/icons/close.svg" onClick={() => props.removePubPlace(props.index)} />}
            {/* address inputs  */}
            <AutoComplete
                optionsArr={props.cities}
                placeholder="עיר / יישוב"
                canAddOption={true}
                displyField="name"
                inputValue={chosenCity}
                updateSelectOption={updateCity}
                updateText={updateCity}
                canAddOption={true}
            />
            <input
                autoComplete={'off'}
                id="street"
                type="text"
                placeholder="רחוב"
                value={street}
                onChange={
                    (e) => {
                        setStreet(e.target.value);
                        props.updatePublicPlace(props.index, "street", e.target.value)
                    }
                } />
            <input
                autoComplete={'off'}
                id="place-description"
                type="text"
                placeholder="תיאור המקום"
                value={comments}
                onChange={
                    (e) => {
                        setComments(e.target.value)
                        props.updatePublicPlace(props.index, "placeDescription", e.target.value)
                    }
                } />

            {/* time input */}
            <ThemeProvider theme={materialTheme}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Fragment>
                        <TimePicker
                            placeholder="שעה"
                            ampm={false}
                            value={chosenTime}
                            onChange={changeChosenTime}
                            format={props.format}
                        />
                    </Fragment>
                </MuiPickersUtilsProvider>
            </ThemeProvider>
            {props.removePubPlace && props.inSettings &&
                <div className="clickAble"
                    style={{ textDecoration: "underline" }}
                    onClick={() => props.removePubPlace(props.index)} >
                    הסר תקיעה זו מהמסלול שלי ומהמאגר
                </div>}
        </div>
    );

}
export default AddPublicPlace;