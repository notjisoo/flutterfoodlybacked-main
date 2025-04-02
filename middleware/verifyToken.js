const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log("Received Authorization Header:", authHeader);
    if (authHeader) {
        const token = authHeader.split(" ")[1];

        // 验证token是否有效
        jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
            if (err) {
                return res.status(403).json({ status: false, message: err.message })
            }
            req.user = user;
            next();
        })
    }
    else {
        return res.status(401).json({ status: false, message: "You are not authenticated!" })
    }
}

const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
        // "Client","Admin","Vendor","Driver"
        if (req.user.userType === 'Client' || req.user.userType === 'Admin' || req.user.userType === 'Vendor' || req.user.userType === 'Driver') {
            next();
        } else {
            return res.status(403).json({ status: false, message: "You are not allowed access the routes!" })
        }
    })
}

const verifyVender = (req, res, next) => {
    verifyToken(req, res, () => {
        // 验证身份是否是 "Admin"或者"Vendor"
        if (req.user.userType === 'Admin' || req.user.userType === 'Vendor') {
            next();
        } else {
            return res.status(403).json({ status: false, message: "You are not allowed access the routes!" })
        }
    })
}

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        // 验证身份是否是 "Admin
        if (req.user.userType === 'Admin') {
            next();
        } else {
            return res.status(403).json({ status: false, message: "You are not allowed access the routes!" })
        }
    })
}

const verifyDriver = (req, res, next) => {
    verifyToken(req, res, () => {
        // 验证身份是否是 "Admin"或者"Vendor"
        if (req.user.userType === 'Vendor') {
            next();
        } else {
            return res.status(403).json({ status: false, message: "You are not allowed access the routes!" })
        }
    })
}

module.exports = {
    verifyTokenAndAuthorization,
    verifyVender,
    verifyAdmin,
    verifyDriver
} 