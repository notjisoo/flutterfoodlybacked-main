const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");
const { ObjectId } = require("mongodb");

module.exports = {
  // 添加食品
  addFood: async (req, res) => {
    const {
      title,
      foodTags,
      category,
      code,
      restaurant,
      description,
      time,
      price,
      additives,
      imageUrl,
    } = req.body;

    if (
      !title ||
      !foodTags ||
      !category ||
      !restaurant ||
      !code ||
      !description ||
      !time ||
      !price ||
      !additives ||
      !imageUrl
    ) {
      return res.status(400).json({
        status: false,
        message: "You have a message field",
      });
    }

    try {
      const newFood = new Food(req.body);

      await newFood.save();

      // 如果食品添加成功，这里还需要将食品添加到对应餐厅的foods数组中
      const a = await Restaurant.findByIdAndUpdate(
        restaurant,
        {
          $push: {
            foods: newFood._id,
          },
        },
        { new: true }
      );

      console.log(a);

      res.status(201).json({
        status: true,
        message: "Food has been successfully added",
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },

  // 按食品ID获得食品
  getFoodById: async (req, res) => {
    // 食品id
    const id = req.params.id;
    try {
      const food = await Food.findById(id);

      res.status(200).json(food);
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },

  getRandomFood: async (req, res) => {
    try {
      let randomFoodList = [];

      if (req.params.code) {
        randomFoodList = await Food.aggregate([
          { $match: { code: req.params.code } },
          { $sample: { size: 3 } },
          { $project: { __v: 0 } },
        ]);
      }

      if (!randomFoodList.length) {
        randomFoodList = await Food.aggregate([
          { $match: { isAvailable: true } },
          { $sample: { size: 3 } },
          { $project: { __v: 0 } },
        ]);
      }

      if (randomFoodList.length) {
        res.status(200).json(randomFoodList);
      } else {
        res.status(404).json({
          status: false,
          message: "No Foods found",
        });
      }
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },

  // Restaurant Menu
  getFoodsByRestaurant: async (req, res) => {
    const id = new ObjectId(req.params.id);

    try {
      const foods = await Food.find({
        restaurant: id,
      });

      res.status(200).json(foods);
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },

  // 查找与食品相似的食品
  getFoodsByCategoryAndCode: async (req, res) => {
    const { category, code } = req.params;
    try {
      const foods = await Food.aggregate([
        {
          $match: {
            category: category,
            code: code,
            isAvailable: true,
          },
        },
      ]);

      if (foods.length === 0) {
        return res.status(200).json([]);
      }

      res.status(200).json(foods);
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },
  // 搜索食品
  searchFoods: async (req, res) => {
    const search = req.params.search; // 获取搜索关键词

    try {
      const foods = await Food.aggregate([
        {
          $search: {
            index: "foods", // 指定搜索索引
            text: {
              query: search, // 搜索关键词
              path: {
                wildcard: "*", // 在所有字段中搜索
              },
            },
          },
        },
      ]);
      res.status(200).json(foods); // 返回结果
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },

  // 得到相同类品的随机食物
  getRandomFoodsByCategoryAndCode: async (req, res) => {
    const { category, code } = req.params;

    try {
      let foods;
      // 先尝试查找 符合 category 和 code 且可用 的 10 条随机数据。
      foods = await Food.aggregate([
        { $match: { category: category, code: code, isAvailable: true } },
        { $sample: { size: 10 } },
      ]);

      // 若找不到，再尝试 只符合 code 且可用 的 10 条随机数据。
      if (foods.length === 0) {
        foods = await Food.aggregate([
          { $match: { code: code, isAvailable: true } },
          { $sample: { size: 10 } },
        ]);
      }

      // 若仍然找不到，再尝试 所有可用 (isAvailable: true) 的数据。
      if (foods.length === 0) {
        foods = await Food.aggregate([
          { $match: { isAvailable: true } },
          { $sample: { size: 10 } },
        ]);
      }

      res.status(200).json(foods);
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },

  getAllFoodsByCode: async (req, res) => {
    const code = req.params.code;
    console.log(code);
    try {
      const foodList = await Food.find({ code });

      return res.status(200).json(foodList);
    } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
    }
  },
};
