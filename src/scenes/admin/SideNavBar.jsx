import React, { useContext } from 'react';
import { withRouter } from 'react-router';
import { AdminMainContext } from './ctx/AdminMainContext';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import './styles/sideNavBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Auth from '../../modules/auth/Auth';

const SideNavBar = (props) => {

    const { isOpenSideBar, setOpenSideBar } = useContext(AdminMainContext)

    const navBarOptions = [
        { name: "ראשי", path: '/home' },
        { name: "מחפשים", path: '/searchings' },
        { name: "בעלי תקיעה", path: '/shofar-blowers' },
        { name: "תקיעות", path: '/meetings' }
    ]

    const logOut = async () => {
        Auth.logout(() => {
            let path = "/"
            if (window.location.hash === "") //normal 
            {
                if (window.location.pathname === path) {
                    window.location.reload(false);
                }
                else {
                    window.location.pathname = path;
                }
            }
            else //hash is probably #/, cordova and hash router case.
            {
                if (window.location.hash === ("#" + path)) {
                    window.location.reload(false);
                }
                else {
                    window.location.hash = "#" + path;
                }
            }
        });
    }

    return (
        <SwipeableDrawer
            anchor="right"
            open={isOpenSideBar}
            onClose={() => { }}
            onOpen={() => { }}
        >
            <div
                className="outerSidebarContainer"
                role="presentation"
            // onClick={props.toggleDrawer(false)}
            // onKeyDown={props.toggleDrawer(false)}
            >
                <List className='sideOptionsContainer'>
                    <FontAwesomeIcon icon={['fas', 'times']} className="cancelIcon pointer" onClick={() => { setOpenSideBar(false) }} />
                    {navBarOptions.map((text, index) => {
                        if (text === null) return null
                        return (
                            <ListItem index={index} button className='containSideListItem' key={text.name} onClick={() => {
                                props.history.push('/skerdsgfkjs9889cdfcis596jtrgd7yfuszygs' + text.path)
                                setOpenSideBar(false)
                            }}>
                                <ListItemText disableTypography className='optionTextContainer' primary={text.name} />
                            </ListItem>
                        )
                    })}
                    <ListItem index={navBarOptions.length} button className='containSideListItem' key='התנתק' onClick={logOut}>
                        <ListItemText disableTypography className='optionTextContainer' primary='התנתק' />
                    </ListItem>
                </List>
            </div>
        </SwipeableDrawer>)
}

export default withRouter(SideNavBar);
