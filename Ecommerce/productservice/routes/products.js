var express = require('express');
var router = express.Router();


/**
 * 	Return: 
 * 	{
 * 		msg: error/'',
 * 		productsList: [{_id: , name: , price: , productImage: ,}, { ... }]
 * 	}
 */
router.get('/loadpage', function(req, res) {
	var col = req.db.get('productCollection')
	var category = req.query.category
	var searchString = req.query.searchstring
	var categoryFilter = (category == "") ? {"name": {$regex : searchString}}
			: {"category": category, "name": {$regex : searchString}}
	
	col.find(
		categoryFilter, 
		{sort: {name: 1}},
		function(error, docs){
			var productsList = docs.map(doc => {
				return {"_id": doc._id, "name": doc.name, "price": doc.price, "productImage": doc.productImage}
			})
			res.json((error === null) ? {msg: '', productsList: productsList} : 
				{msg: error})
		}
	)
});

/**
 * 	Return: 
 * 	{
 * 		msg: error/'',
 * 		manufacturer: ...,
 * 		description: ...,
 * 	}
 */
router.get('/loadproduct/:productid', function(req, res) {
	var col = req.db.get('productCollection')
	var pid = req.params.productid

	col.find(
		{"_id": pid}, 
		{},
		function(error, docs){
			var doc = docs[0]
			res.json((error === null) ? 
				{msg: '', "manufacturer": doc.manufacturer, "description": doc.description}
				: {msg: error})
		}
	)
});

/** 
 *  Receive: {name: "", password: ""}
 * 	Return: 
 * 	{
 * 		msg: 'Login failure'/'',
 * 		totalnum: int,
 * 	}
 */
router.post('/signin', function(req, res) {
	var col = req.db.get('userCollection')
	var name = req.body.name
	var password = req.body.password

	col.find(
		{"username": name, "password": password}, 
		{},
		function(error, docs){
			if (error)
				res.send({msg: error})
			else {
				if(docs.length === 0){
					res.send({msg: 'Login failure'})
				}else{
					res.cookie('userId', docs[0]._id, {maxAge: 3600 * 1000})
					res.send({msg: '', totalnum: docs[0].totalnum})			
				}
			}
		}
	);
});

/**
 * 	Return: 
 * 		null ('')
 */
router.get('/signout', function(req, res) {
	res.clearCookie('userId');
	res.send('')
});

/**
 * 	Return: 
 * 	{
 * 		username: '',
 * 		totalnum: '',
 * 		msg: error/''
 * 	}
 */
router.get('/getsessioninfo', function(req, res) {
	var col = req.db.get('userCollection')
	
	if(req.cookies.userId){
		col.find(
			{"_id": req.cookies.userId}, 
			{},
			function(error, docs){
				res.send((error === null) ? {msg: "", "username": docs[0].username, "totalnum": docs[0].totalnum}: {msg: error}) 
			}
		)
	}else{
		res.send("")
	}
});

/** 
 *  Receive: {pid: xxx, num: int}
 * 	Return: 
 * 	{
 * 		msg: error/'',
 *		totalnum: int
 * 	}
 */
router.put('/addtocart', (req, res) => {
	var col = req.db.get('userCollection');
	var pid = req.body.pid
	var num = parseInt(req.body.num)

	col.find({"_id": req.cookies.userId}, {}, function(errFind, docs){
		var cart = docs[0].cart
		var totalnum = docs[0].totalnum
		var foundProd = false
		for(let i = 0; i < cart.length; i++){
			var prod = cart[i]
			if(prod.productId === pid){
				// have the product in the cart, update the cart
				cart[i].quantity += num
				var totalnum = totalnum + num
				col.update(
					{"_id": req.cookies.userId}, 
					{$set: 
						{"cart": cart, "totalnum": totalnum}
					},
					function (errUpdate, result) {
						res.send((errUpdate === null) ? {msg: '', totalnum: totalnum} 
						: {msg: errUpdate});
					}
				)
				foundProd = true
			}
		}
		// no such product in the cart, push to cart
		if(foundProd === false){
			col.update(
				{"_id": req.cookies.userId}, 
				{$push: {"cart": {"productId": pid, "quantity": num}},
				$set: {"totalnum": totalnum + num}
				},
				function (errUpdate, result) {
					res.send((errUpdate === null) ? {msg: '', totalnum: totalnum + num} 
					: {success: errUpdate});
				}
			)
		}
	})
});

