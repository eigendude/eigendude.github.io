/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#pragma once

#include <opencv2/core/types.hpp>
#include <opencv2/gapi/garray.hpp>
#include <opencv2/gapi/gkernel.hpp>
#include <opencv2/gapi/gmat.hpp>
#include <utility> // std::tuple
#include <vector>

namespace reconstruction
{
  using TplTrajectory = std::tuple<cv::GMat, cv::GMat>;
  using TplTrajectoryDesc = std::tuple<cv::GMatDesc, cv::GMatDesc>;

  G_TYPED_KERNEL(GReconstructTrajectory, <TplTrajectory(cv::GArray<std::vector<cv::Point2f>>, cv::GMat)>,
      "com.trajectoryReconstruction.reconstructTrajectory")
  {
    static TplTrajectoryDesc outMeta(cv::GArrayDesc pointHistory, cv::GMatDesc cameraDesc)
    {
      return std::make_tuple(cv::empty_gmat_desc(), cameraDesc);
    }
  };

  /*!
   * Reconstruct the trajectory using 2d point correspondences
   *
   * \param pointHistory Input vector of vectors of 2d points (the inner vector is per image)
   * \param cameraMatrix Input camera matrix used as initial guess
   *
   * \return Tuple consisting of:
   *    * Output vector with the 3x4 projections matrices of each image
   *    * Output array with estimated 3d points
   *    * Output camera matrix
   */
  TplTrajectory ReconstructTrajectory(const cv::GArray<std::vector<cv::Point2f>>& pointHistory,
                                      const cv::GMat& cameraMatrix);
}
