/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#include "scene.hpp"

scene::TplDoubles scene::CalcSceneScore(const cv::GMat& prevImg,
                          const cv::GMat& nextImg,
                          const cv::GOpaque<double>& prevMafd,
                          unsigned int width,
                          unsigned int height)
{
  return GCalcSceneScore::on(prevImg, nextImg, prevMafd, width, height);
}
