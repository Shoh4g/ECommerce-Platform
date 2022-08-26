import './App.css';
import $ from 'jquery';
import React from 'react';

class LoginPage extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            inputUserName: "",
            inputUserPswd: "",
            errorMsg: ""
        }

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleOnClickSubmit = this.handleOnClickSubmit.bind(this)
    }

    handleInputChange(event){
        let target = event.target
        let name = target.name
        let value = target.value
        this.setState({[name]: value})  
    }

    handleOnClickSubmit(){
        var name = this.state.inputUserName
        var pswd = this.state.inputUserPswd
        var user_doc = {name: name, password: pswd}
        if(name === '' || pswd === ''){
            alert("You must enter username and password")
        }else{
            $.ajax({
                type: 'POST',
                url: 'http://localhost:3001/signin',
                data: user_doc,
                dataType: 'JSON',
                xhrFields: {
                    withCredentials: true
                }
            }).done(function(response) {
                if(response.msg === ''){
                    this.props.handleProcessLogin(false)
                    this.props.handleIsLogin(true)
                    this.setState({showErrorMsg: false})
                    this.props.handleUserNameChange(name)
                    this.props.handleCartNumChange(response.totalnum)
                    
                    if(this.props.loginFromCart) // only clicking "add to cart" sets it
                        this.props.handleProcessCart(true)                
                }else{
                    this.setState({errorMsg: response.msg})
                }
            }.bind(this));
        }
    }

    render(){
        return(
            <div class="loginBox">
                <p>{this.state.errorMsg}</p>
                Username <input
                type="text"
                name="inputUserName"
			    value={this.state.inputUserName}
                onChange={this.handleInputChange} />
                <br />
                Password <input
                type="password"
                name="inputUserPswd"
                value={this.state.inputUserPswd}
                onChange={this.handleInputChange} />
                <br />
                <button onClick={this.handleOnClickSubmit}> Sign in </button>
            </div>
        )
    }
}

class UserBar extends React.Component{
    constructor(props) {
        super(props)

        this.handleOnClickLogin = this.handleOnClickLogin.bind(this)
        this.handleOnClickLogout = this.handleOnClickLogout.bind(this)
        this.handleOnClickBarCart = this.handleOnClickBarCart.bind(this)
    }

    handleOnClickBarCart(e){
        e.preventDefault();

        this.props.handleProcessPay(true)
        this.props.handleProcessCart(true)
        this.props.handleProcessPaidFlag(false)
    }

    handleOnClickLogin(e){
		e.preventDefault();

        this.props.handleLoginFromCart(false)
        this.props.handleProcessLogin(true)
    }

    handleOnClickLogout(e){
		e.preventDefault();

        $.ajax({
            type: 'GET',
            url: 'http://localhost:3001/signout',
            xhrFields: {
                withCredentials: true
            }
        }).done(function(response) {
            if(response === ''){
                // logout: Fig 6 stay the same; Fig 5.7.8, back to initial page
                this.props.handleIsLogin(false)
                this.props.handleProcessLogin(false)

                if(this.props.processCart){
                    this.props.fetchProductsFromServer("", "")
                    this.props.handleProcessPay(false)
                    this.props.handleProcessCart(false)
                    this.props.handleProcessDetailProd(false)
                }
            }
        }.bind(this));
    }

    render(){
        if(this.props.isLogin === false){
            return(
                <div class="userBar"><a href='#' onClick={this.handleOnClickLogin}> Sign in </a></div>
            )
        }else{
            return(
                <div class="userBar">
                    <div class="cartIcon" onClick={this.handleOnClickBarCart}>
                        <img src="cart.png" width="35" height="23"/>
                        <a href='#'> {this.props.userCartNum} in Cart </a>
                    </div>
                    Hello, <b>{this.props.userName}</b>
                    <a href='#' onClick={this.handleOnClickLogout}> (Sign out)</a> 
                </div>
            )
        }
    }
}

