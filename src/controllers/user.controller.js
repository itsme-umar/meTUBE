import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and referesh tokens."
    );
  }
};

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
    [username, email, fullname, password].some((feild) => feild?.trim() === "")
  ) {
    throw new ApiError(400, "All feilds are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already existed!");
  }

  const avatarLocalPath = req.files?.avatar[0].path;
  //   const coverImageLocalPath = req.files?.coverImage[0].path; //this will throw an error as there is no check if we are getting the coeverimage or not in the request files
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

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

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //   console.log(user, "+++++", createdUser);

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

const loginUser = asyncHandler(async (req, res) => {
  //get require fields from fe
  //check if the user exists or not
  //check if the password is correct
  //generate refresh and access token and send the response back

  const { email, username, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "email/username is required");
  }
  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new ApiError(404, "User does not exist!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User Logged In Succeessfully!", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User Logged Out Successfully", {}));
});

export { registerUser, loginUser, logoutUser };

//register User
// taking all the necessesary userschema values else throw error the {value} is required

// after all the values we get then check if the user is already present with same email id or not if present the throw error that the USER ALREADY EXISTS

// if new user create account for him

//if any error occurs during the creation of the new user the throw an error
