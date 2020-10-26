const sqlite3 = require('sqlite3');
const bcrypt = require ('bcrypt'); // bcrypt

const config = require('./config');
const utils  = require('./utils');

var db;
// finally db.close

const dbRoutine = {
    connectToDB
    , disconnectFromDB
    , createUserTable
    , findUser
    , findUserAndPasswordHash
    , createUser
    , updateUser
    , getAllUsers
    , deleteUser
    , db
}

function disconnectFromDB() {
    return new Promise(function (resolve, reject) {
        try {
            db.close();
            resolve();
        }
        catch(err) {
            reject(err)
        }
    });
}


function connectToDB(dbpath='./sigil.db') {
    return new Promise(function (resolve, reject) {
        db = new sqlite3.Database(dbpath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, err => !err ? resolve() : reject(err) );
    });
}


function createUserTable() {
    return new Promise(function (resolve, reject) {
      db.run('CREATE TABLE IF NOT EXISTS T_USERS (' +
                'username TEXT NOT NULL PRIMARY KEY,' +
                'password TEXT NOT NULL,' +
                'block INTEGER NOT NULL CHECK(block in (1, 0)) default 0,' +
                'restricted_pwd INTEGER NOT NULL CHECK(restricted_pwd in (1, 0)) default 0,' +
                'admin INTEGER NOT NULL CHECK(admin in (1, 0)) default 0,' +
                'creation_dt TEXT default (datetime(\'now\'))' + //(datetime(current_timestamp))
            ')',
         err => { console.log('created t_users'); !err ? resolve() : reject(err); });
    });
}


// async function connectToDB(dbpath='./sigil.db') {
//     const db = await (new sqlite3.Database(dbpath
//         , sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
//         , (err) => {
//         if (err) {
//             console.error('ERROR:', err.message);
//         }
//         console.log('Connected to the database');
//     }));
//     return db;
// }


function findUser(username) {
    console.log('::IN FIND USER, SERACHING FOR USERNAME::', username);
    return new Promise(function (resolve, reject) {
        db.all('select username, password, block, restricted_pwd, admin, creation_dt from t_users where username = ?'
            , [username]
            , (err, rows) => {
                console.log('foundRows:', rows);
                !err ? resolve((rows === [] || !rows) ? null : rows[0]) : reject(err);
        });
    });
}


function findUserAndPasswordHash(username, password) {
    return new Promise(function (resolve, reject) {
        db.all('select username, password, block, restricted_pwd, admin, creation_dt from t_users where username = ? limit 1'
                , [username]
                , (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    const user = ( (rows === [] || !rows) ? null : rows[0] );
                    const hash = (user && user.password) || '';
                    console.log('hash of found user:', hash, 'rows:', rows);
                    if (hash) {
                        bcrypt.compare(password, hash)
                                .then(res => {console.log('resolving password match:', res); resolve(res && user);})
                                .catch(err => reject(err));
                    } else {
                        resolve(false);
                    }
                }
            );
    });
}


// function createRootAdmin(adminUsername='ADMIN', adminPasswordHash='') {
//     return new Promise(function (resolve, reject) {
//         db.run('INSERT INTO t_users(username, password) values(?, ?)'
//                 , [adminUsername, adminPasswordHash]
//                 , (err, rows) => !err ? resolve(rows.length) : reject(err)
//             );
//     });
// }


function updateUser(username, password=null, block=null, restrictedPwd=null, admin=null, upadtedUsername=null) {
    const args = [];
    // let error;
    // if (password !== null) {
    //     // bcrypt.hash(password, config.saltRounds).then((hash) => { password = hash; }).catch(err => { error = err; console.error(err) });
    //     args.push(password);
    // }
    if (upadtedUsername !== null)
        args.push(upadtedUsername);
    if (block !== null)
        args.push(block ? 1 : 0);
    if (restrictedPwd !== null)
        args.push(restrictedPwd ? 1 : 0);
    if (admin !== null)
        args.push(admin ? 1 : 0);

    return bcrypt.hash(password || '', config.saltRounds).then((hash) => {
        return new Promise(function (resolve, reject) {
            // if (error) {
            //     reject(error);
            // }
            if (password !== null) {
                args.push(hash);
            }
            args.push(username);


            console.log(
                'update t_users set username = ' +    (upadtedUsername !== null ? '?' : 'username') +
                    ', block = '  +                      (block !== null ? '?' : 'block') +
                    ', restricted_pwd = '  +              (restrictedPwd !== null ? '?' : 'restricted_pwd') +
                    ', admin = ' +                        (admin !== null ? '?' : 'admin') +
                    ', password = ' +                    (password !== null ? '?' : 'password') +
                    ' where username = ?'
            );
            console.table(args);


            db.run('update t_users set username = ' +    (upadtedUsername !== null ? '?' : 'username') +
                    ', block = '  +                      (block !== null ? '?' : 'block') +
                    ', restricted_pwd = '  +             (restrictedPwd !== null ? '?' : 'restricted_pwd') +
                    ', admin = ' +                       (admin !== null ? '?' : 'admin') +
                    ', password = ' +                    (password !== null ? '?' : 'password') +
                    ' where username = ?'
                    , args
                    , (err) => !err ? resolve({rowsAffected: this.changes, action: 'updated'}) : reject(err)
            );
        });
    });
}


function createUser(username, password, block=0, restrictedPwd=0, admin=0, creationDt=utils.nowUTCSqliteFormat()) {
    if (!password) {
        password = '';
    }
    return bcrypt.hash(password, config.saltRounds).then((hash) => {
        password = hash;
        return new Promise(function (resolve, reject) {
            db.run('insert into t_users(username, password, block, restricted_pwd, admin, creation_dt) values(' +
                        '?' +
                        ', ?' +
                        ', ?' +
                        ', ?' +
                        ', ?' +
                        ', ?' +
                    ')'
                    , [
                        username
                        , password
                        , block ? 1 : 0
                        , restrictedPwd ? 1 : 0
                        , admin ? 1 : 0
                        , creationDt
                    ]
                    , (err, rows) => !err ? resolve({rowsAffected: this.changes, action: 'insert'}) : reject(err)
                );
        });
    });
}


function getAllUsers() {
    return new Promise(function (resolve, reject) {
        db.all('select username, password, block, restricted_pwd, admin, creation_dt from t_users'
                , (err, rows) => {
                    !err ? resolve(rows) : reject(err)
                }
            );
    });
}


function deleteUser(username) {
    return new Promise(function (resolve, reject) {
        db.run('delete from t_users where username = ?'
                , [username]
                , (err) => {
                    !err ? resolve({username: username, rowsAffected: this.changes}) : reject(err);
                }
            );
    });
}


module.exports = dbRoutine;