class SearchBar extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            categoryOption: "",
            searchString: ""
        }
        this.handleOptionChange = this.handleOptionChange.bind(this)
        this.handleSearchStrChange = this.handleSearchStrChange.bind(this)
        this.handleSearchClick = this.handleSearchClick.bind(this)
    }

    handleOptionChange(e){
        var option = e.target.value
        this.setState({categoryOption: option})
    }

    handleSearchStrChange(e){
        var str = e.target.value
        this.setState({searchString: str})
    }

    handleSearchClick(){
        var category = this.state.categoryOption === "All" ? "" : this.state.categoryOption
        var searchString = this.state.searchString

        // back to inital page showing searched products
        this.props.fetchProductsFromServer(category, searchString)
        this.props.handleProcessDetailProd(false)
        this.props.handleProcessCart(false)
        this.props.handleProcessPay(false)
    }

    
    render(){
        return( 
            <div class="searchBar">
                <select class="selector"
                    onChange={this.handleOptionChange}
                >
                    <option value="All">All</option>
                    <option value="Phones">Phones</option>
                    <option value="Tablets">Tablets</option>
                    <option value="Laptops">Laptops</option>
                </select>

                <input
                type="text"
                placeholder="search a name..."
                value={this.state.searchString}
                onChange={this.handleSearchStrChange} />

                <div class="searchImg"><img src="search.png" height="28" onClick={this.handleSearchClick}/></div>
            </div>
        )
    }
}

class NavBar extends React.Component{
    constructor(props) {
        super(props)
        this.handleOnclickTitle = this.handleOnclickTitle.bind(this)
    }

    handleOnclickTitle(e){
        var category = e.target.rel
        this.props.fetchProductsFromServer(category, "")
        this.props.handleProcessDetailProd(false)
        this.props.handleProcessCart(false)
        this.props.handleProcessPay(false)
    }

    render(){
        return (
            <div class="navBar">
                <div class="titleBar">
                    <a onClick={this.handleOnclickTitle} rel="Phones">Phones </a>
                    <a onClick={this.handleOnclickTitle} rel="Tablets">Tablets </a>
                    <a onClick={this.handleOnclickTitle} rel="Laptops">Laptops</a>
                </div>
                <SearchBar fetchProductsFromServer={this.props.fetchProductsFromServer}
                            handleProcessDetailProd={this.props.handleProcessDetailProd}
                            handleProcessCart = {this.props.handleProcessCart}
                            handleProcessPay = {this.props.handleProcessPay}/>
                <UserBar handleProcessLogin={this.props.handleProcessLogin}
                        isLogin={this.props.isLogin}    handleIsLogin = {this.props.handleIsLogin}
                        userName = {this.props.userName}    userCartNum = {this.props.userCartNum}
                        handleLoginFromCart = {this.props.handleLoginFromCart}
                        handleProcessCart = {this.props.handleProcessCart}
                        handleProcessPay = {this.props.handleProcessPay}
                        fetchProductsFromServer = {this.props.fetchProductsFromServer}
                        processCart={this.props.processCart}
                        processPay={this.props.processPay}
                        handleProcessDetailProd={this.props.handleProcessDetailProd}
                        handleProcessPaidFlag={this.props.handleProcessPaidFlag}/>
            </div>
        );
    }
}

class AddToCart extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            quantity: 1,
        }

        this.handleOnClickAddCart = this.handleOnClickAddCart.bind(this)
        this.handleOnInput = this.handleOnInput.bind(this)
    }
    
    handleOnClickAddCart(e){
		e.preventDefault();
        if(this.state.quantity !== ''){
            var products = []
            for(let i = 0; i < this.state.quantity; i++){
                products.push(this.props.detailProductObj)
            }
            this.props.handleReadyToCart(products)

            if(this.props.isLogin === false){
                this.props.handleProcessLogin(true)
                this.props.handleLoginFromCart(true)
            }else{
                this.props.handleProcessCart(true)
            }
        }
    }

    handleOnInput(e){
        var value = e.target.value
        if(value != ''){
            // limit number range
            value = Math.max(Math.min(5, value), 1)
            // limit integer
            value = parseInt(value)
            // natively allow format: 2e0
        }
        this.setState({quantity: value})
    }

    render(){
        return (
            <div class="addToCart">
                <div class="quantityHint">Quantity:</div>
                <input type="number" min="1" max="5" onInput={this.handleOnInput} value={this.state.quantity} />
                <button class="addToCartButton" onClick={this.handleOnClickAddCart}>Add to Cart</button>
            </div>
        );
    }
}

