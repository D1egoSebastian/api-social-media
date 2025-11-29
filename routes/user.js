const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user")
const check = require("../middlewares/auth")
const multer = require("multer")

//configuracion de subida (donde iran los archivos) (que nombre tendran)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars/")
    },

    filename: (req, file, cb) => {
        cb(null, "avatar-"+Date.name()+"-"+file.originalname)
    }
});

const uploads = multer({storage});

//definir rutas
router.get("/prueba-usuario", check.auth, UserController.pruebaUser);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", check.auth, UserController.profile);
router.get("/list/:page", check.auth, UserController.list)
router.put("/update", check.auth, UserController.update) //en el checkauth ya tendra el usuario a editar por lo tanto no es necesario el /:id
router.post("/upload", [check.auth, uploads.single("file0")], UserController.upload)

//Exportar router

module.exports = router;