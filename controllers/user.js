//importar dependencias y modulos
const User = require("../models/user");
const mongoose = require("mongoose")
const bcrypt = require("bcrypt");
const user = require("../models/user");
const jwt = require("../services/jwt");
const mongoosePagination = require("mongoose-paginate-v2");
const path = require("path");
const fs = require("fs/promises");

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
        let test = userToFind.password

        if(!pwd) {
            return res.status(404).json({
                status: "error",
                message: "Los datos son invalidos",
                test
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
                id: userToFind._id,
                image: userToFind.image
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
    try {
        //recoger info del usuario del token
        const userIdentity = req.user;
        const userToUpdate = req.body;

        //Eliminar campos sobrantes
        delete userToUpdate.iat;
        delete userToUpdate.exp;
        delete userToUpdate.role;
        delete userToUpdate.image;

        //Comprobar si ya existe email o nick (si vienen en el body)
        if (userToUpdate.email || userToUpdate.nick) {

            const userToFind = await User.find({
                $or: [
                    { email: userToUpdate.email?.toLowerCase() },
                    { nick: userToUpdate.nick?.toLowerCase() }
                ]
            });

            let UserIsset = false;

            userToFind.forEach(user => {
                if (user && user.id != userIdentity.id) {
                    UserIsset = true;
                }
            });

            if (UserIsset) {
                return res.status(400).json({
                    status: "error",
                    message: "El usuario ya existe"
                });
            }
        }

        //Si hay contraseña, cifrarla
        if (userToUpdate.password) {
            userToUpdate.password = await bcrypt.hash(userToUpdate.password, 10);
        }


        //Buscar y actualizar
        let userUpdated = await user.findByIdAndUpdate({_id: userIdentity.id}, userToUpdate, {new:true})

        if(!userUpdated){
            return res.status(500).json({
                status: "error",
                message: "Error al actualizarr",
            });            
        }

            //devolver respuesta
            return res.status(200).json({
            status: "success",
            message: "Datos recibidos correctamente",
            data: userToUpdate
        });



    } catch (e) {
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor",
            error: e.message
        });
    }
};

const upload = async (req, res) => {

    //Recoger el fichero de imagen y comprobar que existe
    if(!req.file){
        return res.status(404).send({
            status: "error",
            message: "la peticion no incluye la imagen."
        })
    }

    //Conseguir el nombre del archivo
    let image = req.file.originalname;

    //Sacar la extension
    let imageSplit = image.split("\.");
    let extension = imageSplit[1];

    //Comprobar extension
    if(extension != "png" && extension != "jpg" && extension != "gif"){

          //SI no es correcto borrar
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath)
        return res.status(400).send({
            status: "error",
            message: "extension invalida."
        })
    }

  

    //Si es correcto guardar imagen en bd

    let userImage = await user.findByIdAndUpdate({_id :req.user.id}, {image: req.file.filename}, {new: true})
    
    if(!userImage){
            return res.status(400).send({
            status: "error",
            message: "error al actualizar imagen."
        })       
    }

    return res.status(200).send({
        status: "success",
        user : userImage,
        file: req.file,
        image
    })
}

const avatar = async (req, res) => {
    try {
        const file = req.params.file;

        // Ruta absoluta REAL
        const filePath = path.join(__dirname, "..", "uploads", "avatars", file);
        console.log("dirname:", __dirname);


        console.log("Buscando:", filePath);

        await fs.stat(filePath);

        return res.sendFile(filePath);
    } catch (e) {
        return res.status(404).send({
            status: "error",
            message: "No existe"
        });
    }
}



//Exportar
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar
}