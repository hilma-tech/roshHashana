import React, { useEffect, useState } from 'react';
import '../styles/table.scss'

const GenericTable = (props) => {
    const [tr, setTr] = useState(null)

    useEffect(() => {
        if (props.tr) setTr(props.tr)
    }, [props.tr])

    return (
        <div>
            <table className="allTableStyle">
                <tbody>
                    {props.th ? <tr className="tableHead">
                        {props.th.map((i, index) => <th key={index}>{i[1]}</th>)}
                    </tr> : null}
                    {!tr ?
                        props.loading ?
                            <tr className='headLine'>
                                <td colSpan="9" className='noRes'>
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">טוען...</span>
                                    </div>
                                </td>
                            </tr> :
                            <tr className='headLine'>
                                <td colSpan="9" className='noRes'>אירעה שגיאה, נסה שנית מאוחר יותר</td>
                            </tr> :
                        (!tr.length ?
                            <tr className='headLine'>
                                <td colSpan="9" className='noRes'>לא נמצאו תוצאות</td>
                            </tr> :

                            tr.map((td, i) =>
                                <tr key={i} className="tableBodyStyle">
                                    {td.map((j, index) => <td key={index} className={props.th ? props.th[index][0] : ''}>{j}</td>)}
                                </tr>
                            )
                        )
                    }
                </tbody>
            </table>
            {/* {props.ManagerStore.readMore ?
                <div
                    className='readMore'
                    onClick={() => {
                        (async () => {
                            await props.ManagerStore.fetchMeetingsDashboard({}, true)
                        })()
                    }}>
                    {props.t("load more")}
                </div> : null
            } */}
        </div>
    );
}

export default GenericTable