class ProductPage extends React.Component{
    constructor(props) {
        super(props)
        
        this.handleDetailProductIn = this.handleDetailProductIn.bind(this)
        this.handleDetailProductOut = this.handleDetailProductOut.bind(this)
    }
    
    handleDetailProductIn(e){
        e.preventDefault();
        var pid = e.target.dataset.pid
        $.getJSON(`http://localhost:3001/loadproduct/${pid}`, function(response) {
            if(response.msg === ''){
                var chosenProd = this.props.productsList.filter(prod => prod._id === pid)[0]
                var chosenProdInfo = {
                    "_id": pid,
                    "name": chosenProd.name,
                    "price": chosenProd.price, 
                    "productImage": chosenProd.productImage,
                    "manufacturer": response.manufacturer,
                    "description": response.description
                }
                this.props.handleDetailProductObj(chosenProdInfo)
                this.props.handleProcessDetailProd(true)
            }
        }.bind(this))
    }

    handleDetailProductOut(e){
		e.preventDefault();

		this.props.handleProcessDetailProd(false)
		this.props.handleDetailProductObj(null)
    }

    render(){
        // display chosen product
        if(this.props.processDetailProd){
            return(
                <div class="detailProductPage">
                    <div class="detailProductContainer">
                        <div><img src={`http://localhost:3001/${this.props.detailProductObj.productImage}`} height="200"/></div>
                        <div class="detailProductInfo">
                            <b><p>{this.props.detailProductObj.name}</p></b>
                            <p>${this.props.detailProductObj.price}</p>
                            <p>{this.props.detailProductObj.manufacturer}</p>
                            <p>{this.props.detailProductObj.description}</p>
                        </div>
                        <AddToCart isLogin={this.props.isLogin}
                                    handleProcessLogin={this.props.handleProcessLogin}
                                    handleProcessCart={this.props.handleProcessCart}
                                    handleLoginFromCart={this.props.handleLoginFromCart}
                                    detailProductObj={this.props.detailProductObj}
                                    handleReadyToCart={this.props.handleReadyToCart}/>
                    </div>
                    <p class="goBack"><a href='#' onClick={this.handleDetailProductOut}>
                        &#60; go back </a></p>
                </div>
            )
        }else{
        // display all products
            return(
                <div class="productCards">
                    {
                        this.props.productsList.map(((product, index) => {
                            return (
                                <div class="cardItem" data-pid={product._id} onClick={this.handleDetailProductIn}>
                                    <img data-pid={product._id} src={`http://localhost:3001/${product.productImage}`} height="130"/>
                                    <p data-pid={product._id}>{product.name}</p>
                                    <p data-pid={product._id}>${product.price}</p>
                                </div>
                            )
                        }))
                    }
                </div> 
            )
        }
    }
}

