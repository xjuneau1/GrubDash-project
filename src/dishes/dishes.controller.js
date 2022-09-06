const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");


function list (req, res, send) {
    res.json({data: dishes})
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
}