//importar dependencias y modulos
const User = require("../models/user");
const mongoose = require("mongoose")
const bcrypt = require("bcrypt");
const user = require("../models/user");
const jwt = require("../services/jwt");
const mongoosePagination = require("mongoose-paginate-v2")

//Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "mensaje enviado desde controllers/user.js",
        usuario: req.user
    });
}

const register = async (req, res) => {
    console.log("body recibido", req.body)
    try {
        //Recoger datos de la peticion
        let params = req.body;

        //Comprobar que llegan bien (+ validacion)
        if(!params.nick || !params.name || !params.email || !params.password) {
            console.log("validacion incorrecta")  
            return res.status(400).json({
                status: "error",
                message: "Faltan datos a enviar"
            })
                
        } else {
            console.log("Validacion minima pasada")
        }



        //Control de usuarios duplicados (antes de guardar revisar si existe)

        //Control de usuarios duplicados
        const userToFind = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() }
            ]
        });

        if(userToFind.length >= 1){
            return res.status(400).json({
                status: "error",
                message: "El usuario ya existe"
            });
        }


        //Cifrar el password del usuario nuevo registrandose
        const hashedPassword = await bcrypt.hash(params.password , 10);
        params.password = hashedPassword;
        

        //Objeto dle usuario
        let user_to_save = new User(params)


        //Guardar usuario en la bd
        let SaveUser = await user_to_save.save()

        //Devolver res
        return res.status(200).json({
            status: "success",
            message: "Accion de registro de usuarios",
            user_to_save,
        })
        


    } catch(e) {
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor",
        });

    }
}


const login = async (req, res) => {
    try {

        //Recoger datos del body
        let params = req.body

        if(!params.email || !params.password){
            return res.status(400).json({
                status: "error",
                message: "Faltan datos por enviar"
            })
        }

        //Revisar si existe en la db
        const userToFind = await User.findOne({
            $or: [
                { email: params.email.toLowerCase() }
            ]
        });

        if(!userToFind) {
            return res.status(404).json({
                status: "error",
                message: "Este usuario no existe."
            })
        }

        //Comprobar su password
        const pwd = bcrypt.compareSync(params.password, userToFind.password)

        if(!pwd) {
            return res.status(404).json({
                status: "error",
                message: "Los datos son invalidos"
            })   
        }


        //devolver token
        const token = jwt.createToken(userToFind);

        //datos del usuario
        return res.status(200).send({
            status: "success",
            message: "Has sido comprobado",
            userToFind : {
                name: userToFind.name,
                nick: userToFind.nick,
                id: userToFind._id
            },
            token
        })
    } catch(e){
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor",
        });       
    }
}


const profile = async (req, res) => {
    try {
            //Recibir el parametro del id del usuaro por la url
            const id = req.params.id;

            //consulta para sacar los datos del usuario
            const userProfile = await user.findById(id).select({password: 0, role: 0})

            if(!userProfile){
                return res.status(404).send({
                    status: "error",
                    message: "el usuario no existe o hay un error."
                })
            }

            return res.status(200).send({
                status: "success",
                user: userProfile
            })
           
           

            //Devolver resultado
    } catch(e){
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor",
        }); 
    }

}

const list = async (req, res) => {
    try {

        //Controlar en que pagina estamos
        let page = 1;
        if(req.params.page){
            page = req.params.page
        }

        page = parseInt(page);

        //consulta con moongose paginate
        let itemsPerPage = 5;

        const options = {
            page: page,
            limit: itemsPerPage,
            sort: {_id:1},
        }

        const result = await user.paginate({}, options)

        if(!result || result.length == 0) {
            return res.status(404).json({
                status: "error",
                message: "error en la consulta"
            })
        }

        //devolver resultado con la pagina
            return res.status(200).send({
            status: "success",
            message: "ruta de usuarios.",
            users: result.docs,
            page: result.page,
            itemsPerPage: result.limit,
            total: result.totalDocs,
            pages: result.totalPages
             })
             
    } catch(e){
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor",
        }); 
    }
}


//Actualizar perfil
const update = async (req, res) => {

}
//Exportar
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list
}