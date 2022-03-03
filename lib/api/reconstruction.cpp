/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#include "reconstruction.hpp"

reconstruction::TplTrajectory reconstruction::ReconstructTrajectory(const cv::GArray<std::vector<cv::Point2f>>& pointHistory, const cv::GMat& cameraMatrix)
{
  return GReconstructTrajectory::on(pointHistory, cameraMatrix);
}
