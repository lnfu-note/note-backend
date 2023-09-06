const db = require('../db');

exports.tagNameGET = async function (req, res) {
    const userId = req.user.id;
    const tagId = req.params.tagId;
    const dbQuery = "SELECT name FROM tag WHERE id=$1 AND account_id=$2";
    const dbParams = [tagId, userId];
    const dbResult = await db.query(dbQuery, dbParams);
    if (dbResult.rows.length === 0) {
        return res.send({ result: "Fail", message: "查無此標籤" });
    }
    const { name } = dbResult.rows[0];
    return res.send({ result: "Success", data: { name: name } });
}


// 列出所有標籤 GET /api/v1/tags
exports.tagsGET = async function (req, res) {
    const userId = req.user.id;
    const dbQuery = "SELECT id, name FROM tag WHERE account_id=$1";
    const dbParams = [userId];
    const dbResult = await db.query(dbQuery, dbParams);
    const data = dbResult.rows;
    return res.send({ result: "Success", data: data });
}

// 新增一個標籤 POST /api/v1/tags
exports.tagsPOST = async function (req, res) {
    const userId = req.user.id;
    const name = req.body.name;
    if (!name || typeof (name) !== 'string' || name === "") {
        return res.send({ result: "Fail", message: "標籤不可為空" });
    }
    const dbParams = [userId, name];

    const dbQuery1 = "SELECT * FROM tag WHERE account_id=$1 AND name=$2";
    const dbResult1 = await db.query(dbQuery1, dbParams);
    if (dbResult1.rows.length !== 0) {
        return res.send({
            result: "Fail",
            message: "標籤已存在"
        });
    }
    const dbQuery2 = "INSERT INTO tag (account_id, name) VALUES ($1, $2);";
    try { await db.query(dbQuery2, dbParams) }
    finally { return res.send({ result: "Success" }) }
}

// 刪除所有標籤 POST /api/v1/tags
exports.tagsDELETE = async function (req, res) {
    const userId = req.user.id;
    const dbQuery1 = `
        DELETE FROM notetag
            WHERE tag_id IN (
                SELECT id FROM tag
                    WHERE account_id=$1
            )
        `;
    const dbQuery2 = "DELETE FROM tag WHERE account_id=$1";
    const dbParams = [userId]
    try {
        await db.query(dbQuery1, dbParams);
        await db.query(dbQuery2, dbParams);
    }
    finally { return res.send({ result: "Success", message: "已刪除所有標籤" }); }
}

// 修改標籤 PUT /api/v1/tags/:tagId
exports.tagPUT = async function (req, res) {
    const tagId = req.params.tagId;
    const name = req.body.name;
    const dbQuery = "UPDATE tag SET name=$1 WHERE id=$2;";
    const dbParams = [name, tagId];
    try { await db.query(dbQuery, dbParams) }
    finally { res.send("Success") }
}

// 刪除一個標籤 DELETE /api/v1/tags/:tagId
exports.tagDELETE = async function (req, res) {
    const tagId = req.params.tagId;
    const dbQuery = `
        DELETE FROM notetag WHERE tag_id = $1;
        DELETE FROM tag WHERE id = $1;
    `;
    const dbParams = [tagId];
    try { await db.query(dbQuery, dbParams) }
    finally { res.send("Success") }
}

// 列出使用標籤的所有筆記 GET /tags/:tagId/notes
exports.tagNotesGET = async function (req, res) {
    const userId = req.user.id;
    const tagId = req.params.tagId;

    const dbQuery1 = "SELECT * FROM tag WHERE id=$1 AND account_id=$2";
    const dbParams1 = [tagId, userId];
    const dbResult1 = await db.query(dbQuery1, dbParams1);
    if (dbResult1.rows.length === 0) {
        return res.send({
            result: "Fail",
            message: "查無此標籤",
        });
    }
    const dbQuery2 = `
        SELECT id, title, created_at, last_modified_at FROM note
            WHERE id IN (
                SELECT note_id FROM notetag
                    WHERE tag_id=$1
            )
    `;
    const dbParams2 = [tagId];
    const dbResult2 = await db.query(dbQuery2, dbParams2);
    const data = dbResult2.rows;
    return res.send({
        result: "Success",
        data: data
    });
}