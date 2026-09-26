const router = require("express").Router();

const multer = require("multer");
const path = require("path");

const { requireAuth } = require("../middleware/auth");
const controller = require("../controllers/blogController");

// ===============================
// MULTER STORAGE
// ===============================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        const safe = path
            .basename(file.originalname, ext)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        cb(
            null,
            `${Date.now()}-${safe || "image"}${ext}`
        );
    }
});


// ===============================
// MULTER UPLOAD
// ===============================

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowed = [
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".gif"
        ];

        const ext = path
            .extname(file.originalname)
            .toLowerCase();

        if (!allowed.includes(ext)) {
            return cb(
                new Error(
                    "Only JPG, PNG, WEBP and GIF images are allowed."
                )
            );
        }

        cb(null, true);
    }
});


// ===============================
// PUBLIC BLOG ROUTES
// ===============================

router.get(
    "/published",
    controller.getPublishedBlogs
);

router.get(
    "/published/:slug",
    controller.getPublishedBlogBySlug
);


// ===============================
// ADMIN BLOG ROUTES
// ===============================

router.get(
    "/",
    requireAuth,
    controller.getAllBlogs
);

router.get(
    "/:id",
    requireAuth,
    controller.getBlogById
);

router.post(
    "/",
    requireAuth,
    upload.single("image"),
    controller.createBlog
);

router.put(
    "/:id",
    requireAuth,
    upload.single("image"),
    controller.updateBlog
);

router.delete(
    "/:id",
    requireAuth,
    controller.deleteBlog
);

router.patch(
    "/:id/toggle-status",
    requireAuth,
    controller.toggleBlogStatus
);


module.exports = router;