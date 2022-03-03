/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#include "cpu_scene.hpp"

#include "api/scene.hpp"
#include "utils/image_utils.hpp"

#include <opencv2/gapi/cpu/gcpukernel.hpp>

namespace scene
{
  // Calculate the scene score given a frame and its previous frame
  GAPI_OCV_KERNEL(GCPUCalcSceneScore, GCalcSceneScore)
  {
    static void run(const cv::Mat& prevImg,
                    const cv::Mat& nextImg,
                    double prevMafd,
                    unsigned int width,
                    unsigned int height,
                    double& nextMafd,
                    double& sceneScore)
    {
      nextMafd = ImageUtils::CalcSceneMAFD(prevImg.data, nextImg.data, width, height);
      sceneScore = ImageUtils::CalcSceneScore(prevMafd, nextMafd);
    }
  };
}

cv::gapi::GKernelPackage scene::kernels()
{
  static auto pkg = cv::gapi::kernels
    < GCPUCalcSceneScore
    >();

  return pkg;
}
