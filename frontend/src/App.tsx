import React, { useEffect, useState } from "react"
import { ThemeProvider } from "@emotion/react";
import {
    Badge,
    Box,
    createTheme, CssBaseline,
    Divider,
    IconButton, List,
    ListItemIcon, ListItemText,
    Toolbar,
    Typography,
    styled,
} from "@mui/material"
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { ChevronLeft, Dashboard, Menu, Settings as SettingsIcon, SettingsEthernet, Storage } from "@mui/icons-material";
import ListItemButton from '@mui/material/ListItemButton';
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Link,
} from 'react-router-dom';
import Home from "./Home";
import Settings from "./Settings";
import { io } from "socket.io-client";
import { RootState, store } from './stores/store';
import { Provider, useSelector } from "react-redux";

const theme = createTheme();

const drawerWidth: number = 240;

const socket = io(`http://${localStorage.getItem('server-addr') || 'localhost'}:3022`)

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

function AppContent() {
    const [open, setOpen] = useState(false);
    const [freeDiskSpace, setFreeDiskSpace] = useState('');

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const settings = useSelector((state: RootState) => state.settings)
    const status = useSelector((state: RootState) => state.status)

    /* Get disk free space */
    useEffect(() => {
        socket.on('free-space', (res: string) => {
            setFreeDiskSpace(res)
        })
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline />
                    <AppBar position="absolute" open={open}>
                        <Toolbar
                            sx={{
                                pr: '24px', // keep right padding when drawer closed
                            }}
                        >
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="open drawer"
                                onClick={toggleDrawer}
                                sx={{
                                    marginRight: '36px',
                                    ...(open && { display: 'none' }),
                                }}
                            >
                                <Menu />
                            </IconButton>
                            <Typography
                                component="h1"
                                variant="h6"
                                color="inherit"
                                noWrap
                                sx={{ flexGrow: 1 }}
                            >
                                yt-dlp WebUI
                            </Typography>
                            {
                                freeDiskSpace ?
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                    }}>
                                        <Storage></Storage>
                                        <span>&nbsp;{freeDiskSpace}&nbsp;</span>
                                    </div>
                                    : null
                            }
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                            }}>
                                <SettingsEthernet></SettingsEthernet>
                                <span>&nbsp;{settings.serverAddr}</span>
                            </div>
                            <IconButton color="inherit">
                                <Badge badgeContent={0} color="secondary">
                                </Badge>
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <Drawer variant="permanent" open={open}>
                        <Toolbar
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                px: [1],
                            }}
                        >
                            <IconButton onClick={toggleDrawer}>
                                <ChevronLeft />
                            </IconButton>
                        </Toolbar>
                        <Divider />
                        <List component="nav">
                            <Link to={'/'} style={
                                {
                                    textDecoration: 'none',
                                    color: '#222222'
                                }
                            }>
                                <ListItemButton disabled={status.downloading}>
                                    <ListItemIcon>
                                        <Dashboard />
                                    </ListItemIcon>
                                    <ListItemText primary="Home" />
                                </ListItemButton>
                            </Link>
                            <Link to={'/settings'} style={
                                {
                                    textDecoration: 'none',
                                    color: '#222222'
                                }
                            }>
                                <ListItemButton disabled={status.downloading}>
                                    <ListItemIcon>
                                        <SettingsIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Settings" />
                                </ListItemButton>
                            </Link>
                        </List>
                    </Drawer>
                    <Box
                        component="main"
                        sx={{
                            backgroundColor: (theme) =>
                                theme.palette.mode === 'light'
                                    ? theme.palette.grey[100]
                                    : theme.palette.grey[900],
                            flexGrow: 1,
                            height: '100vh',
                            overflow: 'auto',
                        }}
                    >
                        <Toolbar />
                        <Routes>
                            <Route path="/" element={<Home socket={socket}></Home>}></Route>
                            <Route path="/settings" element={<Settings socket={socket}></Settings>}></Route>
                        </Routes>
                    </Box>
                </Box>
            </Router>
        </ThemeProvider>
    );
}

export function App() {
    return (
        <Provider store={store}>
            <AppContent></AppContent>
        </Provider>
    );
}