class CheckOutPage extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            cartProductsList: [],
            paidNum: 0,
            totalPrice: 0,
        }
        
        this.fetchProdsListAndPrice = this.fetchProdsListAndPrice.bind(this)
        this.updateProdQuantity = this.updateProdQuantity.bind(this)
        this.deleteProduct = this.deleteProduct.bind(this)
        this.handleOnInput = this.handleOnInput.bind(this)
        this.handleOnClickContinue = this.handleOnClickContinue.bind(this)
        this.handleOnClickPay = this.handleOnClickPay.bind(this)
    }

    componentDidMount(){
        this.fetchProdsListAndPrice()
        this.props.handleProcessPaidFlag(false)
    }

    // process the corner case that user clicks cart right after paid
    componentWillReceiveProps (nextProps){
        if(nextProps.processPaidFlag === false
            && this.props.userCartNum == 0 && this.state.cartProductsList.length != 0){
            this.fetchProdsListAndPrice()
        }
    }

    fetchProdsListAndPrice(){
        $.ajax({
            type: 'GET',
            url: 'http://localhost:3001/loadcart',
            dataType: 'JSON',
            xhrFields: {
                withCredentials: true
            }
        }).done(function(response) {
            if(response.msg === ''){
                var totalPrice = 0
                var docs = response.prodsList
                for(let i = 0; i < docs.length; i++){
                    totalPrice += (docs[i].price * docs[i].quantity)
                }
                this.setState({cartProductsList: docs, totalPrice: totalPrice, paidNum: response.totalnum}) 
            }
        }.bind(this));
    }

    updateProdQuantity(dataUpdate){
        $.ajax({
            type: 'PUT',
            url: 'http://localhost:3001/updatecart',
            data: dataUpdate,
            dataType: 'JSON',
            xhrFields: {
                withCredentials: true
            },        
        }).done(function(response){
            if(response.msg === ''){
                this.fetchProdsListAndPrice()
                this.props.handleCartNumChange(response.totalnum)
            }
        }.bind(this));
    }

    deleteProduct(pid){
        $.ajax({
            type: 'DELETE',
            url: 'http://localhost:3001/deletefromcart/' + pid,
            dataType: 'JSON',
            xhrFields: {
                withCredentials: true
            },
        }).done(function(response){
            if(response.msg === ''){
                this.fetchProdsListAndPrice()
                this.props.handleCartNumChange(response.totalnum)
            }
        }.bind(this));
    }

    handleOnInput(e){
        var pid = e.target.name
        var value = e.target.value

        if(value != ''){
            if(value == 0){
                this.deleteProduct(pid)
            }else{
                value = Math.max(Math.min(5, value), 1)
                value = parseInt(value)
                var dataUpdate = {"pid": pid, "quantity": value}
                this.updateProdQuantity(dataUpdate)
            }
        }else{
            var dataUpdate = {"pid": pid, "quantity": 0}
            this.updateProdQuantity(dataUpdate)
        }
    }

    handleOnClickContinue(e){
        e.preventDefault();

        this.props.fetchProductsFromServer("", "")
        this.props.handleProcessDetailProd(false)
        this.props.handleProcessPay(false)
        this.props.handleProcessCart(false)
    }

    handleOnClickPay(e){
        e.preventDefault();

        if(this.state.cartProductsList.length == 0){
            this.props.handleProcessPaidFlag(true)
        }else{
            $.ajax({
                type: 'GET',
                url: 'http://localhost:3001/checkout',
                xhrFields: {
                    withCredentials: true
                }
            }).done(function(response) {
                if(response === ''){
                    this.props.handleProcessPaidFlag(true)
                    this.props.handleCartNumChange(0)
                }
            }.bind(this));
        }
    }

    render() {
        if(this.props.processPaidFlag === false){
        // process unpaid checkout page
            var itemMsg = this.props.userCartNum==1 || this.props.userCartNum==0? " item": " items"
            var header = this.state.cartProductsList.length==0? []: 
                (<div class="cartHeader">
                    <div class="headerPrice">Price:</div>
                    <div class="headerQuant">Quantity:</div>
                </div>)
            return (
                <div class="checkoutPage">
                    <h2> Shopping Cart </h2>
                    {header}
                    {
                    this.state.cartProductsList.map((product)=>{
                        return(
                            <div class="cartRow">
                                <div class="cartImg"><img src={`http://localhost:3001/${product.image}`} weight="100" height="130"/></div>
                                <div class="cartName"> {product.name} </div>
                                <div class="cartPrice"> ${product.price} </div>
                                <div class="cartStepper">
                                    <input name={product.pid} type="number" min="0" max="5" onInput={this.handleOnInput} 
                                        value={product.quantity == 0? '': product.quantity} />
                                </div>
                            </div>
                        )
                    })
                    }
                    <p> Cart subtotal ({this.props.userCartNum}{itemMsg}): ${this.state.totalPrice}</p>
                    <button class="checkButton" onClick={this.handleOnClickPay}>Proceed to check out</button>
                </div>
            )
        }else{
        // process paid checkout page
            var itemMsg = this.state.paidNum==1 || this.state.paidNum==0? " item": " items"
            return(
                <div class="checkoutMsgPage">
                    <p>&#10004; You have successfully placed order for {this.state.paidNum}{itemMsg}</p>
                    <p>${this.state.totalPrice} paid</p>
                    <p><a href='#' onClick={this.handleOnClickContinue}> continue browsing&#62; </a></p>
                </div>
            )
        }
    }
}

