const db = require('../db');

// 列出使用者的所有筆記 GET /api/v1/notes
exports.notesGET = async function (req, res) {
    const userInfo = req.user;
    const userId = userInfo.id;
    const dbQuery = "SELECT * FROM note WHERE account_id=$1;";
    const dbParams = [userId];
    const dbResult = await db.query(dbQuery, dbParams);
    const result = dbResult.rows.map(({ id, title, created_at, last_modified_at }) => ({ id, title, created_at, last_modified_at }));
    res.send(result);
}

exports.notesPOST = async function (req, res) {
    const userInfo = req.user;
    const userId = userInfo.id;
    const title = req.body.title;
    const body = req.body.body;
    if (!title || typeof (title) !== 'string' || title === "") {
        return res.send({ result: "Fail", message: "請輸入標題" });
    }
    const dbQuery = "INSERT INTO note (title, body, account_id) VALUES ($1, $2, $3) RETURNING id;";
    const dbParams = [title, body, userId];
    const dbResult = await db.query(dbQuery, dbParams);
    const result = dbResult.rows[0].id;
    res.send({ result: "Success", message: "成功", data: { id: result } })
}

exports.notesDELETE = async function (req, res) {
    const userInfo = req.user;
    const userId = userInfo.id;
    const dbQuery1 = `
        DELETE FROM notetag
            WHERE note_id IN (
                SELECT id FROM note
                    WHERE account_id=$1
            );
        `;
    const dbQuery2 = "DELETE FROM note WHERE account_id=$1;";
    const dbParams = [userId];
    try {
        await db.query(dbQuery1, dbParams);
        await db.query(dbQuery2, dbParams);
    }
    finally { res.send({ result: "Success", message: "已刪除所有筆記" }) }
}




// 查看筆記 GET /api/v1/notes/:noteId
exports.noteGET = async function (req, res) {
    const userInfo = req.user;
    const userId = userInfo.id;

    const noteId = req.params.noteId;
    const dbQuery1 = "SELECT * FROM note WHERE id=$1;"
    const dbParams1 = [noteId];
    const dbResult1 = await db.query(dbQuery1, dbParams1);
    if (dbResult1.rows.length === 0) {
        return res.send({ result: "Fail", message: "查無紀錄" });
    }
    else {
        if (dbResult1.rows[0].account_id !== userId) {
            return res.send({ result: "Fail", message: "您並非筆記擁有者" });
        }

        // tag
        const dbQuery2 = "SELECT id, name FROM tag WHERE id IN (SELECT tag_id FROM notetag WHERE note_id=$1);";
        const dbParams2 = [noteId];
        const dbResult2 = await db.query(dbQuery2, dbParams2);

        const result = {
            title: dbResult1.rows[0].title,
            body: dbResult1.rows[0].body,
            account_id: dbResult1.rows[0].account_id,
            created_at: dbResult1.rows[0].created_at,
            last_modified_at: dbResult1.rows[0].last_modified_at,
            tags: dbResult2.rows
        }
        res.send({
            result: "Success",
            data: result
        });
    }
}

// 修改筆記 PUT /api/v1/notes/:noteId
exports.notePUT = async function (req, res) {
    const noteId = req.params.noteId;
    const title = req.body.title;
    const body = req.body.body;
    if (!title || !body || typeof (title) !== 'string' || typeof (body) !== 'string') {
        res.send("Please provide { title: string, body: string }");
    }
    const dbQuery = "UPDATE note SET title=$1, body=$2, last_modified_at=NOW() WHERE id=$3;";
    const dbParams = [title, body, noteId];
    try { await db.query(dbQuery, dbParams) }
    finally { res.send("Success") }
}

// 刪除筆記 DELETE /api/v1/notes/:noteId
exports.noteDELETE = async function (req, res) {
    const noteId = req.params.noteId;
    const dbQuery1 = "DELETE FROM notetag WHERE note_id=$1;";
    const dbQuery2 = "DELETE FROM note WHERE id=$1;";
    const dbParams = [noteId];
    try {
        await db.query(dbQuery1, dbParams)
        await db.query(dbQuery2, dbParams)
    }
    finally { res.send("Success") }
}

// 查看筆記所有標籤 GET /api/v1/notes/:noteId/tags
exports.noteTagIdsGET = async function (req, res) {
    const noteId = req.params.noteId;
    const dbQuery = "SELECT * FROM notetag WHERE note_id=$1;";
    const dbParams = [noteId];
    const dbResult = await db.query(dbQuery, dbParams);
    const result = dbResult.rows;
    console.log(result);
    res.send("NOT IMPLEMENTED: note tag_ids GET");
}

// 為筆記新增標籤 POST /api/v1/notes/:noteId/tags/:tagId
exports.notetagPOST = async function (req, res) {
    const noteId = req.params.noteId;
    const tagId = req.params.tagId;
    const dbQuery = "INSERT INTO notetag (note_id, tag_id) VALUES ($1, $2);";
    const dbParams = [noteId, tagId];
    try { await db.query(dbQuery, dbParams) }
    finally { res.send({ result: "Success", message: "成功" }) }
}

// 為筆記移除標籤 DELETE /api/v1/notes/:noteId/tags/:tagId
exports.notetagDELETE = async function (req, res) {
    const noteId = req.params.noteId;
    const tagId = req.params.tagId;
    const dbQuery = "DELETE FROM notetag WHERE note_id=$1 AND tag_id=$2;";
    const dbParams = [noteId, tagId];
    try { await db.query(dbQuery, dbParams) }
    finally { res.send("Success") }
}