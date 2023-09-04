const db = require('../db');

// 列出所有標籤 GET /api/v1/tags
exports.tagsGET = async function (req, res) {
    const dbQuery = "SELECT * FROM tag;";
    const dbParams = [];
    const dbResult = await db.query(dbQuery, dbParams);
    const result = dbResult.rows;
    res.send({ result: "Success", data: result });
}

// 新增一個標籤 POST /api/v1/tags
exports.tagsPOST = async function (req, res) {
    const name = req.body.name;
    if (!name || typeof (name) !== 'string') {
        return res.send({ result: "Fail", message: "標籤不可為空" });
    }

    const dbQuery1 = "SELECT * FROM tag WHERE name=$1";
    const dbParams1 = [name];
    const dbResult1 = await db.query(dbQuery1, dbParams1);
    if (dbResult1.rows.length !== 0) {
        return res.send({
            result: "Fail",
            message: "標籤已存在"
        })
    }
    const dbQuery2 = "INSERT INTO tag (name) VALUES ($1);";
    const dbParams2 = [name];
    try { await db.query(dbQuery2, dbParams2) }
    finally { res.send({ result: "Success" }) }
}

// 刪除所有標籤 POST /api/v1/tags
exports.tagsDELETE = async function (req, res) {
    const dbQuery = "TRUNCATE TABLE tag RESTART IDENTITY CASCADE;";
    try { await db.query(dbQuery) }
    finally { res.send("Success") }
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
        DELETE FROM notetag WHERE tag_id=$1;
        DELETE FROM tag WHERE id=$1;
    `;
    const dbParams = [tagId];
    try { await db.query(dbQuery, dbParams) }
    finally { res.send("Success") }
}

// 列出使用標籤的所有筆記 GET /tags/:tagId/notes
exports.tagNoteIdsGET = async function (req, res) {
    const tagId = req.params.tagId;
    const dbQuery = "SELECT * FROM notetag WHERE tag_id=$1;";
    const dbParams = [tagId];
    const dbResult = await db.query(dbQuery, dbParams);
    const result = dbResult.rows;
    console.log(result);
    res.send("NOT IMPLEMENTED: tag note_ids GET");
}