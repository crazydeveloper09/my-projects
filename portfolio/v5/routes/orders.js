const express = require("express"),
    Order = require("../models/orders"),
    app = express(),
    methodOverride = require("method-override"),
    async = require("async"),
    i18n = require("i18n"),
    flash = require("connect-flash"),
    router = express.Router();


app.use(flash());
app.use(methodOverride("_method"));

router.get("/new", (req, res) => {
    Order.find({}, (err, orders) => {
        if(err){
            console.log(err)
        } else {
            i18n.setLocale(req.language);
            let header = "Nowe zamówienie | Zamówienia stron | Portfolio | Maciej Kuta";
            res.render("./orders/new", {orders:orders,header: header})
        }
    })
    
        
});

router.get("/description", (req, res) => {
    Order.find({}, (err, orders) => {
        if(err){
            console.log(err)
        } else {
            i18n.setLocale(req.language);
            let header = "Opis | Zamówienia stron | Portfolio | Maciej Kuta";
           
            res.render("./orders/description", {orders:orders, currentUser: req.user, header:header})
        }
    })
    
});

router.get("/", isLoggedIn, (req, res) => {
    Order.find({}, (err, orders) => {
        if(err){
            console.log(err)
        } else {
            let header = "Zamówienia stron | Portfolio | Maciej Kuta";
            
            res.render("./orders/index", {orders:orders, currentUser: req.user, header:header})
        }
    })
})

router.post("/", (req, res) => {
    if(req.body.type === "new"){
        let newOrder = new Order({
            name: req.body.nameN,
            email: req.body.emailN,
            whatYouWish: req.body.whatYouWishN,
            status: "Zamówienie wysłane do mnie",
            statusEn: "Order has been sent to me",
            type: req.body.type,
            websiteTitle: req.body.websiteTitleN
        })
        Order.create(newOrder, (err, createdOrder) => {
            if(err){
                console.log(err)
            } else {
                req.flash("success", i18n.__("Zamówienie zostało pomyślnie wysłane"))
                res.redirect(`/website-orders/description`)
                   
                
            }
        })
    } else {
        let newOrder = new Order({
            name: req.body.name,
            email: req.body.email,
            whatYouWish: req.body.whatYouWish,
            previousWebsite: req.body.previousWebsite,
            status: "Zamówienie wysłane do mnie",
            statusEn: "Order has been sent to me",
            type: req.body.type,
            websiteTitle: req.body.websiteTitle
        })
        Order.create(newOrder, (err, createdOrder) => {
            if(err){
                console.log(err)
            } else {
                req.flash("success", "Zamówienie zostało pomyślnie wysłane")
                res.redirect(`/website-orders/description`)
                   
                
            }
        })
    }
    
    
})

router.get("/check-status", (req, res) => {
    Order.findOne({email: req.query.email}, (err, order) => {
        if(err){
            console.log(err);
        } else {
            i18n.setLocale(req.language);
            let header = "Sprawdź status | Zamówienia stron | Portfolio | Maciej Kuta";
            res.render("./orders/checkStatus", { lang: req.language,header:header, order:order, currentUser: req.user, orders:""})
        }
    })
})

router.get("/:order_id/edit", isLoggedIn, (req, res) => {
    Order.findById(req.params.order_id, (err, order) => {
        if(err){
            console.log(err);
        } else {
            let header = "Edytuj zamówienie | Zamówienia stron | Portfolio | Maciej Kuta";
            res.render("./orders/edit", {order:order,header: header, currentUser: req.user, orders:""})
        }
    })
})

router.put("/:order_id", isLoggedIn, (req, res) => {
    Order.findByIdAndUpdate(req.params.order_id, req.body.order, (err, updatedOrder) => {
        if(err){
            console.log(err);
        } else {
            res.redirect(`/website-orders`)
        }
    })
})

router.get("/:order_id/delete", isLoggedIn, (req, res) => {
    Order.findByIdAndRemove(req.params.order_id, (err, deletedorder) => {
        if(err){
            console.log(err);
        } else {
            res.redirect(`/website-orders`)
        }
    })
})

router.get("/:id/send", isLoggedIn, (req, res) => {
	Order.findById(req.params.id, (err, order) => {
		if(err){
			console.log(err)
		} else {
			let header = "Wyślij ofertę | Zamówienia stron | Portfolio | Maciej Kuta";
			res.render("./orders/send", {currentUser: req.user, header: header, order:order})
            
			
		}
	})
});

router.post("/:id/send", isLoggedIn, (req, res) => {
	async.waterfall([
        function(done) {
           Order.findById(req.params.id, (err, order) => {
                if(!order){
                    req.flash("error", "Nie znaleźliśmy takiego zamówienia");
                    return res.redirect("back");
                }
                order.isSent = true;
                order.save(function(err){
                         
                    done(err, order);
                });
            });
        },
        function(order, done){
			const mailgun = require("mailgun-js");
			const DOMAIN = 'mkdportfolio.pl';
			const mg = mailgun({apiKey: process.env.API_KEY, domain: DOMAIN, host:"api.eu.mailgun.net"});
			const data = {
				from: 'Maciej Kuta - nowa oferta <oferty@mkdportfolio.pl>',
                to: order.email,
                subject: req.body.topic,
                text: req.body.text
			};
			mg.messages().send(data, function (error, body) {
				req.flash("success", "Oferta została wysłana pomyślnie");
				console.log(error);
                done(error);
			});
            
        }
    ], function(err){
        res.redirect("/website-orders");
    });
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", i18n.__("Nie masz dostępu do tej strony"));
    res.redirect("/");
}

module.exports = router;