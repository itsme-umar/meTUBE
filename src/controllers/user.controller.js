import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";

const registerUser = asyncHandler(async (req, res) => {
  //get User details from the frontend
  //validation - not empty , correct format
  //check if user already exists: username , email
  //check for images, check for avatar
  //upload them to cloudinary, avatar
  //create user object - create entryin db
  //remove password and refresh token from respone
  //check for user creation
  //return res

  const { username, email, fullname, password } = req.body;

  //   if (username === "") {
  //     throw new ApiError(400, "User Name is required");
  //   }
  if (
    [username, email, fullname.password].some((feild) => feild?.trim() === "")
  ) {
    throw new ApiError(400, "All feilds are required");
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already existed!");
  }

  const avatarLocalPath = req.files?.avatar[0].path;
  const coverImageLocalPath = req.files?.coverImage[0].path;

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar Image is required");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullname,
    password,
    avatar: avatar?.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = User.findById(user._id).select("-password -refreshToken");

  console.log(user, "+++++", createdUser);

  if (!createdUser) {
    throw new ApiError(
      500,
      "Internal Server Error while registering the user!"
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, "User Registered Succsessfully!", createdUser));
});

export { registerUser };

//register User
// taking all the necessesary userschema values else throw error the {value} is required

// after all the values we get then check if the user is already present with same email id or not if present the throw error that the USER ALREADY EXISTS

// if new user create account for him

//if any error occurs during the creation of the new user the throw an error
