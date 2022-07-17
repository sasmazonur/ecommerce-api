const router = require("express").Router();
const Order = require("../models/Order");
const {verifyToken, verifyTokenAndAuth, verifyTokenAndAdmin } = require("./verifyToken");

// Create Order
router.post("/", verifyToken, async (req, res) => {
    const newOrder = new Order(req.body)
    try {
        const savedOrder = await newOrder.save();
        res.status(200).json(savedOrder);
    } catch (error) {
        res.status(500).json(err);
    }
});

// Update Order
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete Order
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        await Order.findByIdDelete(req.params.id)
        res.status(200).json("Order deleted!")
        
    } catch (error) {
        res.status(500).json(error);
    }
});


// Get User Orders
router.get("/find/:userId",verifyTokenAndAuth, async (req, res) => {
    try {
        const orders = await Order.find({userId: req.params.userId})
        res.status(200).json(orders);
        
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get All Orders
router.get("/", verifyTokenAndAdmin, async (req, res) => {

    try {
        const orders = await Order.find()
        res.status(200).json(orders);
        
    } catch (error) {
        res.status(500).json(error);
    }
});


// Get Monthly income
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth()-1));
    const prevMonth = new Date(new Date().setMonth(lastMonth.getMonth()-1));

    try {
        const income = await Order.aggregate([
            {$match: {createdAt:{$gte: prevMonth}}},
            {
                $project:{
                    month: {$month: "$createdAt"},
                    sales:"$amount"
                },
            },
            { 
                $group:{
                    _id: "$month",
                    total: {$sum:"$sales"},
                }
            }
        ]);
        res.status(200).json(income);
        
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;