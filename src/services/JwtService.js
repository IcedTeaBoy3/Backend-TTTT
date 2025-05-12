const jwt = require('jsonwebtoken');

class JwtService {
    generateAccessToken(payload) {
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' });
    }

    generateRefreshToken(payload) {
        return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '365d' });
    }
    verifyToken(token, secret) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
    }

    async refreshTokenService(refresh_token)  {
        
        try {
            const decoded  = await this.verifyToken(refresh_token, process.env.REFRESH_TOKEN_SECRET);
            if (!decoded) {
                return {
                    status: 'error',
                    message: 'Token không hợp lệ'
                };
            }
            const access_token = this.generateAccessToken({
                id: decoded.id,
                role: decoded.role
            });

            return {
                status: 'success',
                message: 'Đã làm mới token',
                access_token
            };
        } catch (e) {
            return  {
                status: 'error',
                message: e.message
            };
        }
        
    }
}
module.exports = new JwtService();