/** 
 *  Return:
 * 	{
 * 		msg: error/'',
 * 		totalnum: int,
 * 		prodsList: [
 * 			{"pid": xxx, "name":xxx, "image":xxx, "price": xxx, "quantity": xxx}, 
 * 			...
 * 		],
 * 	}
 */
router.get('/loadcart', function(req, res) {
	var colUser = req.db.get('userCollection')
	var colProd = req.db.get('productCollection')
	
	colUser.find(
		{"_id": req.cookies.userId}, 
		{}
	).then((docs) => {
		// get product IDs and quantities in user's cart
		var cart = docs[0].cart
		var prodIdLists = []
		var prodQuantLists = []
		var totalnum = docs[0].totalnum
		for(let i = 0; i < cart.length; i++){
			var prod = cart[i]
			prodIdLists.push(prod.productId)
			prodQuantLists.push(prod.quantity)
		}
		
		// get detail information with pids
		colProd.find(
			{"_id": {$in: prodIdLists}}, 
			{},
			function(error, docs){
				var prodsList = []
				for(let i = 0; i < docs.length; i++){
					var prod = docs[i]
					var pid = prod._id.toString()
					var quantity = prodQuantLists[prodIdLists.indexOf(pid)]
					var prodInfo = {
						"pid": prod._id,
						"name": prod.name,
						"image": prod.productImage,
						"price": prod.price,
						"quantity": quantity
					}
					prodsList.push(prodInfo)
				}
				res.send((error === null) ? {msg: '', totalnum: totalnum, prodsList: prodsList}
					: {msg: error})
			}
		)
	});
});

/** 
 *  Receive: {"pid": xx, "quantity": xx}
 * 	Return: 
 * 	{
 * 		msg: error/'',
 * 		totalnum: int,
 * 	}
 */
router.put('/updatecart', (req, res) => {
	var col = req.db.get('userCollection');
	
	var pid = req.body.pid
	var quantity = parseInt(req.body.quantity)
	
	col.find(
		{"_id": req.cookies.userId}, 
		{}
	).then((docs) => {
		var cart = docs[0].cart

		// set the specific quantity of the pid
		for(let i = 0; i < cart.length; i++){
			if(cart[i].productId === pid){
				var temp = cart[i].quantity
				cart[i].quantity = quantity
				var totalnum = docs[0].totalnum + (cart[i].quantity - temp)
				break
			}
		}

		col.update(
			{"_id": req.cookies.userId}, 
			{$set: 
				{"cart": cart, "totalnum": totalnum}
			},
			function (err, result) {
				res.send((err === null) ? {msg: '', totalnum: totalnum} : {msg: err});
			}
		)
	});
});

/** 
 * 	Return: 
 * 	{
 * 		msg: error/'',
 * 		totalnum: int,
 * 	}
 */
router.delete('/deletefromcart/:id', (req, res) => {
	var col = req.db.get('userCollection');
    var pid = req.params.id;
	//console.log(pid)

	col.find(
		{"_id": req.cookies.userId}, 
		{}
	).then((docs) => {
		var cart = docs[0].cart

		// set the specific quantity of the pid
		for(let i = 0; i < cart.length; i++){
			if(cart[i].productId === pid){
				var tmp = cart[i].quantity
				cart.splice(i, 1)
				var totalnum = docs[0].totalnum - tmp
				break
			}
		}

		col.update(
			{"_id": req.cookies.userId}, 
			{$set: 
				{"cart": cart, "totalnum": totalnum}
			},
			function (err, result) {
				res.send((err === null) ? {msg: '', totalnum: totalnum} : {msg: err});
			}
		)
	});
});

/**
 * 	Return: 
 * 		null ('')
 */
router.get('/checkout', function(req, res) {
	var col = req.db.get('userCollection')
	
	col.update(
		{"_id": req.cookies.userId}, 
		{$set: 
			{"cart": [], "totalnum": 0}
		},
		function (err, result) {
			res.send((err === null) ? '' : err);
		}
	)
});

module.exports = router;
