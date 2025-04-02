const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
module.exports = {
  // 获取所有餐厅
  getAllRestaurants: async (req, res) => {
    try {
      const restaurants = await Restaurant.find({ isAvailable: true })
        .select("-__v")
        .sort({ createdAt: -1 });

      res.status(200).json({
        status: true,
        data: restaurants,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },

  // 添加餐厅
  addRestaurant: async (req, res) => {
    const owner = req.user.id;
    const { title, time, imageUrl, code, logoUrl, coords } = req.body;

    // 1.check required info
    if (
      !title ||
      !time ||
      !imageUrl ||
      !owner ||
      !code ||
      !logoUrl ||
      !coords ||
      !coords.latitude ||
      !coords.longitude ||
      !coords.address ||
      !coords.title
    ) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields",
      });
    }

    // 2. check if the restaurant code already exists
    const existingrestaurant = await Restaurant.findOne({ owner: owner });
    if (existingrestaurant) {
      return res.status(400).json({
        status: false,
        message: "Restaurant with this code already exists",
        data: existingrestaurant,
      });
    }

    const newRestaurant = new Restaurant(req.body);
    try {
      await newRestaurant.save(); // 保存到数据库

      // 3.update userType
      await User.findByIdAndUpdate(
        owner,
        { userType: "Vendor" },
        { new: true, runValidators: true }
      );

      res.status(201).json({
        status: true,
        message: "Restaurant successfully created",
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },

  //查询餐厅按餐厅ID
  getRestaurantById: async (req, res) => {
    // req.body 参数体。这里用params就只需要接受id就可以了
    const id = req.params.id;
    try {
      const restaurant = await Restaurant.findById(id);

      res.status(200).json(restaurant);
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },

  // 查询附近所有可用餐厅
  getAllNearByRestaurants: async (req, res) => {
    const code = req.params.code;

    try {
      let allNearByRestaurants = [];

      if (code) {
        // 筛选条件。code相等并且是可用的餐厅 ,返回过滤掉 __v字段
        allNearByRestaurants = await Restaurant.aggregate([
          { $match: { code: code, isAvailable: true } },
          { $project: { __v: 0 } },
        ]);
      }

      // 如果没有传入code依然可以随机获取餐厅。并不需要同类餐厅
      if (allNearByRestaurants.length === 0) {
        allNearByRestaurants = await Restaurant.aggregate([
          { $match: { isAvailable: true } },
          { $project: { __v: 0 } },
        ]);
      }

      res.status(200).json(allNearByRestaurants);
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },

  // 随机餐厅 - /api/restaurant/profile code邮政编码
  getRandomRestaurant: async (req, res) => {
    const code = req.params.code;

    try {
      let randomRestaurant = [];

      if (code) {
        // 筛选条件。code相等并且是可用的餐厅 5条数据。返回过滤掉 __v字段
        randomRestaurant = await Restaurant.aggregate([
          { $match: { code: code, isAvailable: true } },
          { $sample: { size: 4 } },
          { $project: { __v: 0 } },
        ]);
      }

      // 如果没有传入code依然可以随机获取餐厅。并不需要同类餐厅
      if (randomRestaurant.length === 0) {
        randomRestaurant = await Restaurant.aggregate([
          { $match: { isAvailable: true } },
          { $sample: { size: 2 } },
          { $project: { __v: 0 } },
        ]);
      }
      console.log(randomRestaurant);

      res.status(200).json(randomRestaurant);
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },

  // 获得Owner餐厅
  getRestaurantByOwner: async (req, res) => {
    // req.body 参数体。这里用params就只需要接受id就可以了
    const owner = req.user.id;

    try {
      const OwnerRestaurant = await Restaurant.findOne({ owner: owner });

      res.status(200).json(OwnerRestaurant);
      // res.status(200).json("OwnerRestaurant");
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },
};
