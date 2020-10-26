const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");
const dbRoutine = require('./dbRoutine');

const config = require('./config');
const utils  = require('./utils');
// const { rejects } = require("assert");

let mainWindow;
let putUserWindow;
let changePwdWindow;
let aboutWindow;


function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: "",
        webPreferences: {
            nodeIntegration: false
            , worldSafeExecuteJavaScript: true
            , preload: __dirname + '/preload.js'
        }
    });

    putUserWindow = new BrowserWindow({
        width: 400,
        height: 500,
        icon: "",
        webPreferences: {
            nodeIntegration: false
            , worldSafeExecuteJavaScript: true
            , preload: __dirname + '/preload.js'
        },
        icon: "",
        parent: mainWindow,
        show: false
    });
    putUserWindow.setMenuBarVisibility(false);

    aboutWindow = new BrowserWindow({
        width: 600,
        height: 500,
        icon: "",
        webPreferences: {
            nodeIntegration: false
            , worldSafeExecuteJavaScript: true
            , preload: __dirname + '/preload.js'
        },
        parent: mainWindow,
        show: false
    });
    aboutWindow.setMenuBarVisibility(false);

    changePwdWindow = new BrowserWindow({
        width: 400,
        height: 500,
        icon: "",
        webPreferences: {
            nodeIntegration: false
            , worldSafeExecuteJavaScript: true
            , preload: __dirname + '/preload.js'
        },
        parent: mainWindow,
        show: false
    });
    changePwdWindow.setMenuBarVisibility(false);

    mainWindow.loadURL(
        isDev
        ? "http://localhost:3000"
        : `file://${__dirname}/index.html`
    );
    mainWindow.on("closed", () => (mainWindow = null));

    putUserWindow.loadURL(
        isDev
        ? "http://localhost:3000/#/put"
        : `file://${__dirname}/index.html#/put`
    );
    putUserWindow.on("close", (e) => {
        e.preventDefault();
        putUserWindow.reload();
        putUserWindow.hide();
    });

    changePwdWindow.loadURL(
        isDev
        ? "http://localhost:3000/#/changepwd"
        : `file://${__dirname}/index.html#/changepwd`
    );
    changePwdWindow.on("close", (e) => {
        e.preventDefault();
        changePwdWindow.reload();
        changePwdWindow.hide();
    });

    aboutWindow.loadURL(
        isDev
        ? "http://localhost:3000/#/about"
        : `file://${__dirname}/index.html#/about`
    );
    aboutWindow.on("close", (e) => {
        e.preventDefault();
        aboutWindow.hide();
    });
}


app.on("ready", () => {
    createWindow();
    electron.Menu.setApplicationMenu(initMenu(!!(global.sharedObj && global.sharedObj.loggedUser)));

    dbRoutine.connectToDB(config.dbpath).then(() => dbRoutine.createUserTable())
            .then(() => dbRoutine.findUser(config.adminUsername))
            .then((foundUser) => { console.log('foundUser:', foundUser); if (!foundUser) {dbRoutine.createUser(config.adminUsername, config.adminPassword, 0, 0, 1)} })
            .catch((err) => {
                    console.error('sending failure:startup', err);
                    mainWindow.webContents.send('failure:startup', err);
            });
    // dbRoutine.findUser('ADMIN').then((res) => console.log('RESL:', res));
    console.log('App ready, creating db');
});


// window.onbeforeunload = function (e) { return false }

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        dbRoutine.disconnectFromDB(); // !!!
        app.quit();
    }
});


app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});


electron.ipcMain.on("main:shut", () => {
    app.quit();
});


let attempt = 0;
electron.ipcMain.on('login:request-login', (e, payload) => {
    console.log(payload);
    // check in db
    dbRoutine.findUserAndPasswordHash(payload.username, payload.password).then(
        (userObj) => {
            if (userObj) {
                attempt = 0;
                userObj = {
                    username: userObj.username
                    , block: !!userObj.block
                    , restrictedPwd: !!userObj.restricted_pwd
                    , admin: !!userObj.admin
                    , creationDt: userObj.creation_dt
                };
                global.sharedObj = {loggedUser: userObj};
                mainWindow.webContents.send('login:authorized', userObj);
                electron.Menu.setApplicationMenu(initMenu(!!(global.sharedObj && global.sharedObj.loggedUser)));
                reloadAddWindows();
                return;
            }
            attempt += 1;
            mainWindow.webContents.send('login:denied', {error: 'Cannot connect. Username or Password Invalid!', attempt, left: config.attemptsMax - attempt});
        }
    ).catch(err => {
        mainWindow.webContents.send('failure:querying', formErr(err));
    });
    // mainWindow.webContents.send('login:authorized', {
    //     ...payload
    //     , isAdmin: true // from db
    //     , registrationDt: new Date()
    //     , blocked: false
    //     , passwordRestricted: false
    // });
});


