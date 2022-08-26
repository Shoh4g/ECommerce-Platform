// assume mongodb is running on localhost and default port
var conn = new Mongo();

var db = conn.getDB("assignment2");

var usernames = ["Amy", "Bob", "Claire", "David", "Eileen", "Frank"]
var passwords = ["123456", "234561", "345612", "456123", "561234", "612345"]

db.userCollection.remove({});

for(let i=0; i < usernames.length; i++) {
    db.userCollection.insert(
        {
            'username':usernames[i], 
            'password':passwords[i],
            'cart':[],
            'totalnum':0
        }
    )
}

// 24 products
var prodnames = ['iphone 13', 'iphone 12', 'iphone 11', 'ipad 3', 'ipad 2', 'ipad 1', 'macbook 22', 'macbook 21', 'macbook 20', 
                'huawei nova 9', 'huawei mate 40', 'matepad pro', 'matebook d', 'matebook x', 'galaxy z', 'galaxy s', 'galaxy tab A', 'thinkpad x1',
                'xperia 1', 'xperia z4', 'ipad mini', 'ipad air', 'xps 13', 'xps 15']
var prodcategories = ['Phones', 'Phones', 'Phones', 'Tablets', 'Tablets', 'Tablets', 'Laptops', 'Laptops', 'Laptops',
                    'Phones', 'Phones', 'Tablets', 'Laptops', 'Laptops', 'Phones', 'Phones', 'Tablets', 'Laptops',
                    'Phones', 'Tablets', 'Tablets', 'Tablets', 'Laptops', 'Laptops']
var prodprices = [8000, 7000, 6000, 5000, 4000, 3000, 19000, 18000, 17000,
                7000, 7500, 5000, 4500, 9500, 5500, 4500, 6000, 12000,
                8000, 5000, 4500, 6000, 9800, 13000]
var prodmanufacturers = ["Apple Inc.", "Apple Inc.", "Apple Inc.", "Apple Inc.", "Apple Inc.", "Apple Inc.", "Apple Inc.", "Apple Inc.", "Apple Inc.",
                        "Huawei Inc.", "Huawei Inc.", "Huawei Inc.", "Huawei Inc.", "Huawei Inc.", "Samsung Inc.", "Samsung Inc.", "Samsung Inc.", "Lenovo Inc.",
                        "Sony Inc.", "Sony Inc.", "Apple Inc.", "Apple Inc.", "Dell Inc.", "Dell Inc."]

var prodimages = []
for (let prodname of prodnames) {
    prodimages.push(`images/${prodname}.png`)
}

var proddescriptions = []
for (let prodname of prodnames) {
    proddescriptions.push(`This is a description for ${prodname}.`)
}

db.productCollection.remove({});

for(let i=0; i < prodnames.length; i++) {
    db.productCollection.insert(
        {
            'name':prodnames[i], 
            'category':prodcategories[i],
            'price':prodprices[i],
            'manufacturer':prodmanufacturers[i],
            'productImage':prodimages[i],
            'description':proddescriptions[i]
        }
    )
}