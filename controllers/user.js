const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10; // bcrypt
const secretKey = 'YangMing,whichfocusedonbiomedicalresearch,andChiaoTung,whichfocusedonelectroniccommunicationresearch,werebothtop-tieruniversitiesinTaiwan'
const expiresTime = 1000 * 60 * 30; // 30 min

// 登入
exports.login = async function (req, res) {
    const name = req.body.name;
    const password = req.body.password;
    if (!name || !password || typeof (name) !== 'string' || typeof (password) !== 'string') {
        res.send({
            result: "Fail",
            message: "請輸入帳號和密碼"
        })
        return;
    }
    const dbQuery = "SELECT * FROM account WHERE name=$1;";
    const dbParams = [name];
    const dbResult = await db.query(dbQuery, dbParams);
    const result = dbResult.rows[0];
    if (!result) {
        return res.send({
            result: "Fail",
            message: "帳號不存在"
        })
    }
    const hashPassword = result.hash_password;
    bcrypt.compare(password, hashPassword, function (err, pass) {
        if (pass) {
            const token = jwt.sign({ id: result.id, name: name }, secretKey, { expiresIn: expiresTime });
            return res.send({
                result: "Success",
                message: "登入成功",
                id: result.id,
                token: token,
            })
        }
        else {
            return res.send({
                result: "Fail",
                message: "密碼錯誤"
            })
        }
    })
}


// 列出所有使用者 GET /api/v1/users
exports.usersGET = async function (req, res) {
    const dbQuery = "SELECT * FROM account;";
    const dbParams = [];
    const dbResult = await db.query(dbQuery, dbParams);
    const result = dbResult.rows.map(({ id, name, created_at }) => ({ id, name, created_at }));
    res.send(result);
}

// 新增一位使用者 POST /api/v1/users
exports.usersPOST = async function (req, res) {
    const name = req.body.name;
    const password = req.body.password;
    if (!name || !password || typeof (name) !== 'string' || typeof (password) !== 'string') {
        res.send({
            result: "Fail",
            message: "請輸入帳號和密碼"
        })
        return;
    }
    const dbQuery1 = "SELECT * FROM account WHERE name=$1";
    const dbParams1 = [name];
    const dbResult1 = await db.query(dbQuery1, dbParams1);
    if (dbResult1.rows.length !== 0) {
        res.send({
            result: "Fail",
            message: "該帳號已被使用"
        })
    }
    else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
                console.error(err);
                res.send({
                    result: "Fail",
                    message: "bcrypt(hash) error"
                })

            }
            const dbQuery2 = "INSERT INTO account (name, hash_password) VALUES ($1, $2) RETURNING id;"
            const dbParams2 = [name, hash];
            const dbResult2 = await db.query(dbQuery2, dbParams2);
            const { id } = dbResult2.rows[0];
            res.send({
                result: "Success",
                message: "註冊成功",
                id: id
            })
        })
    }
}

// 刪除所有使用者 DELETE /api/v1/users
exports.usersDELETE = async function (req, res) {
    const dbQuery = "TRUNCATE TABLE account RESTART IDENTITY CASCADE;";
    const dbParams = [];
    try { await db.query(dbQuery, dbParams) }
    finally { res.send("Success") }
}

// 使用者名字 GET
exports.userGET = async function (req, res) {
    const userId = req.params.userId;
    const dbQuery = "SELECT name FROM account WHERE id=$1";
    const dbParams = [userId];
    const dbResult = await db.query(dbQuery, dbParams);
    const result = dbResult.rows[0];
    res.send(result);
}

