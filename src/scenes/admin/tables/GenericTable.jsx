import React, { useEffect, useState } from 'react';
import '../styles/table.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/** props:
  *    th- array of arrays with the name of the headline in english and the language of the page. like: [['name', 'שם'], ['phone', 'פלאפון']]
  *    tr- array of arrays with the html elements of the row in the order of the th. like: [[<div>ראשית</div>, <div>0556683720</div>], [<div>מעיין</div>, <div>0556653379</div>]]
  *    loading- boolean, true if the table loads.
  *    navigation- boolean, arrows back and forward.
          if navigation is true:
              prevPage- function, onClick the right arrow.
              nextPage- function, onClick the left arrow.
              rowsNum- the number of rows for each page
              resaultsNum- the number of all the columns in the database. like: יש לי 345 אנשים שמחפשים בעל תוקע ואני מראה רק 20 מתוכם. המספר של הפרופס הוא 345
        onRowClick- onClick event to happen on click of single row, passes the event and the index 
*/

const GenericTable = (props) => {
    const [tr, setTr] = useState(null)
    const [page, setPage] = useState(1)

    useEffect(() => {
        if (props.tr) setTr(props.tr)
    }, [props.tr])

    useEffect(() => {
        setPage(1)
    },[props.resaultsNum])

    const prevPageClicked = () => {
        if (1 === page) return
        setPage(prev => {
            props.prevPage(prev - 1)
            return prev - 1
        })
    }

    const nextPageClicked = () => {
        if (Math.ceil(props.resaultsNum / props.rowsNum) === page) return
        console.log('next')
        setPage(prev => {
            props.nextPage(prev + 1)
            return prev + 1
        })
    }

    return (
        <div>
            <table className="allTableStyle">
                <thead>
                    {props.th ? <tr className="tableHead">
                        {props.th.map((i, index) => i ? <th key={index}>{i[1]}</th> : null)}
                    </tr> : null}
                </thead>
                <tbody>
                    {!tr ?
                        props.loading ?
                            <tr className='headLine'>
                                <td colSpan="9" className='noRes'>
                                    <div className='loading-spiner'></div>
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
                                <tr key={i} className="tableBodyStyle" onClick={props.onRowClick ? e => { props.onRowClick(e, i, td) } : undefined} >
                                    {td.map((j, index) => <td key={index} className={props.th ? props.th[index] && props.th[index][0] : ''}>{j}</td>)}
                                </tr>
                            )
                        )
                    }
                </tbody>
            </table>
            {
                props.navigation &&
                <div>
                    <div className='tableNavigation'>
                        <FontAwesomeIcon icon={['fas', "chevron-right"]} className={'navArrow' + (page === 1 ? ' disabledNavArrow' : '')} onClick={prevPageClicked} />
                        <div>עמוד {page} מתוך {Math.ceil(props.resaultsNum / props.rowsNum) === 0 ? 1 : Math.ceil(props.resaultsNum / props.rowsNum)}</div>
                        <FontAwesomeIcon icon={['fas', "chevron-left"]} className={'navArrow' + ((Math.ceil(props.resaultsNum / props.rowsNum) === 0 ? 1 : Math.ceil(props.resaultsNum / props.rowsNum)) === page ? ' disabledNavArrow' : '')} onClick={nextPageClicked} />
                    </div>
                </div>
            }
        </div >
    );
}

export default GenericTable