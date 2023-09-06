const db = require('../db');

// 列出使用者的所有筆記 GET /api/v1/notes
exports.notesGET = async function (req, res) {
    const userId = req.user.id;
    const dbQuery = "SELECT id, title, created_at, last_modified_at FROM note WHERE account_id=$1";
    const dbParams = [userId];
    const dbResult = await db.query(dbQuery, dbParams);
    const data = dbResult.rows;
    return res.send({
        result: "Success",
        data: data
    });
}

exports.notesPOST = async function (req, res) {
    const userId = req.user.id;
    const title = req.body.title;
    const body = req.body.body;
    if (!title || typeof (title) !== 'string' || title === "") {
        return res.send({ result: "Fail", message: "標題不可為空" });
    }
    const dbQuery = "INSERT INTO note (title, body, account_id) VALUES ($1, $2, $3) RETURNING id;";
    const dbParams = [title, body, userId];
    const dbResult = await db.query(dbQuery, dbParams);
    const { id } = dbResult.rows[0];
    return res.send({ result: "Success", message: "成功", data: { id: id } });
}

exports.notesDELETE = async function (req, res) {
    const userId = req.user.id;
    const dbQuery1 = `
        DELETE FROM notetag
            WHERE note_id IN (
                SELECT id FROM note
                    WHERE account_id=$1
            );
        `;
    const dbQuery2 = "DELETE FROM note WHERE account_id=$1";
    const dbParams = [userId];
    try {
        await db.query(dbQuery1, dbParams);
        await db.query(dbQuery2, dbParams);
    }
    finally { return res.send({ result: "Success", message: "已刪除所有筆記" }); }
}

// 查看筆記 GET /api/v1/notes/:noteId
exports.noteGET = async function (req, res) {
    const userId = req.user.id;
    const noteId = req.params.noteId;
    const dbQuery1 = "SELECT title, body, account_id, created_at, last_modified_at FROM note WHERE id=$1";
    const dbParams1 = [noteId];
    const dbResult1 = await db.query(dbQuery1, dbParams1);
    if (dbResult1.rows.length === 0) {
        return res.send({ result: "Fail", message: "查無紀錄" });
    }
    else {
        const { title, body, account_id, created_at, last_modified_at } = dbResult1.rows[0];

        if (account_id !== userId) {
            return res.send({ result: "Fail", message: "您並非筆記擁有者" });
        }

        const dbQuery2 = "SELECT id, name FROM tag WHERE id IN (SELECT tag_id FROM notetag WHERE note_id=$1);";
        const dbParams2 = [noteId];
        const dbResult2 = await db.query(dbQuery2, dbParams2);
        const tags = dbResult2.rows;
        const data = {
            title: title,
            body: body,
            account_id: account_id,
            created_at: created_at,
            last_modified_at: last_modified_at,
            tags: tags
        }
        return res.send({
            result: "Success",
            data: data
        });
    }
}

// 修改筆記 PUT /api/v1/notes/:noteId
exports.notePUT = async function (req, res) {
    const userId = req.user.id;
    const noteId = req.params.noteId;
    const title = req.body.title;
    const body = req.body.body;
    if (!title || typeof (title) !== 'string' || title === "") {
        return res.send({ result: "Fail", message: "標題不可為空" });
    }
    const dbQuery = "UPDATE note SET title=$1, body=$2, last_modified_at=NOW() WHERE id=$3 AND account_id=$4";
    const dbParams = [title, body, noteId, userId];
    try { await db.query(dbQuery, dbParams) }
    finally {
        return res.send({
            result: "Success",
            message: "已成功修改筆記"
        });
    }
}

// 刪除筆記 DELETE /api/v1/notes/:noteId
exports.noteDELETE = async function (req, res) {
    const userId = req.user.id;
    const noteId = req.params.noteId;
    const dbQuery1 = "SELECT * FROM note WHERE id=$1 AND account_id=$2";
    const dbParams1 = [noteId, userId];
    const dbResult1 = await db.query(dbQuery1, dbParams1);
    if (dbResult1.rows.length === 0) {
        return res.send({
            result: "Fail",
            message: "查無筆記"
        })
    }
    const dbQuery2 = "DELETE FROM notetag WHERE note_id=$1;";
    const dbQuery3 = "DELETE FROM note WHERE id=$1;";
    const dbParams = [noteId];
    try {
        await db.query(dbQuery2, dbParams)
        await db.query(dbQuery3, dbParams)
    }
    finally { return res.send({ result: "Success", message: "已刪除" }); }
}

// 為筆記新增標籤 POST /api/v1/notes/:noteId/tags/:tagId
exports.notetagPOST = async function (req, res) {
    const noteId = req.params.noteId;
    const tagId = req.params.tagId;
    const dbQuery = "INSERT INTO notetag (note_id, tag_id) VALUES ($1, $2);";
    const dbParams = [noteId, tagId];
    try { await db.query(dbQuery, dbParams) }
    finally { return res.send({ result: "Success", message: "成功" }); }
}

// 為筆記移除標籤 DELETE /api/v1/notes/:noteId/tags/:tagId
exports.notetagDELETE = async function (req, res) {
    const noteId = req.params.noteId;
    const tagId = req.params.tagId;
    const dbQuery = "DELETE FROM notetag WHERE note_id=$1 AND tag_id=$2;";
    const dbParams = [noteId, tagId];
    try { await db.query(dbQuery, dbParams) }
    finally { return res.send({ result: "Success", message: "成功" }); }
}