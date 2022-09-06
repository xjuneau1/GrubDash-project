const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res, next) {
  res.json({ data: orders });
}

function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  }
  orders.push(newOrder)
  res.status(201).json({ data: newOrder });
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({
      status: 400,
      message: `Order must inlcude a ${propertyName}`,
    });
  };
}

function isValidArray(req, res, next) {
    const {data: {dishes} = {} } = req.body
    if(Array.isArray(dishes) && dishes.length > 0){
        return next()
    }
    next({
        status: 400,
        message: "Order must include at least one dish"
    })
}

function isValidQuantity(req, res, next) {
  const {data: { dishes } = {} } = req.body;
  dishes.forEach(({ quantity }, index) =>
    quantity && typeof quantity === "number" && quantity > 0
      ? null
      : next({
          status: 400,
          message: `Dish ${index} must have a quantity that is an integer greater than 0`,
        })
  )
  next()
}

module.exports = {
  list,
  create: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    isValidArray,
    isValidQuantity,
    create,
  ],
};
