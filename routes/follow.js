const express = require("express");
const router = express.Router();
const UserController = require("../controllers/follow")

//definir rutas
router.get("/prueba-follow", UserController.pruebaFollow)

//Exportar router

module.exports = router;