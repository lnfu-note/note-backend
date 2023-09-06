const jwt = require('jsonwebtoken');
const secretKey = 'YangMing,whichfocusedonbiomedicalresearch,andChiaoTung,whichfocusedonelectroniccommunicationresearch,werebothtop-tieruniversitiesinTaiwan'
const expiresTime = 1000 * 60 * 30; // 30 min

exports.generateToken = (id, name) => {
    const token = jwt.sign({ id: id, name: name }, secretKey, { expiresIn: expiresTime });
    return token;
}

exports.authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.send({
            result: "Fail",
            message: "請先登入"
        });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.send({
                result: "Fail",
                message: "連線階段已過期"
            });
        }

        // 令牌验证成功，将用户信息存储在req.user中
        req.user = decoded;

        next();
    });
}