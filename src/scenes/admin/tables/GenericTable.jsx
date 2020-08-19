import React, { useEffect, useState } from 'react';
import '../styles/table.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const GenericTable = (props) => {
    const [tr, setTr] = useState(null)

    useEffect(() => {
        if (props.tr) setTr(props.tr)
    }, [props.tr])

    return (
        <div>
            <table className="allTableStyle">
                <thead>
                    {props.th ? <tr className="tableHead">
                        {props.th.map((i, index) => <th key={index}>{i[1]}</th>)}
                    </tr> : null}
                </thead>
                <tbody>
                    {!tr ?
                        props.loading ?
                            <tr className='headLine'>
                                <td colSpan="9" className='noRes'>
                                    {/* loading...... */}
                                    {/* <div className="spinner-border" role="status">
                                        <span className="sr-only">טוען...</span>
                                    </div> */}
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
            {props.navigation &&
                <div>
                    <div className='tableNavigation'>
                        <FontAwesomeIcon icon={['fas', "chevron-right"]} className='navArrow' onClick={props.nextPage} />
                        <div>עמוד 1 מתוך 2</div>
                        <FontAwesomeIcon icon={['fas', "chevron-left"]} className='navArrow' onClick={props.lastPage} />
                    </div>
                </div>
            }
        </div>
    );
}

export default GenericTable