electron.ipcMain.on('users:ready', (e, payload) => {
    console.log('will be getting all users');
    dbRoutine.getAllUsers().then((users) => {
        // console.table(users);
        users = users.map((user) => {
            return {
                username: user.username
                , block: user.block ? 'Yes' : 'No'
                , restrictedPwd: user.restricted_pwd ? 'Yes' : 'No'
                , admin: user.admin ? 'Yes' : 'No'
                , creationDt: user.creation_dt
            }
        });
        console.table(users);
        console.log('sending users:received');
        mainWindow.webContents.send('users:received', {users});
    }).catch(err => {
        mainWindow.webContents.send('failure:querying', formErr(err));
    });
});


electron.ipcMain.on('user:delete', (e, payload) => {
    console.log('deleting user on user:delete reception');
    dbRoutine.deleteUser(payload).then((payload) => {
        console.log('users deleted:', payload.rowsAffected);
        mainWindow.webContents.send('user:deleted', payload);
    }).catch(err => {
        mainWindow.webContents.send('failure:querying', formErr(err));
    });
});


electron.ipcMain.on('user:add', () => {
    console.log('user:add received');
    // putUserWindow.reload();
    putUserWindow.show();
});


electron.ipcMain.on('user:edit', (e, payload) => {
    payload = {...payload, mode: 'update'};
    console.log('user:edit received');
    putUserWindow.show();
    console.log('sending data to putwindow with putwindow:putdata', payload);
    putUserWindow.webContents.send('putwindow:putdata', payload);
});


electron.ipcMain.on('putwindow:shut', () => {
    console.log('putwindow:shut received');
    putUserWindow.reload();
    putUserWindow.hide();
});


electron.ipcMain.on('pwdwindow:shut', () => {
    console.log('pwdwindow:shut received');
    changePwdWindow.reload();
    changePwdWindow.hide();
});


electron.ipcMain.on('mainwindow:reload', () => {
    mainWindow.reload();
});


electron.ipcMain.on('putwindow:put', (e, payload) => {
    console.log('putwindow:put received');
    console.log('payload:', payload);
    let oldElement = {};
    let nowUTCStr = '';
    console.log('payload before checking PASS RESTRICTIONS:', payload);
    const error = checkPasswordRestrictions(payload.password, payload.restrictedPwd);
    if (error) {
        putUserWindow.webContents.send('failure:putwindow-querying', formErr(error));
        return;
    }

    dbRoutine.findUser(payload.updatedUsername).then((user) => {
            if (user) {
                throw Error('User with that username already exists');
            }
            return dbRoutine.findUser(payload.username)
        }
    )
    .then((user) => {
        nowUTCStr = utils.nowUTCSqliteFormat();
        console.log('::USER FOUND::', user);
        if (user) {                             //!!! handle unique constraint error // What if user not found???
            oldElement = {
                username: user.username
                , password: user.password
                , block: user.block
                , restrictedPwd: user.restricted_pwd
                , admin: user.admin
                , creationDt: user.creationDt
            };
            if (payload.mode === 'insert') {
                throw Error('User Already Exists');
            }
            return dbRoutine.updateUser(payload.username, payload.password, payload.block, payload.restrictedPwd, payload.admin, payload.updatedUsername);
        }
        return dbRoutine.createUser(payload.updatedUsername, payload.password, payload.block, payload.restrictedPwd, payload.admin, nowUTCStr);
    }).then((res) => {
        putUserWindow.webContents.send('putwindow:put-results', { error });
        console.log('putwindow:put-results fired');
        const updatedUser = {restrictedPwd: payload.restrictedPwd
                    , block: payload.block
                    , creationDt: (res.action === 'update') ? payload.creationDt : nowUTCStr
                    , admin: payload.admin
                    , username: payload.updatedUsername
        };
        console.log('UPDATED USER:', updatedUser);
        if (res.action === 'update') {
            console.log('user:edited fired');
            mainWindow.webContents.send('user:edited', {oldElement, newElement: updatedUser});
            putUserWindow.webContents.send('user:edited', {oldElement, newElement: updatedUser});
            return;
        }
        console.log('user:added fired');
        mainWindow.webContents.send('user:added', updatedUser);
        putUserWindow.webContents.send('user:added', updatedUser);
    }).catch(err => {
        console.log('failure:putwindow-querying event', err);
        console.table(err);
        putUserWindow.webContents.send('failure:putwindow-querying', formErr(err));
    });
});


