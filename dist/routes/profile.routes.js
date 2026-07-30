"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("../controllers/profile.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const profile_controller_2 = require("../controllers/profile.controller");
const profile_controller_3 = require("../controllers/profile.controller");
const router = (0, express_1.Router)();
// Phải có Token mới được vào Profile
router.use(auth_middleware_1.verifyToken);
router.get('/', profile_controller_1.getProfile);
router.put('/', profile_controller_1.updateProfile);
router.put('/change-password', profile_controller_2.changePassword);
router.put('/push-token', profile_controller_3.savePushToken);
exports.default = router;
