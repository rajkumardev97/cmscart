var express = require("express");
var router = express.Router();

var auth = require("../config/auth");

var isAdmin = auth.isAdmin; //for restrict the content for non login admin for get request { note: not put in post req}

//Get Category model
var Category = require("../models/category");

/*
 * GET category index
 */
router.get("/", isAdmin, function(req, res) {
  //res.send("cats index");

  Category.find(function(err, categories) {
    if (err) return console.log(err);

    res.render("admin/categories", {
      categories: categories
    });
  });
});

/*
 * GET add category
 */

router.get("/add-category", isAdmin, function(req, res) {
  var title = "";

  res.render("admin/add_category", {
    title: title
  });
});

/*
 * POST add category
 */

router.post("/add-category", function(req, res) {
  req.checkBody("title", "Title must have a value").notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();

  if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();

  var errors = req.validationErrors();

  if (errors) {
    console.log("errors");
    res.render("admin/add_category", {
      errors: errors,
      title: title
    });
  } else {
    // console.log("success");

    Category.findOne({ slug: slug }, function(err, category) {
      if (category) {
        //its means slug is not unique
        req.flash("danger", "category title exists, choose another");

        res.render("admin/add_page", {
          title: title
        });
      } else {
        var category = new Category({
          title: title,
          slug: slug
        });

        category.save(function(err) {
          if (err) return console.log(err);
          Category.find(function(err, categories) {
            if (err) {
              console.log(err);
            } else {
              req.app.locals.categories = categories;
            }
          });
          req.flash("success", "category added");
          res.redirect("/admin/categories");
        });
      }
    });
  }
});

/*
 * GET edit category
 */

router.get("/edit-category/:_id", isAdmin, function(req, res) {
  Category.findById(req.params._id, function(err, category) {
    if (err) return console.log(err);
    res.render("admin/edit_category", {
      title: category.title,
      id: category._id
    });
  });
});

/*
 * POST edit category
 */

router.post("/edit-category/:id", function(req, res) {
  req.checkBody("title", "Title must have a value").notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();

  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    // console.log("errors");
    res.render("admin/edit_category", {
      errors: errors,
      title: title,
      id: id
    });
  } else {
    // console.log("success");

    Category.findOne({ slug: slug, _id: { $ne: id } }, function(err, category) {
      if (category) {
        //its means slug is not unique
        req.flash("danger", "category title exists, choose another");

        res.render("admin/edit_category", {
          title: title,
          id: id
        });
      } else {
        Category.findById(id, function(err, category) {
          if (err) return console.log(err);

          category.title = title;
          category.slug = slug;

          category.save(function(err) {
            if (err) return console.log(err);
            Category.find(function(err, categories) {
              if (err) {
                console.log(err);
              } else {
                req.app.locals.categories = categories;
              }
            });
            req.flash("success", "category edited");
            res.redirect("/admin/categories/edit-category/" + id);
          });
        });
      }
    });
  }
});

/*
 * GET delete category
 */

router.get("/delete-category/:id", isAdmin, function(req, res) {
  Category.findByIdAndRemove(req.params.id, function(err) {
    if (err) return console.log(err);
    Category.find(function(err, categories) {
      if (err) {
        console.log(err);
      } else {
        req.app.locals.categories = categories;
      }
    });
    req.flash("success", "category deleted");
    res.redirect("/admin/categories");
  });
});

//Exports
module.exports = router;