//* ipcRenderer.send('password:change', {username: ((remote.getGlobal('sharedObj') && remote.getGlobal('sharedObj').loggedUser && remote.getGlobal('sharedObj').loggedUser.username) || '')
//* , password: newPassword});

electron.ipcMain.on('password:change', (e, payload) => {
    dbRoutine.findUser(payload.username)
    .then((res) => {
        if (!res) {
            throw Error('User not found');
        }
        return dbRoutine.findUserAndPasswordHash(payload.username, payload.password)
    }).then((res) => {
            if (res) {
                throw Error('Old Password cannot equal New Password!');
            }
            return dbRoutine.updateUser(payload.username, payload.password);
    }).then(() => {
        changePwdWindow.webContents.send('password:changed');
    }).catch(err => {
        changePwdWindow.webContents.send('failure:password-changing', formErr(err));
    });
});


function checkPasswordRestrictions(pwd, isRestricted) {
    if (!isRestricted) {
        return '';
    }
    if (!pwd) {
        return 'Password is empty!';
    }
    console.log('typeof pwd, pwd:', typeof pwd, pwd);
    let pwdArr = pwd.split('');
    let invalid = pwdArr.some(function(v, i, a) {
        return a.lastIndexOf(v) !== i;
    });
    if (invalid) {
        return 'Characters must not repeat!';
    }
}


function formErr(err) {
    return (err.name && err.message) ? (err.name + ' ' + err.message) : err.toString()
}


function initMenu(loggedIn=false) {
    const mainMenuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Log out'
                    , accelerator: 'Ctrl+L'
                    , click() {
                        logOut();
                    }
                    , visible: !!(global.sharedObj && global.sharedObj.loggedUser)
                }
                , { type: 'separator' }
                , {
                    label: 'Exit'
                    , accelerator: 'Ctrl+Q'
                    , click() {
                        app.quit();
                    }
                }
            ]
        }
        , {
            label: 'Admin',
            submenu: [
                {
                    label: 'Change Password'
                    , click() {
                        changePwdWindow.show();
                    }
                }
            ]
            // , visible: !!(global.sharedObj && global.sharedObj.loggedUser)
        }
        , {
            label: 'About',
            submenu: [
                {
                    label: 'About'
                    , click() {
                        aboutWindow.show();
                    }
                }
            ]
        }
    ];

    if (isDev) {
        mainMenuTemplate.push({
            label: 'Developer Tools'
            , submenu: [
                {
                    label: 'Toggle DevTools'
                    , accelerator: 'Ctrl+I'
                    , click (item, focusedWindow) {
                        focusedWindow.toggleDevTools();
                    }
                }
                , {
                    role: 'reload'
                }
            ]
        });
    }

    if (loggedIn === false) {
        mainMenuTemplate.splice(1, 1);
    }

    return electron.Menu.buildFromTemplate(mainMenuTemplate);
}


function logOut() {
    hideAddWindows();
    mainWindow.webContents.send('status:logout');
    global.sharedObj = {loggedUser: null};
    reloadAddWindows();
    electron.Menu.setApplicationMenu(initMenu(!!(global.sharedObj && global.sharedObj.loggedUser)));
}


function hideAddWindows() {
    putUserWindow.hide();
    changePwdWindow.hide();
    aboutWindow.hide();
}


function reloadAddWindows() {
    putUserWindow.reload();
    changePwdWindow.reload();
    aboutWindow.reload();
}
