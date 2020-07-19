import React, { Fragment, Component } from "react";
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
export default class AddPublicPlace extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chosenTime: null,
            chosenCity: ''
        }
    }

    componentDidMount() {
        this.props.updatePublicPlace(this.props.index, "time", this.state.chosenTime);
    }

    //update chosenTime state and the publicPlaces array according to user choise
    changeChosenTime = (time) => {
        this.setState({ chosenTime: time._d }, () => {
            this.props.updatePublicPlace(this.props.index, "time", this.state.chosenTime);
        });
    }

    //update chosenCity state and the publicPlaces array according to user choise
    updateCity = (city) => {
        let chosenCity;
        if (city.name) chosenCity = city.name;
        else chosenCity = city;
        this.setState({ chosenCity }, () => {
            this.props.updatePublicPlace(this.props.index, "city", this.state.chosenCity);
        });
    }

    render() {
        return (
            <div id="public-place-container">
                {/* address inputs  */}
                <AutoComplete
                    optionsArr={this.props.cities}
                    placeholder="עיר / יישוב"
                    canAddOption={true}
                    displyField="name"
                    inputValue={this.state.chosenCity}
                    updateSelectOption={this.updateCity}
                    updateText={this.updateCity}
                    canAddOption={true}
                />
                <input autoComplete={'off'} id="street" type="text" placeholder="רחוב" onChange={(e) => this.props.updatePublicPlace(this.props.index, "street", e.target.value)} />
                <input autoComplete={'off'} id="place-description" type="text" placeholder="תיאור המקום" onChange={(e) => this.props.updatePublicPlace(this.props.index, "placeDescription", e.target.value)} />

                {/* time input */}
                <ThemeProvider theme={materialTheme}>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <Fragment>
                            <TimePicker
                                placeholder="שעה"
                                ampm={false}
                                value={this.state.chosenTime}
                                onChange={this.changeChosenTime}
                                format={this.props.format}
                            />
                        </Fragment>
                    </MuiPickersUtilsProvider>
                </ThemeProvider>
            </div>
        );
    }
}