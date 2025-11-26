//importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");


//importar clave secreta
const libjwt = require("../services/jwt")
const secret = libjwt.secret;

//funcion de auth
//middleware
exports.auth = async (req, res, next) => {
    try {
        //Comprobar si llega la cabecera de auth
        if(!req.headers.authorization){
            return res.status(403).send({
                sttus: "error",
                message: "La peticion no tiene el header de auth"
            })
        }

        //Decodificar el token
        let token = req.headers.authorization.replace(/['"]+/g, '')

        try {
            let payload = jwt.decode(token, secret)
            console.log(payload)

            //Comprobar expiracion del token
            if(payload.exp <= moment().unix){
                return res.status(401).send({
                    status: "error",
                    message: "token expirado."
                })
            }

                    //Agregar datos del usuario a la request
                req.user = payload //payload es donde esta la informacion del usuario que se loggeo

        }catch(e){
            return res.status(404).send({
                status: "error",
                message: "token invalido.",
                e
            })
        }



        //pasar a ejecucion
        next();

    } catch(e){
        console.log(e)
    }
}
