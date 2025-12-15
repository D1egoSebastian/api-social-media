const publication = require("../models/publication");
const Publication = require ("../models/publication")
const fs = require("fs")
const path = require("path");
const followService = require("../services/followUserIds")
//Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "mensaje enviado desde controllers/publication.js"
    });
}


//Guardar publicacion
const save = async (req, res) => {
    try {

        //recoger datos del body
        let params = req.body;

        //si no llegan mandar error
        if(!params.text){
            return res.status(400).send({
                status: "error",
                message: "debes enviar algun texto."
            })
        }

        //crear y rellenar el objeto del modelo
        let newPublication = new Publication(params);

        //usuario identificado
        newPublication.user = req.user.id
        

        //Guardar objeto en bd
        let newPost = await newPublication.save();
        if(!newPost){
                return res.status(400).send({
                status: "error",
                message: "No se guardo la publicacion."
            })
        }

        //Devolver respuestas
        return res.status(200).send({
            status: "succed",
            message: "Publicacion Guardada.",
            Post: newPost
        })
    }catch(e){
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor",
        }); 
    }
}

//Sacar una publicacion
const detail = async (req, res) => {
try {
        //Sacar el id de la publicacion de la url
    const publicationId = req.params.id;

    //un find sacar la publicacion con el id de la url
    let findPublication = await Publication.findById(publicationId)

    if(!findPublication){
        return res.status(400).send({
                status: "error",
                message: "No se encontro esa publicacion"
            })
    }

    return res.status(200).send({
            status: "succed",
            message: "Ruta de details",
            Publication: findPublication
        })

} catch(e){
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor",
        }); 
    }


}

//Eliminar publicaciones
const remove = async (req, res) => {

    try {
        //Sacar el id de la publicacion
        const publicationId = req.params.id;

        //Find luego remove.
        let PublicationToRemove = await Publication.findOneAndDelete({"user": req.user.id, "_id": publicationId})

        return res.status(200).send({
                status: "succed",
                message: "Se elimino esta publicacion.",
                Eliminado: PublicationToRemove
            })
    } catch(e){
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor",
        }); 
    }

}

//Listar publicaciones de un usuario

const user = async (req, res) => {

    //sacar el id de usuario
    const userId = req.user.id;

    //Controlar la pagina
    let page = 1

    if(req.params.page){
        page = req.params.page
    }

    let maxperpage = 5;

    //Find, populate, ordenar, paginar

    let Publicaciones = await Publication.find({user: userId})
    .sort("-created_at")
    .populate("user", "-password -__v -role -email")

    if(!Publicaciones || Publicaciones.length == 0) {
        return res.status(500).json({
            status: "error",
            message: "No hay publicaciones para mostrar.",
        }); 
    }

    //Devolver res
    return res.status(200).send({
                status: "succed",
                message: "Publicacion del perfil.",
                user: req.user,
                Publicaciones
            })
            
}

//Subir ficheros

const upload = async (req, res) => {

    //sacar publication id;

    let publicationId = req.params.id

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

    let publicationImage = await publication.findByIdAndUpdate({"user" :req.user.id, "_id": publicationId}, {file: req.file.filename}, {new: true})
    
    if(!publicationImage){
            return res.status(400).send({
            status: "error",
            message: "error al actualizar imagen."
        })       
    }

    return res.status(200).send({
        status: "success",
        file: req.file,
        publication: publicationImage
    })
}



//Devolver archivos multimedia imagenes
const media = async (req, res) => {
    try {
        const file = req.params.file;

        // Ruta absoluta REAL
        const filePath = path.join(__dirname, "..", "uploads", "publications", file);
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


//Listar las publicaciones (de quienes sigo) (feed)
const feed = async (req, res) => {

    //sacar la pagina actual
    let page = 1;

    if(req.params.page) {
        page = req.params.page
    }

    //establecer numero de elem por paginas
    let itemsPerPage = 5;

    //sacar array de id de personas que sigo como usuario identificado
    try{
        const myFollows = await followService.followuserIds(req.user.id)

        //find a publicaciones in, ordernar, popular, paginar
        let PublicationToFeed = await Publication.find({
            user: myFollows.following
            
        }).populate("user", "-password -role -__v -email").sort("-created_at")


        return res.status(200).send({
                status: "succed",
                message: "ruta del feed",
                myFollows: myFollows.following,
                PublicationToFeed
            })
            
    }catch(e){
        return res.status(500).send({
                status: "error",
                message: "No se han listado las publicaciones del Feed"
            })
    }
    
    
        
}


//Exportar
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}