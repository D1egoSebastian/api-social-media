const Follow = require("../models/follow");
const User = require("../models/user");
const mongoosePaginate = require("mongoose-paginate-v2")
//importar followservice
const followService = require("../services/followUserIds")

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


//Accion listado de usuario que me siguen
//Accion listado de usuarios que ME SIGUEN
const followers = async (req, res) => {
    try {

        // ID del usuario (si no envían id → usa el autenticado)
        let userId = req.params.id || req.user.id;

        // Página
        let page = req.params.page ? parseInt(req.params.page) : 1;

        // Cantidad por página
        const itemsPerPage = 5;

        // Buscar usuarios que ME SIGUEN
        let follows = await Follow.paginate(
            { followed: userId },   
            {
                page: page,
                limit: itemsPerPage,
                populate: [
                    { path: "user", select: "name nick image" },       // El que me sigue
                    { path: "followed", select: "name nick image" }    // Yo
                ],
                sort: { _id: -1 }
            }
        );

        // IDs procesados de seguimiento
        let followUserIds = await followService.followuserIds(userId);

        return res.status(200).send({
            status: "success",
            message: "Usuarios que ME SIGUEN",
            follows,
            user_following: followUserIds.following, // yo sigo a...
            user_follow_me: followUserIds.followers  // me siguen...
        });

    } catch (e) {
        return res.status(500).send({
            status: "error",
            message: "Error del servidor",
            error: e.message
        });
    }
};



//Accion listado de usuario que cualquier usuario que esta siguiendo
const following = async (req, res) => {
    try {
        // Id del usuario
        let userId = req.params.id || req.user.id;

        // Página
        let page = req.params.page ? parseInt(req.params.page) : 1;

        // Cantidad por página
        const itemsPerPage = 5;

        // Paginar directamente en el modelo
        let follows = await Follow.paginate(
            { user: userId },
            {
                page: page,
                limit: itemsPerPage,
                populate: [
                    { path: "user", select: "name nick image" },
                    { path: "followed", select: "name nick image" }
                ],
                sort: { _id: -1 }
            }
        );

        // IDs de usuarios que sigue / seguidores
        let followUserIds = await followService.followuserIds(userId);

        return res.status(200).send({
            status: "success",
            message: "Usuarios que sigo",
            follows,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        });

    } catch (e) {
        return res.status(500).send({
            status: "error",
            message: "Error del servidor",
            error: e.message
        });
    }
};


//Exportar
module.exports = {
    pruebaFollow,
    Save,
    unfollow,
    following,
    followers
}