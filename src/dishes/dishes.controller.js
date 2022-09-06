const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");


function list (req, res, send) {
    res.json({data: dishes})
}

function read(req, res, next){
    const { dishId } = req.params
    const foundDish = dishes.find((dish)=> dish.id === dishId)
    res.json({data: foundDish})
}

function create(req, res, next) {
    const {data:{name, description, price, image_url} = {} } = req.body
    const newDish = {
        id: nextId(),
        name: name,
        description: description,
        price: price,
        image_url: image_url
    }
    dishes.push(newDish)
    return res.status(201).json({data: newDish})
}

function update(req, res, next){
    const { dishId } = req.params
    const { data: { name, description, image_url} = {} } = req.body
    const foundDish = dishes.find((dish)=> dish.id === dishId)

    foundDish.name = name
    foundDish.description = description
    foundDish.image_url = image_url
    
   res.json({data: foundDish})
}

function validateDishExists (req, res, next){
    const { dishId } = req.params
    const foundDish = dishes.find((dish)=> dish.id === dishId)
    if(foundDish){
        return next()
    }
    next({
        status: 404,
        message: `Dish does not exist: ${dishId}`
    })
}

function validateBodyIdEqualsRouteId (req, res, next){
    const { dishId } = req.params
    const {data: {id} } = req.body

    if (id === dishId || !id){
        return next()
    }
    next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
    })
}

function bodyDataHas(propertyName){
    return function (req, res, next) {
        const {data = {} } = req.body
        if(data[propertyName]) {
            return next()
        }
        next({
            status: 400,
            message: `Dish must include a ${propertyName}`
        })
    }
}

function priceIsValidInteger (req, res, next) {
    const {data:{price}} = req.body
    if(price < 0 || !Number.isInteger(price)){
        next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`
        })
    }
    next()
}


module.exports = {
    list,
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        priceIsValidInteger,
        create,
    ],
    update: [
        validateDishExists,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        priceIsValidInteger,
        validateBodyIdEqualsRouteId,
        update
    ],
    read: [
        validateDishExists,
        read
    ]
}