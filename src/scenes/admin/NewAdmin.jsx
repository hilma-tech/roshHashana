import React, { useEffect, useState, useContext } from 'react';
import { AdminMainContext } from './ctx/AdminMainContext';
import { createAdminUser } from './fetch_and_utils';
import TopNavBar from "./TopNavBar"
import SuccessPopUp from "./popups/SuccessPopUp"
import './styles/newAdmin.scss'

const NewAdmin = (props) => {

    const { } = useContext(AdminMainContext)
    const [loadingSave, setLoadingSave] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [code, setCode] = useState('')

    const setEmailVal = (e) => {
        setEmail(e.target.value)
    }

    const setPasswordVal = (e) => {
        setPassword(e.target.value)
    }
    const setCodeVal = (e) => {
        setCode(e.target.value)
    }
    const handleApprove = (e) => {
        setPassword("")
        setEmail('')
        setError('')
        setCode('')
        setSuccess(false)
    }

    const saveUser = function () {
        (async () => {
            setLoadingSave(true)
            await createAdminUser(email, password, code, (err, res) => {
                setLoadingSave(false)
                if (!err) {
                    if (res.error) {
                        setError(res.error)
                    }
                    else {
                        setSuccess(true)
                    }
                } else {
                    console.log(err)
                    setError("אירעה שגיאה. אנא נסה שנית מאוחר יותר.")
                }
            })
        })()
    }

    return (
        <div>
            <TopNavBar />
            <div className='newAdmin'>
                <div className="headline bold">הוספת אדמין חדש</div>
                <div>
                    <div className="" >
                        <table style={{ width: '20%', textAlign: 'right', borderCollapse: 'separate', borderSpacing: '0 1vh' }}>
                            <tbody>
                                <tr className="trAddAdmin">
                                    <td className='textStyle'>אימייל
                                    </td>
                                    <td>
                                        <input
                                            autoComplete="off"
                                            type="text"
                                            name="name"
                                            onChange={setEmailVal}
                                            value={email}
                                        />
                                    </td>
                                </tr>
                                <tr className="trAddAdmin">
                                    <td className='textStyle'>סיסמא
                                    </td>
                                    <td>
                                        <input
                                            autoComplete="off"
                                            type="password"
                                            name="name"
                                            onChange={setPasswordVal}
                                            value={password}
                                        />
                                    </td>
                                </tr>
                                <tr className="trAddAdmin">
                                    <td className='textStyle'>קוד
                                    </td>
                                    <td>
                                        <input
                                            autoComplete="off"
                                            type="password"
                                            name="name"
                                            onChange={setCodeVal}
                                            value={code}
                                        />
                                    </td>
                                </tr>
                                {error && <tr className="trAddAdmin">
                                    <td className='textStyle'>
                                    </td>
                                    <td>
                                        <div>{error}</div>
                                    </td>
                                </tr>}
                                <tr className="trAddAdmin">
                                    <td className='textStyle'>
                                    </td>
                                    <td>
                                        <div
                                            className="saveButton pointer"
                                            onClick={saveUser}>
                                            {loadingSave ?
                                                <div className="spinner">
                                                    <div className="bounce1"></div>
                                                    <div className="bounce2"></div>
                                                    <div className="bounce3"></div>
                                                </div> :
                                                <div>שמור</div>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {success && <SuccessPopUp handleDismiss={handleApprove} handleApprove={handleApprove} />}
        </div>
    );
}
export default NewAdmin;