const poseService = require("./poseService");
const poseProvider = require("./poseProvider");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const {CF} = require("nodeml");

// 포즈자랑 삭제 api
exports.deletePose = async function (req, res) {
  let poseId = req.params.poseId;
  if (!poseId) return res.send(errResponse(baseResponse.POSE_ID_EMPTY));
  //   const userIdFromJWT = req.verifiedToken.userId;
  const userIdFromJWT = 1;
  const userId = poseProvider.getUserFromPose(poseId);
  if (userIdFromJWT != userId)
    return res.send(errResponse(baseResponse.NO_RIGHT));

  const deletePoseResponse = await poseService.deletePose(poseId);
  return res.send(deletePoseResponse);
};

// 포즈 좋아요 api
exports.likePose = async function (req, res) {
  let poseId = req.params.poseId;
  //   const userIdFromJWT = req.verifiedToken.userId;
  const userIdFromJWT = 1;
  if (!poseId) return res.send(errResponse(baseResponse.POSE_ID_EMPTY));
  const likePoseResponse = await poseService.likePose(poseId, userIdFromJWT);
  return res.send(likePoseResponse);

};

/**
 * API No. 3
 * API Name : 포즈 전체 조회
 * [GET] filme/pose
 */
exports.getPoses = async function(req, res) {
  const filter = req.query.filter;        // default : 최신순, 1. 최신 순, 2. 좋아요 순, 3. 추천 순(수정 필요)

  if (filter == 3) {
    const {sample, CF, evaluation} = require('nodeml');
    const userIdx = 1

    let likeInfoResult = await poseProvider.getLikeInfo();
    likeInfoResult = Object.values(JSON.parse(JSON.stringify(likeInfoResult)))

    const cf = new CF();

    cf.maxRelatedItem = 40;
    cf.maxRelatedUser = 40;

    cf.train(likeInfoResult, 'memberIdx', 'poseIdx', 'rate');

    let getPosesResult = cf.recommendToUser(userIdx, 100);      // userIdx에게 count개의 pose추천
    return res.send(getPosesResult)
  }

  const getPosesResult = await poseProvider.getPoses(filter);
  return res.send(getPosesResult);
}


/**
 * API No. 4
 * API Name : 특정 포즈 조회
 * [GET] filme/pose/:poseIdx
 */
exports.getOnePose = async function (req, res) {

  const poseIdx = req.params.poseIdx;
  //const memberIdx = req.verifiedToken.userId;

  const getOnePoseResponse = await poseProvider.getOnePose(poseIdx);

  return res.send(getOnePoseResponse);
};

/**
 * API No. 5
 * API Name : 포즈 등록
 * [POST] /filme/pose
 */
exports.insertPose = async function(req, res) {
  const memberIdx = 1;
  const imageURL = req.file.location;

  const insertPoseResult = await poseService.insertPose(memberIdx, imageURL);
  console.log(insertPoseResult);
  return res.send(insertPoseResult)
}


