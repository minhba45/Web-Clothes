const userService = require("../services/user.service");
const catchAsync = require("../utils/catchAsync");

const getMe = catchAsync(async (req, res) => {
  const result = await userService.getMe(req.user.userId);
  res.status(200).json({
    message: "Get profile successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const updateUser = await userService.updateMe(req.user.userId, req.body);
  return res.status(200).json({
    success: true,
    message: "Update profile successfully",
    data: updateUser,
  });
});

module.exports = { getMe, updateProfile };
