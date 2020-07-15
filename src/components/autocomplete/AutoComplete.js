import React, { Component } from "react";


// definetorField     =>  שבעזרתו אנחנו מבחינות בין האפשרויות השונות , option  שם השדה בכול
// displyField        =>  שאת הערך שלו אנחנו מציגים באוטוקומפלייט , option  שם השדה בכול
// handleKeyDown      => enter פונקצייה שאנחנו מפעילים כשאנחנו לוחצים על
// optionsArr         =>   כשכל איבר הוא אובייקט . options מערך של כל
// updateText         =>  משתנה input פונקציה שמופעלת כל פעם שה
// updateSelectOption => option פונקציה שמופעלת כל פעם שלוחצים על אחת מה
// inputValue         =>   input ערך הנוכחי של הטקסט ב
// onClearInput       => x  פונקציה שמופעלת כשלוחצים על אייקון ה
// placeholder        =>  input של ה placeholder
// canAddOption       =>          , חדש option משתנה בוליאני.האם אפשר להוסיף
//                              או שחייב לבחור רק מהאפשרויות הקיימות
//inputKey

export default class AutocompleteComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: "",
      definetorVal: null,
      showOptionsBool: false,
      filteredOptions: []
    };
    this.isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined'));
  }
  componentDidMount() {
    this.updateFilteredOptions(this.props.inputValue);

    if (this.props.Initiatfocus) {
      this.props.inputRef.current.focus();
      this.showOrHideOptions(true);
    }
  }
  componentDidUpdate(prevProps) {
    if (
      this.props.inputValue === "" &&
      this.state.filteredOptions.length !== this.props.optionsArr.length
    )
      this.setState({ filteredOptions: this.props.optionsArr });

    // else if(prevProps.inputValue !== this.props.inputValue){
    //    this.updateFilteredOptions(this.props.inputValue);
    // }
  }

  checkKeyPresss = e => {
    if (e.keyCode === 13) {
      if (this.props.canAddOption)
        this.props.handleKeyDown &&
          this.props.handleKeyDown(e, this.props.inputKey || null);
      else {
        if (
          this.state.filteredOptions.length === 1 &&
          this.state.filteredOptions[0][this.props.displyField] ===
          this.props.inputValue
        ) {
          this.props.handleKeyDown &&
            this.props.handleKeyDown(e, this.props.inputKey || null);
        }
      }
    }
  };

  onChangeText = async e => {
    this.updateFilteredOptions(e.target.value);

    if (
      this.state.filteredOptions.length === 1 &&
      this.state.filteredOptions[0][this.props.displyField] === e.target.value
    ) {
      this.props.updateText &&
        this.props.updateText(
          this.state.filteredOptions[0],
          this.props.inputKey || null
        );
    } else {
      this.props.updateText &&
        this.props.updateText(e.target.value, this.props.inputKey || null);
    }
  };

  onChooseOption = option => {
    this.updateFilteredOptions(option[this.props.displyField]);
    this.props.updateSelectOption &&
      this.props.updateSelectOption(option, this.props.inputKey || null);
  };

  updateFilteredOptions = inputValue => {
    if (inputValue === "") {
      this.setState({ filteredOptions: this.props.optionsArr });
    } else {
      let filteredOptions = [];
      this.props.optionsArr.forEach((option, index) => {
        if (option[this.props.displyField].includes(inputValue)) {
          filteredOptions.push(option);
        }
      });
      this.setState({ filteredOptions });
    }
  };

  showOrHideOptions = (showOptionsBool) => {
    // if (!showOptionsBool && this.props.inputRef) {
    //   this.props.inputRef.current.focus();
    // }
    this.setState({ showOptionsBool });
  };

  render() {
    return (
      <label className="autocompleteContainer">
       
        <input
          ref={this.props.inputRef || null}
          style={this.props.inputStyle}
          className="autocompleteInput"
          onChange={e => { this.onChangeText(e); }}
          onBlur={e => { this.showOrHideOptions(false); }}
          onFocus={e => { this.showOrHideOptions(true); }}
          onKeyDown={e => { this.checkKeyPresss(e); }}
          value={this.props.inputValue ? this.props.inputValue : ''}
          placeholder={this.props.placeholder || ""}
        // autoFocus
        />

        {this.state.showOptionsBool ? (
          <div id="AllOpsContainer" style={this.props.optionsStyle}>
            {this.state.filteredOptions.map((option, index) => {
              return (
                <Option
                  key={index}
                  option={option}
                  displyField={this.props.displyField}
                  definetorField={this.props.definetorField}
                  onChooseOption={this.onChooseOption}
                  onClick={() => { this.showOrHideOptions(true); }}
                  onFocus={e => { this.showOrHideOptions(e, true); }}
                />
              );
            })}
          </div>
        ) : null}
      </label>
    );
  }
}

class Option extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  chooseOption = option => {
    this.props.onChooseOption(option);
  };

  render() {
    return (
      <div
        className="opContainer clickAble"
        id={this.props.option[this.props.definetorField]}
        onMouseDown={() => { this.chooseOption(this.props.option); }}
      >
        {this.props.option.coverImage && (
          <img
            alt=''
            className="coverImg"
            src={
              this.props.option.coverImage.path
                ? this.props.option.coverImage.path
                : "/images/albi-icons/userFinal.svg"
            }
          />
        )}

        <div id="opText"> {this.props.option[this.props.displyField]} </div>

      </div>
    );
  }
}
