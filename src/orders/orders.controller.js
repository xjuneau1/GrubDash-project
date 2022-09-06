const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res, next) {
  res.json({ data: orders });
}

function read(req, res, next) {
    const { orderId } = req.params
    const foundOrder = orders.find((order)=> order.id === orderId)
    res.json({data: foundOrder})
}

function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function update(req, res, next) {
    const { orderId } = req.params
    const { data: {deliverTo, mobileNumber, status, dishes} = {} } = req.body
    const foundOrder = orders.find((order)=> order.id === orderId)
    
    foundOrder.deliverTo = deliverTo
    foundOrder.mobileNumber = mobileNumber
    foundOrder.status = status
    foundOrder.dishes = dishes

    res.status(200).json({data: foundOrder})
}

function remove(req, res, next) {
    const { orderId } = req.params
    const index = orders.findIndex((order)=> order.id === orderId)
    orders.splice(index,1)
    res.sendStatus(204)
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
  const { data: { dishes } = {} } = req.body;
  if (Array.isArray(dishes) && dishes.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include at least one dish",
  });
}

function isValidQuantity(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  dishes.forEach(({ quantity }, index) =>
    quantity && typeof quantity === "number" && quantity > 0
      ? null
      : next({
          status: 400,
          message: `Dish ${index} must have a quantity that is an integer greater than 0`,
        })
  );
  next();
}

function validateOrderExists(req, res, next) {
    const { orderId } = req.params
    const foundOrder = orders.find((order)=> order.id === orderId)

    if(foundOrder){
        res.locals.order = foundOrder
        return next()
    }
    next({
        status: 404,
        message: `Order does not exist: ${orderId}`
    })
}

function isValidStatus(req, res, next) {
    const {data: {status} = {}} = req.body
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"]
    if(validStatus.includes(status)) {
        return next()
    }
    next({
        status: 400,
        message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
    })
}

function validateBodyIdEqualsRouteId(req, res, next) {
    const { orderId }= req.params
    const {data : {id} = {}} = req.body
    if(id === orderId || !id){
        return next()
    }
    next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
    })
}

function isPending(req, res, next) {
    const order = res.locals.order
    if(order.status === "pending"){
        next()
    }
    next({
        status:400,
        message: "An order cannot be deleted unless it is pending"
    })
}

function orderNotDelivered(req, res, next) {
    const order = res.locals.order;
    if (order.status !== "delivered") {
      next();
    } else {
      next({
        status: 400,
        message: "A delivered order cannot be changed",
      });
    }
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
  read: [
    validateOrderExists,
    read
  ],
  update: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    bodyDataHas("status"),
    validateOrderExists,
    validateBodyIdEqualsRouteId,
    isValidStatus,
    isValidArray,
    isValidQuantity,
    orderNotDelivered,
    update
  ],
  remove: [
    validateOrderExists,
    isPending,
    remove
  ]
};
