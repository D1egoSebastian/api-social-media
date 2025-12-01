const Follow = require("../models/follow");
const User = require("../models/user")

//Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "mensaje enviado desde controllers/follow.js"
    });
}

//Accion de guardar un follow (accion seguir)
const Save = async (req, res) => {
    try {

        //Datos del body
        let params = req.body;

        //Sacar id del usuario identificado
        const identity = req.user;

        //Crear objeto con modelo follow
        let userToFollow = new Follow();
        userToFollow.user = identity.id;
        userToFollow.followed = params.followed;

        //Guardar objeto en la bd

        let userFollowSave = await userToFollow.save();

        if(!userFollowSave){
            return res.status(404).send({
            status: "error",
            message: "No existe el usuario que quieres seguir"
        });
        }

        return res.status(200).send({
            status: "succed",
            message: "ruta de guardar follow",
            identity : req.user,
            userToFollow
        })
    }catch (e) {
        return res.status(404).send({
            status: "error",
            message: "error del servidor"
        });
        }
};

//Accion de borrar un follow (dejar de seguir) 
const unfollow = async (req, res) => {
    try {
        // ID del usuario autenticado
        const userId = req.user.id;

        // ID del usuario que quiero revisar
        let userToUnfollow = req.params.id;

        // Buscar la relación
        let coincidence = await Follow.findOneAndDelete({
            user: userId,
            followed: userToUnfollow
        });

        // Ver si existe relación
        if (!coincidence) {
            return res.status(200).send({
                status: "success",
                message: "No sigues a este usuario",
                coincidence
            });
        }

        return res.status(200).send({
            status: "success",
            message: "has dejado de seguir a el usuario",
            coincidence
        });


    } catch (e) {
        return res.status(500).send({
            status: "error",
            message: "Error del servidor",
            error: e.message
        });
    }
};


//Accion listado de usuario que estoy siguiendo

//Accion listado de usuario que me siguen

//Exportar
module.exports = {
    pruebaFollow,
    Save,
    unfollow
}