class CartPage extends React.Component{
    constructor(props){
        super(props)
        this.handleOnClickCart = this.handleOnClickCart.bind(this)
    }

    componentDidMount(){
        var numReadyProd = this.props.readyToCart.length
        if(numReadyProd !== 0){
            var putBody = {pid: this.props.readyToCart[0]._id, num: numReadyProd}
            $.ajax({
                type: 'PUT',
                url: 'http://localhost:3001/addtocart',
                data: putBody,
                dataType: 'JSON',
                xhrFields: {
                    withCredentials: true
                },   
              }).done(function(response){
                if(response.msg === ''){
                    this.props.handleCartNumChange(response.totalnum)
                    this.props.handleReadyToCart([])
                }
            }.bind(this));
        }        
    }

    handleOnClickCart(e){
        e.preventDefault();
        
        this.props.fetchProductsFromServer("", "")
        this.props.handleProcessCart(false)
        this.props.handleProcessDetailProd(false)
    }

    render(){
        // the only entry is clicking cart in user bar
        if(this.props.processPay){
            return <CheckOutPage userCartNum={this.props.userCartNum} 
                                handleCartNumChange={this.props.handleCartNumChange}
                                handleProcessCart={this.props.handleProcessCart}
                                handleProcessPay={this.props.handleProcessPay}
                                handleProcessDetailProd={this.props.handleProcessDetailProd}
                                fetchProductsFromServer={this.props.fetchProductsFromServer}
                                processPaidFlag = {this.props.processPaidFlag}
                                handleProcessPaidFlag={this.props.handleProcessPaidFlag}/>
        }
        else{
            return(
                <div class="cartPage">
                    <div class="addedRow">
                        <div><img src={`http://localhost:3001/${this.props.detailProductObj.productImage}`} height="200"/></div>
                        <div class="addedHint"> &#10004; Added to Cart </div>
                    </div>
                    <p><a href='#' onClick={this.handleOnClickCart}> continue browsing&#62; </a></p>
                </div>
            )
        }   
    }
}

