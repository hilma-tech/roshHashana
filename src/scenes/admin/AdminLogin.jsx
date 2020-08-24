import React from 'react';
import Login from '../../modules/auth/Login'
import Auth from "../../modules/auth/Auth";
import GenericTools from '../../modules/tools/GenericTools'
// import logo from '../../icons/logo.svg'
import '../Register.scss'

class DashLogin extends Login {

  onFocus = () => {
    if (this.state.error) {
      this.setState({ error: false })
    }
  }

  _handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.myHandleLogin(e)
    }
  }

  myHandleLogin = async (e) => {
    e.preventDefault();
    let error = "";
    let email = this.refs.email.value;
    let pw = this.refs.pw.value;
    this.setState({ isLoading: true });
    let res = await Auth.login(email, pw);
    if (res.msg === "No response, check your network connectivity") {
      error = 'שגיאה בהתחברות, נסה שנית מאוחר יותר'
      this.setState({ isLoading: false, error });
    }

    else if (res.msg && res.msg.error && res.msg.error.statusCode === 500) {
      error = 'שגיאה בהתחברות, נסה שנית מאוחר יותר'
      this.setState({ isLoading: false, error });
      return;
    }

    else if (res.msg && res.msg.error && res.msg.error.statusCode === 401) {
      error = 'שם המשתמש או הסיסמא אינם נכונים'
      this.setState({ isLoading: false, error });
      return;
    }
    if (res.success === true) {
      this.redirect()
    }
    this.setState({ isLoading: false });
  }

  redirect = () => {
    let redir = `/home`;
    GenericTools.safe_redirect(redir);
  }



  render() {
    Auth.isAuthenticated() && this.redirect();
    return (
      <div className='browserRegisterPage fade-in mainlogindiv'>
        <div className='containLoginMain logindiv'>
          <form>
            <div className="">
              <img alt="" style={{width:"100%", marginBottom:"4vh"}} src="/images/header.svg" />


              <div className='position-relative' >
                <div>
                  <input className="loginInput"
                    type='email'
                    ref='email'
                    onKeyDown={this._handleKeyDown}
                    onFocus={this.onFocus}
                    placeholder='אימייל'
                    required />
                </div>
                <div>
                  <input className="loginInput"
                    type='password'
                    ref='pw'
                    onKeyDown={this._handleKeyDown}
                    onFocus={this.onFocus}
                    placeholder='סיסמא'
                    required />
                </div>
                <div className='loginError'
                  style={{ opacity: this.state.error ? '1' : '0' }}
                >
                  {this.state.error}
                </div>
              </div>
              {this.state.isLoading ?
                <div className='browserbutton1 connect pointer'  >
                  <div>
                    מתחבר...
                                </div>
                </div>
                :
                <div onClick={this.myHandleLogin} className='browserbutton1 connect pointer'>
                  <div>
                    התחבר
                                </div>
                </div>
              }
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default DashLogin;