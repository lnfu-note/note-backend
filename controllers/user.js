const db = require('../db');
const bcrypt = require('bcrypt');
const saltRounds = 10; // bcrypt
const auth = require('../utils/auth')

exports.login = async function (req, res) {
    const name = req.body.name;
    const password = req.body.password;
    if (!name || !password || typeof (name) !== 'string' || typeof (password) !== 'string') {
        return res.send({
            result: "Fail",
            message: "請輸入帳號和密碼",
        });
    }
    const dbQuery = "SELECT id, hash_password FROM account WHERE name=$1";
    const dbParams = [name];
    const dbResult = await db.query(dbQuery, dbParams);
    if (dbResult.rows.length === 0) {
        return res.send({
            result: "Fail",
            message: "帳號不存在"
        })
    }
    const { id, hash_password: hashPassword } = dbResult.rows[0];
    bcrypt.compare(password, hashPassword, function (err, pass) {
        if (pass) {
            const token = auth.generateToken(id, name);
            return res.send({
                result: "Success",
                message: "登入成功",
                id: id,
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
    const dbQuery = "SELECT id, name, created_at FROM account";
    const dbParams = [];
    const dbResult = await db.query(dbQuery, dbParams);
    const data = dbResult.rows;
    return res.send({
        result: "Success",
        data: data
    });
}

// 新增一位使用者 POST /api/v1/users
exports.usersPOST = async function (req, res) {
    const name = req.body.name;
    const password = req.body.password;
    if (!name || !password || typeof (name) !== 'string' || typeof (password) !== 'string') {
        return res.send({
            result: "Fail",
            message: "請輸入帳號和密碼"
        });
    }
    // 找出是否已經有使用此名字的帳號
    const dbQuery1 = "SELECT * FROM account WHERE name=$1";
    const dbParams1 = [name];
    const dbResult1 = await db.query(dbQuery1, dbParams1);
    if (dbResult1.rows.length !== 0) {
        return res.send({
            result: "Fail",
            message: "該帳號已被使用"
        });
    }
    bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
            console.error(err);
            return res.send({
                result: "Fail",
                message: "bcrypt(hash) error"
            });
        }
        // 註冊（新增）帳號
        const dbQuery2 = "INSERT INTO account (name, hash_password) VALUES ($1, $2) RETURNING id;"
        const dbParams2 = [name, hash];
        const dbResult2 = await db.query(dbQuery2, dbParams2);
        const { id } = dbResult2.rows[0];
        return res.send({
            result: "Success",
            message: "註冊成功",
            data: { id: id }
        });
    })
}

// 刪除所有使用者 DELETE /api/v1/users
exports.usersDELETE = async function (req, res) {
    const dbQuery = "TRUNCATE TABLE account RESTART IDENTITY CASCADE;";
    const dbParams = [];
    try { await db.query(dbQuery, dbParams) }
    finally {
        return res.send({
            result: "Success",
            message: "已刪除所有帳號"
        })
    }
}