class Shop extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            // used for status
            productsList: [],
            isLogin: false,
            userName: "",
            userCartNum: -1,
            readyToCart: [],

            // used for processing different pages
            processLogin: false,
            processCart: false,
            processPay: false,
            processDetailProd: false,
            detailProductObj: null,
            loginFromCart: false,	
            processPaidFlag: false,
        }

        this.fetchProductsFromServer = this.fetchProductsFromServer.bind(this)
        this.fetchSessionIdFromServer = this.fetchSessionIdFromServer.bind(this)
        this.handleProcessLogin = this.handleProcessLogin.bind(this)
        this.handleIsLogin = this.handleIsLogin.bind(this)
        this.handleUserNameChange = this.handleUserNameChange.bind(this)
        this.handleCartNumChange = this.handleCartNumChange.bind(this)
        this.handleProcessCart = this.handleProcessCart.bind(this)
        this.handleProcessPay = this.handleProcessPay.bind(this)
        this.handleLoginFromCart = this.handleLoginFromCart.bind(this)
		this.handleDetailProductObj = this.handleDetailProductObj.bind(this)
		this.handleProcessDetailProd = this.handleProcessDetailProd.bind(this)
		this.handleReadyToCart = this.handleReadyToCart.bind(this)
        this.handleProcessPaidFlag = this.handleProcessPaidFlag.bind(this)
    }

    handleProcessPaidFlag(onOff){
        this.setState({processPaidFlag: onOff})
    }

	handleReadyToCart(productsList){
		this.setState({readyToCart: productsList})
	}

	handleDetailProductObj(obj){
		this.setState({detailProductObj: obj})
	}

	handleProcessDetailProd(onOff){
		this.setState({processDetailProd: onOff})
	}

    handleProcessLogin(onOff){
        this.setState({processLogin: onOff})
    }

    handleIsLogin(onOff){
        this.setState({isLogin: onOff})
    }

    handleUserNameChange(name){
        this.setState({userName: name})
    }

    handleCartNumChange(num){
        this.setState({userCartNum: num})
    }

    handleProcessCart(onOff){
        this.setState({processCart: onOff})
    }

    handleProcessPay(onOff){
        this.setState({processPay: onOff})
    }

    handleLoginFromCart(onOff){
        this.setState({loginFromCart: onOff})
    }

    componentDidMount(){
        this.fetchProductsFromServer("", "")
        this.fetchSessionIdFromServer()
    }

    fetchProductsFromServer(category, searchString){
        $.getJSON(`http://localhost:3001/loadpage?category=${category}&searchstring=${searchString}`, 
            function(response) {
                this.setState({"productsList": response.productsList})
            }.bind(this)
        )
    }
    
    fetchSessionIdFromServer(){
        $.ajax({
            type: 'GET',
            url: 'http://localhost:3001/getsessioninfo',
            xhrFields: {
                withCredentials: true
            }
        }).done(function(response) {
            if(response !== ''){
                this.handleUserNameChange(response.username)
                this.handleCartNumChange(response.totalnum)
                this.handleIsLogin(true)
            }
        }.bind(this));
    }

    render(){
        const navBar = (
            <NavBar fetchProductsFromServer={this.fetchProductsFromServer}
            handleProcessLogin={this.handleProcessLogin}
            isLogin={this.state.isLogin}    handleIsLogin = {this.handleIsLogin}
            userName = {this.state.userName}    userCartNum = {this.state.userCartNum}  
            handleLoginFromCart = {this.handleLoginFromCart}
            handleProcessCart = {this.handleProcessCart}
            handleProcessPay = {this.handleProcessPay}
            processCart={this.state.processCart}
            processPay={this.state.processPay}
            handleProcessDetailProd={this.handleProcessDetailProd}
            handleProcessPaidFlag={this.handleProcessPaidFlag}/>
        )
        if(this.state.processLogin){
            // process login page
            return <LoginPage handleProcessLogin={this.handleProcessLogin}
                            handleIsLogin = {this.handleIsLogin}
                            handleUserNameChange = {this.handleUserNameChange}
                            handleCartNumChange = {this.handleCartNumChange}
                            loginFromCart = {this.state.loginFromCart}
                            handleProcessCart = {this.handleProcessCart}/>
        }else if(this.state.processCart){
            // process cart page, must have login permission
            return(
                <div>
                    {navBar}
                    <CartPage readyToCart={this.state.readyToCart} handleReadyToCart={this.handleReadyToCart}
                                userCartNum={this.state.userCartNum} handleCartNumChange={this.handleCartNumChange}
                                handleProcessCart={this.handleProcessCart}
                                handleProcessDetailProd={this.handleProcessDetailProd}
                                handleProcessPay={this.handleProcessPay}
                                processPay={this.state.processPay}
                                fetchProductsFromServer={this.fetchProductsFromServer}
                                detailProductObj={this.state.detailProductObj}
                                processPaidFlag = {this.state.processPaidFlag}
                                handleProcessPaidFlag={this.handleProcessPaidFlag}/>
                </div>
            )
        }
        else{
            // process products page, non-login permission
            return(
                <div>
                    {navBar}
                    <ProductPage productsList={this.state.productsList}
                                isLogin={this.state.isLogin}
                                handleProcessLogin={this.handleProcessLogin}
                                handleProcessCart={this.handleProcessCart}
                                handleLoginFromCart={this.handleLoginFromCart}
								detailProductObj={this.state.detailProductObj}
								processDetailProd={this.state.processDetailProd}
								handleDetailProductObj={this.handleDetailProductObj}
								handleProcessDetailProd={this.handleProcessDetailProd}
                                handleReadyToCart={this.handleReadyToCart}/>
                </div>
            )
        }
    }
}

export default Shop;
