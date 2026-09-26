const Blog = require("../models/Blog");


// ===============================
// CREATE SLUG
// ===============================

function createSlug(title) {
    return String(title || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}


// ===============================
// PUBLIC - ALL PUBLISHED BLOGS
// ===============================

const getPublishedBlogs = async (req, res) => {

    try {

        const blogs = await Blog.find({
            status: "published"
        }).sort({
            createdAt: -1
        });

        res.json(blogs);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch blogs"
        });
    }
};


// ===============================
// PUBLIC - SINGLE BLOG
// ===============================

const getPublishedBlogBySlug = async (req, res) => {

    try {

        const blog = await Blog.findOne({
            slug: req.params.slug,
            status: "published"
        });

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.json(blog);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch blog"
        });
    }
};


// ===============================
// ADMIN - ALL BLOGS
// ===============================

const getAllBlogs = async (req, res) => {

    try {

        const blogs = await Blog.find()
            .sort({ createdAt: -1 });

        res.json(blogs);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch blogs"
        });
    }
};


// ===============================
// ADMIN - GET ONE
// ===============================

const getBlogById = async (req, res) => {

    try {

        const blog = await Blog.findById(
            req.params.id
        );

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.json(blog);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch blog"
        });
    }
};


// ===============================
// ADMIN - CREATE BLOG
// ===============================

const createBlog = async (req, res) => {

    try {

        const {
            title,
            category,
            author,
            short_description,
            content,
            status
        } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: "Title and content are required."
            });
        }

        let slug = createSlug(title);

        // Make slug unique
        const existingSlug = await Blog.findOne({
            slug
        });

        if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
        }

        const image = req.file
            ? `/uploads/${req.file.filename}`
            : "";

        const blog = await Blog.create({
            title,
            slug,
            category: category || "Technology",
            author: author || "CodeTykoons",
            short_description: short_description || "",
            content,
            image,
            status: status || "draft"
        });

        res.status(201).json(blog);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to create blog"
        });
    }
};


// ===============================
// ADMIN - UPDATE BLOG
// ===============================

const updateBlog = async (req, res) => {

    try {

        const blog = await Blog.findById(
            req.params.id
        );

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        const title = req.body.title || blog.title;

        let slug = createSlug(title);

        const duplicateSlug = await Blog.findOne({
            slug,
            _id: { $ne: blog._id }
        });

        if (duplicateSlug) {
            slug = `${slug}-${Date.now()}`;
        }

        blog.title = title;
        blog.slug = slug;
        blog.category =
            req.body.category || "Technology";
        blog.author =
            req.body.author || "CodeTykoons";
        blog.short_description =
            req.body.short_description || "";
        blog.content =
            req.body.content || "";
        blog.status =
            req.body.status || "draft";

        if (req.file) {
            blog.image =
                `/uploads/${req.file.filename}`;
        }

        await blog.save();

        res.json(blog);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to update blog"
        });
    }
};


// ===============================
// ADMIN - DELETE BLOG
// ===============================

const deleteBlog = async (req, res) => {

    try {

        const blog = await Blog.findByIdAndDelete(
            req.params.id
        );

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.json({
            message: "Blog deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to delete blog"
        });
    }
};


// ===============================
// ADMIN - TOGGLE STATUS
// ===============================

const toggleBlogStatus = async (req, res) => {

    try {

        const blog = await Blog.findById(
            req.params.id
        );

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        blog.status =
            blog.status === "published"
                ? "draft"
                : "published";

        await blog.save();

        res.json(blog);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to change blog status"
        });
    }
};


module.exports = {
    getPublishedBlogs,
    getPublishedBlogBySlug,
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    toggleBlogStatus
};