import React, { useEffect, useState } from 'react';
import '../styles/table.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/*  props: 
        th- array of arrays with the name of the headline in english and the language of the page. like: [['name', 'שם'], ['phone', 'פלאפון']]
        tr- array of arrays with the html elements of the row in the order of the th. like: [[<div>ראשית</div>, <div>0556683720</div>], [<div>מעיין</div>, <div>0556653379</div>]]
        loading- boolean, true if the table loads.
        navigation- boolean, arrows back and forward.
            if navigation is true:
                nextPage- function, onClick the right arrow.
                lastPage- function, onClick the left arrow.
                columnNum- the numberof column in one page
                resaultsNum- the number of all the columns in the database. like: יש לי 345 אנשים שמחפשים בעל תוקע ואני מראה רק 20 מתוכם. המספר של הפרופס הוא 345
*/

const GenericTable = (props) => {
    const [tr, setTr] = useState(null)
    const [page, setPage] = useState(1)

    useEffect(() => {
        if (props.tr) setTr(props.tr)
    }, [props.tr])

    const lastPageClicked = () => {
        if (1 === page) return
        props.lastPage()
        setPage(prev => prev--)
    }

    const nextPageClicked = () => {
        if (Math.ceil(props.resaultsNum / props.columnNum) === page) return
        props.nextPage()
        setPage(prev => prev++)
    }

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
                        <FontAwesomeIcon icon={['fas', "chevron-right"]} className={'navArrow' + (Math.ceil(props.resaultsNum / props.columnNum) === page ? ' disabledNavArrow' : '')} onClick={nextPageClicked} />
                        <div>עמוד {page} מתוך {Math.ceil(props.resaultsNum / props.columnNum)}</div>
                        <FontAwesomeIcon icon={['fas', "chevron-left"]} className={'navArrow' + (page === 1 ? ' disabledNavArrow' : '')} onClick={lastPageClicked} />
                    </div>
                </div>
            }
        </div>
    );
}

export default GenericTable