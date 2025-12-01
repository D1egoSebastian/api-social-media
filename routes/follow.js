const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow")
const check = require("../middlewares/auth")


//definir rutas
router.post("/save", check.auth, FollowController.Save)
router.delete("/unfollow/:id", check.auth, FollowController.unfollow)

//Exportar router

module.exports = router;